import { useEffect, useRef } from "react";
import { MAX_ZOOM, MIN_ZOOM } from "../constants";
import {
  findClosestSegment,
  nearestGridPoint,
  pointInPolygon,
  pointInRect,
  screenToWorld,
  segmentMidpoint,
  selectionRect,
  zoomViewportAtPoint
} from "../lib/geometry";
import { renderScene } from "../lib/render";
import { getFilledFaceMap, useEditorStore } from "../store/editorStore";
import type {
  DetectedFace,
  GridPoint,
  Point,
  ToolMode,
  Viewport
} from "../types";

type EditorCanvasProps = {
  faces: DetectedFace[];
  gridPoints: Map<string, GridPoint>;
};

type DragState =
  | {
      type: "pen";
      start: GridPoint;
    }
  | {
      type: "moveSelection";
      start: GridPoint;
    }
  | {
      type: "pan";
      pointerStart: Point;
      viewportStart: Viewport;
    }
  | {
      type: "rectangle";
      origin: Point;
    }
  | {
      type: "lasso";
      points: Point[];
    }
  | null;

type PinchState = {
  initialDistance: number;
  initialZoom: number;
  initialViewport: Viewport;
  initialCenter: Point;
  initialWorldAtCenter: Point;
};

function distanceBetween(left: Point, right: Point) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function centerBetween(left: Point, right: Point): Point {
  return {
    x: (left.x + right.x) / 2,
    y: (left.y + right.y) / 2
  };
}

function isAdditiveSelection(event: PointerEvent) {
  return event.shiftKey || event.metaKey || event.ctrlKey;
}

function toolHint(tool: ToolMode) {
  switch (tool) {
    case "select":
      return "Click a line or face to select it. Drag a selected shape to move it. Hold Shift and drag to pan.";
    case "pen":
      return "Tap or drag from dot to dot. Valid lines go vertical or along either isometric diagonal. Hold Shift and drag to pan.";
    case "eraser":
      return "Tap a line to erase it. Filled faces bounded by that line are removed too. Hold Shift and drag to pan.";
    case "lasso":
      return "Trace around lines or faces to select them. Hold Command or Control to add. Hold Shift and drag to pan.";
    case "rectangleSelect":
      return "Drag a box to select lines or faces. Hold Command or Control to add. Hold Shift and drag to pan.";
    case "fill":
      return "Tap a closed face to color it with the selected color and opacity. Hold Shift and drag to pan.";
    case "pan":
      return "Drag to pan. Mouse wheel or pinch to zoom.";
    default:
      return "";
  }
}

function EditorCanvas({ faces, gridPoints }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState>(null);
  const pinchStateRef = useRef<PinchState | null>(null);
  const activePointersRef = useRef<Map<number, Point>>(new Map());
  const spacePressedRef = useRef(false);

  const tool = useEditorStore((state) => state.tool);
  const segments = useEditorStore((state) => state.segments);
  const fills = useEditorStore((state) => state.fills);
  const viewport = useEditorStore((state) => state.viewport);
  const selection = useEditorStore((state) => state.selection);
  const draftSegment = useEditorStore((state) => state.draftSegment);
  const selectionOverlay = useEditorStore((state) => state.selectionOverlay);
  const setViewportSize = useEditorStore((state) => state.setViewportSize);
  const setViewportPosition = useEditorStore((state) => state.setViewportPosition);
  const setZoom = useEditorStore((state) => state.setZoom);
  const addSegment = useEditorStore((state) => state.addSegment);
  const eraseSegmentAtPoint = useEditorStore((state) => state.eraseSegmentAtPoint);
  const applySelection = useEditorStore((state) => state.applySelection);
  const applyFillToFace = useEditorStore((state) => state.applyFillToFace);
  const deleteSelection = useEditorStore((state) => state.deleteSelection);
  const moveSelectionByDelta = useEditorStore((state) => state.moveSelectionByDelta);
  const selectAtPoint = useEditorStore((state) => state.selectAtPoint);
  const setDraftSegment = useEditorStore((state) => state.setDraftSegment);
  const setSelectionOverlay = useEditorStore((state) => state.setSelectionOverlay);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const setTool = useEditorStore((state) => state.setTool);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const copySelection = useEditorStore((state) => state.copySelection);
  const cutSelection = useEditorStore((state) => state.cutSelection);
  const pasteSelection = useEditorStore((state) => state.pasteSelection);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        spacePressedRef.current = true;
      }
      if (event.key === "Escape") {
        dragStateRef.current = null;
        pinchStateRef.current = null;
        setDraftSegment(null);
        setSelectionOverlay(null);
        clearSelection();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copySelection();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "x") {
        event.preventDefault();
        cutSelection();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteSelection();
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key.toLowerCase() === "y" ||
          (event.shiftKey && event.key.toLowerCase() === "z"))
      ) {
        event.preventDefault();
        redo();
      }
      if (event.key === "+" || event.key === "=") {
        setZoom(Math.min(MAX_ZOOM, viewport.zoom + 0.1));
      }
      if (event.key === "-") {
        setZoom(Math.max(MIN_ZOOM, viewport.zoom - 0.1));
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        spacePressedRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    clearSelection,
    copySelection,
    cutSelection,
    pasteSelection,
    redo,
    setDraftSegment,
    setSelectionOverlay,
    setZoom,
    undo,
    viewport.zoom
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      setViewportSize(width, height);
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [setViewportSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderScene({
      ctx: context,
      viewport,
      segments,
      gridPoints,
      fills: getFilledFaceMap(fills),
      faces,
      selection,
      draftSegment,
      overlay: selectionOverlay
    });
  }, [draftSegment, faces, fills, gridPoints, segments, selection, selectionOverlay, viewport]);

  const getLocalPoint = (
    event: React.PointerEvent<HTMLCanvasElement> | React.WheelEvent<HTMLCanvasElement>
  ): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const finishSelection = (additive: boolean) => {
    const dragState = dragStateRef.current;
    if (!dragState) {
      return;
    }

    if (dragState.type === "rectangle") {
      const rect = selectionRect(dragState.origin, selectionOverlay?.type === "rectangle" ? selectionOverlay.data.current : dragState.origin);
      const directlySelectedSegmentIds = segments
        .filter((segment) => pointInRect(segmentMidpoint(segment, gridPoints), rect))
        .map((segment) => segment.id);
      const selectedFaces = faces.filter((face) => pointInRect(face.centroid, rect));
      const segmentIds = [
        ...directlySelectedSegmentIds,
        ...selectedFaces.flatMap((face) => face.boundarySegmentIds)
      ];
      const faceIds = selectedFaces.map((face) => face.id);
      applySelection(segmentIds, faceIds, additive);
      setTool("select");
    }

    if (dragState.type === "lasso" && selectionOverlay?.type === "lasso") {
      const polygon = selectionOverlay.data.points;
      const directlySelectedSegmentIds = segments
        .filter((segment) => pointInPolygon(segmentMidpoint(segment, gridPoints), polygon))
        .map((segment) => segment.id);
      const selectedFaces = faces.filter((face) => pointInPolygon(face.centroid, polygon));
      const segmentIds = [
        ...directlySelectedSegmentIds,
        ...selectedFaces.flatMap((face) => face.boundarySegmentIds)
      ];
      const faceIds = selectedFaces.map((face) => face.id);
      applySelection(segmentIds, faceIds, additive);
      setTool("select");
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const localPoint = getLocalPoint(event);
    activePointersRef.current.set(event.pointerId, localPoint);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (event.pointerType === "touch" && activePointersRef.current.size === 2) {
      const [first, second] = [...activePointersRef.current.values()];
      const center = centerBetween(first, second);
      pinchStateRef.current = {
        initialDistance: distanceBetween(first, second),
        initialZoom: viewport.zoom,
        initialViewport: viewport,
        initialCenter: center,
        initialWorldAtCenter: screenToWorld(center, viewport)
      };
      dragStateRef.current = null;
      setDraftSegment(null);
      setSelectionOverlay(null);
      return;
    }

    const worldPoint = screenToWorld(localPoint, viewport);
    const shouldPan =
      tool === "pan" || spacePressedRef.current || event.shiftKey || event.button === 1;

    if (shouldPan) {
      dragStateRef.current = {
        type: "pan",
        pointerStart: localPoint,
        viewportStart: viewport
      };
      return;
    }

    if (tool === "pen") {
      const snapped = nearestGridPoint(worldPoint);
      dragStateRef.current = {
        type: "pen",
        start: snapped
      };
      setDraftSegment({ from: snapped, to: snapped });
      return;
    }

    if (tool === "eraser") {
      if (selection.segmentIds.length > 0 || selection.faceIds.length > 0) {
        deleteSelection();
        return;
      }
      eraseSegmentAtPoint(worldPoint, gridPoints, viewport.zoom);
      return;
    }

    if (tool === "select") {
      const additive = isAdditiveSelection(event.nativeEvent) && !event.shiftKey;
      const hitSegment = findClosestSegment(worldPoint, segments, gridPoints, viewport.zoom);
      const hitFace =
        hitSegment === null
          ? faces.find((face) => pointInPolygon(worldPoint, face.polygon)) ?? null
          : null;
      const clickedSelectedFace = faces.some(
        (face) => selection.faceIds.includes(face.id) && pointInPolygon(worldPoint, face.polygon)
      );
      const clickedSelectedSegment =
        hitSegment !== null && selection.segmentIds.includes(hitSegment.id);
      selectAtPoint(worldPoint, gridPoints, faces, viewport.zoom, additive);
      const nowSelection = useEditorStore.getState().selection;
      const isInsideSelection =
        clickedSelectedFace ||
        clickedSelectedSegment ||
        (hitFace !== null && nowSelection.faceIds.includes(hitFace.id));
      if (
        isInsideSelection &&
        (nowSelection.segmentIds.length > 0 || nowSelection.faceIds.length > 0)
      ) {
        dragStateRef.current = {
          type: "moveSelection",
          start: nearestGridPoint(worldPoint)
        };
      }
      return;
    }

    if (tool === "fill") {
      const face = faces.find((candidate) => pointInPolygon(worldPoint, candidate.polygon));
      if (face) {
        applyFillToFace(face);
      }
      return;
    }

    if (tool === "rectangleSelect") {
      dragStateRef.current = {
        type: "rectangle",
        origin: worldPoint
      };
      setSelectionOverlay({
        type: "rectangle",
        data: {
          origin: worldPoint,
          current: worldPoint
        }
      });
      return;
    }

    if (tool === "lasso") {
      dragStateRef.current = {
        type: "lasso",
        points: [worldPoint]
      };
      setSelectionOverlay({
        type: "lasso",
        data: {
          points: [worldPoint]
        }
      });
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const localPoint = getLocalPoint(event);
    activePointersRef.current.set(event.pointerId, localPoint);

    if (pinchStateRef.current && activePointersRef.current.size >= 2) {
      const [first, second] = [...activePointersRef.current.values()];
      const center = centerBetween(first, second);
      const nextZoom = Math.min(
        MAX_ZOOM,
        Math.max(
          MIN_ZOOM,
          pinchStateRef.current.initialZoom *
            (distanceBetween(first, second) / pinchStateRef.current.initialDistance)
        )
      );
      const nextViewport = zoomViewportAtPoint(
        pinchStateRef.current.initialViewport,
        pinchStateRef.current.initialCenter,
        nextZoom
      );
      setZoom(nextViewport.zoom);
      setViewportPosition(
        pinchStateRef.current.initialWorldAtCenter.x -
          (center.x - viewport.width / 2) / nextZoom,
        pinchStateRef.current.initialWorldAtCenter.y -
          (center.y - viewport.height / 2) / nextZoom
      );
      return;
    }

    const dragState = dragStateRef.current;
    if (!dragState) {
      return;
    }

    const worldPoint = screenToWorld(localPoint, viewport);

    if (dragState.type === "pan") {
      const dx = localPoint.x - dragState.pointerStart.x;
      const dy = localPoint.y - dragState.pointerStart.y;
      setViewportPosition(
        dragState.viewportStart.x - dx / dragState.viewportStart.zoom,
        dragState.viewportStart.y - dy / dragState.viewportStart.zoom
      );
      return;
    }

    if (dragState.type === "pen") {
      const snapped = nearestGridPoint(worldPoint);
      setDraftSegment({
        from: dragState.start,
        to: snapped
      });
      return;
    }

    if (dragState.type === "moveSelection") {
      const current = nearestGridPoint(worldPoint);
      setSelectionOverlay({
        type: "move",
        data: {
          dq: current.q - dragState.start.q,
          dr: current.r - dragState.start.r
        }
      });
      return;
    }

    if (dragState.type === "rectangle") {
      setSelectionOverlay({
        type: "rectangle",
        data: {
          origin: dragState.origin,
          current: worldPoint
        }
      });
      return;
    }

    if (dragState.type === "lasso") {
      const last = dragState.points[dragState.points.length - 1];
      if (Math.hypot(last.x - worldPoint.x, last.y - worldPoint.y) > 6) {
        const points = [...dragState.points, worldPoint];
        dragStateRef.current = {
          type: "lasso",
          points
        };
        setSelectionOverlay({
          type: "lasso",
          data: {
            points
          }
        });
      }
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const localPoint = getLocalPoint(event);
    const worldPoint = screenToWorld(localPoint, viewport);
    const dragState = dragStateRef.current;

    if (dragState?.type === "pen") {
      const snapped = nearestGridPoint(worldPoint);
      addSegment(dragState.start, snapped);
    }

    if (dragState?.type === "moveSelection") {
      const end = nearestGridPoint(worldPoint);
      moveSelectionByDelta(end.q - dragState.start.q, end.r - dragState.start.r);
    }

    if (dragState?.type === "rectangle" || dragState?.type === "lasso") {
      finishSelection(isAdditiveSelection(event.nativeEvent));
    }

    activePointersRef.current.delete(event.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchStateRef.current = null;
    }
    dragStateRef.current = null;
    setDraftSegment(null);
    setSelectionOverlay(null);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.delete(event.pointerId);
    dragStateRef.current = null;
    pinchStateRef.current = null;
    setDraftSegment(null);
    setSelectionOverlay(null);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const localPoint = getLocalPoint(event);
    const nextViewport = zoomViewportAtPoint(
      viewport,
      localPoint,
      viewport.zoom * (event.deltaY > 0 ? 0.92 : 1.08)
    );
    setZoom(nextViewport.zoom);
    setViewportPosition(nextViewport.x, nextViewport.y);
  };

  return (
    <div className="canvas-panel" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="canvas-surface"
        aria-label="Isometric drawing canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onWheel={handleWheel}
      />
      <aside className="canvas-help">{toolHint(tool)}</aside>
    </div>
  );
}

export default EditorCanvas;
