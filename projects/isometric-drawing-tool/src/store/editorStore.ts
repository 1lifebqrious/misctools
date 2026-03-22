import { create } from "zustand";
import { DEFAULT_ZOOM } from "../constants";
import type {
  ClipboardSelection,
  DetectedFace,
  DraftSegment,
  EditorActions,
  FaceFill,
  Segment,
  SelectionOverlay,
  SelectionState,
  ToolMode,
  Viewport
} from "../types";
import {
  clampZoom,
  createSegmentId,
  findClosestSegment,
  gridPointFromId,
  isValidSegment,
  pointInPolygon
} from "../lib/geometry";

type HistorySnapshot = {
  segments: Segment[];
  fills: FaceFill[];
  selection: SelectionState;
};

type EditorState = {
  tool: ToolMode;
  color: string;
  opacity: number;
  segments: Segment[];
  fills: FaceFill[];
  viewport: Viewport;
  selection: SelectionState;
  draftSegment: DraftSegment | null;
  selectionOverlay: SelectionOverlay;
  clipboard: ClipboardSelection | null;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
} & EditorActions;

const initialViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: DEFAULT_ZOOM,
  width: 1024,
  height: 768
};

function pruneFillRecords(fills: FaceFill[], segments: Segment[]) {
  const segmentIds = new Set(segments.map((segment) => segment.id));
  return fills.filter((fill) => fill.boundarySegmentIds.every((id) => segmentIds.has(id)));
}

function snapshot(state: Pick<EditorState, "segments" | "fills" | "selection">): HistorySnapshot {
  return {
    segments: state.segments,
    fills: state.fills,
    selection: state.selection
  };
}

function pushHistory(state: EditorState) {
  return {
    past: [...state.past.slice(-19), snapshot(state)],
    future: []
  };
}

function buildClipboard(state: EditorState): ClipboardSelection | null {
  if (state.selection.segmentIds.length === 0 && state.selection.faceIds.length === 0) {
    return null;
  }

  const selectedSegmentIds = new Set(state.selection.segmentIds);
  const segments = state.segments.filter((segment) => selectedSegmentIds.has(segment.id));
  if (segments.length === 0) {
    return null;
  }

  const pointIds = new Set<string>();
  for (const segment of segments) {
    pointIds.add(segment.fromId);
    pointIds.add(segment.toId);
  }

  let anchorQ = Number.POSITIVE_INFINITY;
  let anchorR = Number.POSITIVE_INFINITY;
  for (const pointId of pointIds) {
    const point = gridPointFromId(pointId);
    anchorQ = Math.min(anchorQ, point.q);
    anchorR = Math.min(anchorR, point.r);
  }

  const fills = state.fills
    .filter((fill) => state.selection.faceIds.includes(fill.id))
    .filter((fill) => fill.boundarySegmentIds.every((segmentId) => selectedSegmentIds.has(segmentId)))
    .map((fill) => ({
      id: fill.id,
      boundarySegmentIds: fill.boundarySegmentIds,
      fill: fill.fill,
      opacity: fill.opacity
    }));

  return {
    segments: segments.map((segment) => {
      const from = gridPointFromId(segment.fromId);
      const to = gridPointFromId(segment.toId);
      return {
        id: segment.id,
        from: { q: from.q - anchorQ, r: from.r - anchorR },
        to: { q: to.q - anchorQ, r: to.r - anchorR },
        stroke: segment.stroke,
        opacity: segment.opacity
      };
    }),
    fills,
    anchor: { q: anchorQ, r: anchorR },
    pasteCount: 0
  };
}

export const useEditorStore = create<EditorState>((set) => ({
  tool: "select",
  color: "#263238",
  opacity: 1,
  segments: [],
  fills: [],
  viewport: initialViewport,
  selection: {
    segmentIds: [],
    faceIds: []
  },
  draftSegment: null,
  selectionOverlay: null,
  clipboard: null,
  past: [],
  future: [],
  setTool: (tool) => set({ tool, selectionOverlay: null, draftSegment: null }),
  setColor: (color) => set({ color }),
  setOpacity: (opacity) => set({ opacity }),
  setViewportSize: (width, height) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        width,
        height
      }
    })),
  setViewportPosition: (x, y) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        x,
        y
      }
    })),
  setZoom: (zoom) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        zoom: clampZoom(zoom)
      }
    })),
  addSegment: (from, to) =>
    set((state) => {
      if (!isValidSegment(from, to)) {
        return { draftSegment: null };
      }

      const id = createSegmentId(from, to);
      if (state.segments.some((segment) => segment.id === id)) {
        return { draftSegment: null };
      }

      const nextSegments = [
        ...state.segments,
        {
          id,
          fromId: from.id,
          toId: to.id,
          stroke: state.color,
          opacity: state.opacity
        }
      ];

      return {
        ...pushHistory(state),
        segments: nextSegments,
        fills: pruneFillRecords(state.fills, nextSegments),
        draftSegment: null
      };
    }),
  eraseSegmentAtPoint: (point, gridPoints, zoom) =>
    set((state) => {
      const closestSegment = findClosestSegment(point, state.segments, gridPoints, zoom);
      if (!closestSegment) {
        return {};
      }

      const nextSegments = state.segments.filter((segment) => segment.id !== closestSegment.id);
      const nextSelection = {
        segmentIds: state.selection.segmentIds.filter((id) => id !== closestSegment.id),
        faceIds: state.selection.faceIds
      };

      return {
        ...pushHistory(state),
        segments: nextSegments,
        fills: pruneFillRecords(state.fills, nextSegments),
        selection: nextSelection
      };
    }),
  deleteSelection: () =>
    set((state) => {
      if (state.selection.segmentIds.length === 0 && state.selection.faceIds.length === 0) {
        return { tool: "eraser" };
      }

      const selectedSegmentIds = new Set(state.selection.segmentIds);
      const selectedFaceIds = new Set(state.selection.faceIds);
      const nextSegments = state.segments.filter((segment) => !selectedSegmentIds.has(segment.id));
      const nextFills = pruneFillRecords(
        state.fills.filter((fill) => !selectedFaceIds.has(fill.id)),
        nextSegments
      );

      return {
        ...pushHistory(state),
        tool: "eraser",
        segments: nextSegments,
        fills: nextFills,
        selection: {
          segmentIds: [],
          faceIds: []
        }
      };
    }),
  clearSelection: () =>
    set({
      selection: {
        segmentIds: [],
        faceIds: []
      },
      selectionOverlay: null
    }),
  applySelection: (segmentIds, faceIds, additive) =>
    set((state) => ({
      selection: additive
        ? {
            segmentIds: [...new Set([...state.selection.segmentIds, ...segmentIds])],
            faceIds: [...new Set([...state.selection.faceIds, ...faceIds])]
          }
        : {
            segmentIds: [...new Set(segmentIds)],
            faceIds: [...new Set(faceIds)]
          },
      selectionOverlay: null
    })),
  selectAtPoint: (point, gridPoints, faces, zoom, additive) =>
    set((state) => {
      const hitSegment = findClosestSegment(point, state.segments, gridPoints, zoom);
      const hitFace =
        hitSegment === null
          ? faces.find((face) => pointInPolygon(point, face.polygon)) ?? null
          : null;

      if (!hitSegment && !hitFace) {
        return additive
          ? {}
          : {
              selection: {
                segmentIds: [],
                faceIds: []
              }
            };
      }

      const nextSegmentIds = hitSegment ? [hitSegment.id] : hitFace ? hitFace.boundarySegmentIds : [];
      const nextFaceIds = hitFace ? [hitFace.id] : [];
      return {
        selection: additive
          ? {
              segmentIds: [...new Set([...state.selection.segmentIds, ...nextSegmentIds])],
              faceIds: [...new Set([...state.selection.faceIds, ...nextFaceIds])]
            }
          : {
              segmentIds: nextSegmentIds,
              faceIds: nextFaceIds
            }
      };
    }),
  applyFillToFace: (face: DetectedFace) =>
    set((state) => {
      const nextFill: FaceFill = {
        id: face.id,
        boundarySegmentIds: face.boundarySegmentIds,
        fill: state.color,
        opacity: state.opacity
      };
      const remaining = state.fills.filter((fill) => fill.id !== face.id);
      return {
        ...pushHistory(state),
        fills: [...remaining, nextFill]
      };
    }),
  moveSelectionByDelta: (dq, dr) =>
    set((state) => {
      if ((dq === 0 && dr === 0) || state.selection.segmentIds.length === 0) {
        return {};
      }

      const selectedSegmentIds = new Set(state.selection.segmentIds);
      const movedSegmentIdMap = new Map<string, string>();
      const nextSegments = state.segments.map((segment) => {
        if (!selectedSegmentIds.has(segment.id)) {
          return segment;
        }

        const from = gridPointFromId(segment.fromId);
        const to = gridPointFromId(segment.toId);
        const nextFrom = gridPointFromId(`${from.q + dq},${from.r + dr}`);
        const nextTo = gridPointFromId(`${to.q + dq},${to.r + dr}`);
        const nextId = createSegmentId(nextFrom, nextTo);
        movedSegmentIdMap.set(segment.id, nextId);
        return {
          ...segment,
          id: nextId,
          fromId: nextFrom.id,
          toId: nextTo.id
        };
      });

      const dedupedSegments = [...new Map(nextSegments.map((segment) => [segment.id, segment])).values()];
      const nextFills = pruneFillRecords(
        state.fills.map((fill) => {
          const allMoved = fill.boundarySegmentIds.every((id) => movedSegmentIdMap.has(id));
          if (!allMoved) {
            return fill;
          }
          const boundarySegmentIds = fill.boundarySegmentIds.map((id) => movedSegmentIdMap.get(id)!);
          return {
            ...fill,
            id: [...boundarySegmentIds].sort().join("|"),
            boundarySegmentIds
          };
        }),
        dedupedSegments
      );

      return {
        ...pushHistory(state),
        segments: dedupedSegments,
        fills: nextFills,
        selection: {
          segmentIds: state.selection.segmentIds.map((id) => movedSegmentIdMap.get(id) ?? id),
          faceIds: state.selection.faceIds.map((id) => {
            const boundaryIds = id.split("|");
            if (!boundaryIds.every((segmentId) => movedSegmentIdMap.has(segmentId))) {
              return id;
            }
            return boundaryIds.map((segmentId) => movedSegmentIdMap.get(segmentId)!).sort().join("|");
          })
        }
      };
    }),
  copySelection: () =>
    set((state) => ({
      clipboard: buildClipboard(state)
    })),
  cutSelection: () =>
    set((state) => {
      const clipboard = buildClipboard(state);
      if (!clipboard) {
        return {};
      }

      const selectedSegmentIds = new Set(state.selection.segmentIds);
      const selectedFaceIds = new Set(state.selection.faceIds);
      const nextSegments = state.segments.filter((segment) => !selectedSegmentIds.has(segment.id));
      const nextFills = pruneFillRecords(
        state.fills.filter((fill) => !selectedFaceIds.has(fill.id)),
        nextSegments
      );

      return {
        ...pushHistory(state),
        clipboard,
        segments: nextSegments,
        fills: nextFills,
        selection: {
          segmentIds: [],
          faceIds: []
        }
      };
    }),
  pasteSelection: () =>
    set((state) => {
      if (!state.clipboard || state.clipboard.segments.length === 0) {
        return {};
      }

      const offset = state.clipboard.pasteCount + 1;
      const pastedSegments: Segment[] = [];
      const oldToNewSegmentIds = new Map<string, string>();

      for (const item of state.clipboard.segments) {
        const from = gridPointFromId(
          `${state.clipboard.anchor.q + item.from.q + offset},${state.clipboard.anchor.r + item.from.r + offset}`
        );
        const to = gridPointFromId(
          `${state.clipboard.anchor.q + item.to.q + offset},${state.clipboard.anchor.r + item.to.r + offset}`
        );
        const id = createSegmentId(from, to);
        oldToNewSegmentIds.set(item.id, id);
        pastedSegments.push({
          id,
          fromId: from.id,
          toId: to.id,
          stroke: item.stroke,
          opacity: item.opacity
        });
      }

      const mergedSegments = [...state.segments, ...pastedSegments];
      const dedupedSegments = [...new Map(mergedSegments.map((segment) => [segment.id, segment])).values()];

      const pastedFills: FaceFill[] = state.clipboard.fills
        .map((fill) => {
          const boundarySegmentIds = fill.boundarySegmentIds
            .map((segmentId) => oldToNewSegmentIds.get(segmentId))
            .filter((segmentId): segmentId is string => Boolean(segmentId));
          if (boundarySegmentIds.length !== fill.boundarySegmentIds.length) {
            return null;
          }
          return {
            id: [...boundarySegmentIds].sort().join("|"),
            boundarySegmentIds,
            fill: fill.fill,
            opacity: fill.opacity
          };
        })
        .filter((fill): fill is FaceFill => fill !== null);

      const nextFills = pruneFillRecords(
        [...state.fills.filter((fill) => !pastedFills.some((pasted) => pasted.id === fill.id)), ...pastedFills],
        dedupedSegments
      );

      return {
        ...pushHistory(state),
        segments: dedupedSegments,
        fills: nextFills,
        selection: {
          segmentIds: pastedSegments.map((segment) => segment.id),
          faceIds: pastedFills.map((fill) => fill.id)
        },
        clipboard: {
          ...state.clipboard,
          pasteCount: offset
        },
        tool: "select"
      };
    }),
  setDraftSegment: (draftSegment) => set({ draftSegment }),
  setSelectionOverlay: (selectionOverlay) => set({ selectionOverlay }),
  pruneFills: () =>
    set((state) => ({
      fills: pruneFillRecords(state.fills, state.segments)
    })),
  undo: () =>
    set((state) => {
      const previous = state.past[state.past.length - 1];
      if (!previous) {
        return {};
      }
      return {
        segments: previous.segments,
        fills: previous.fills,
        selection: previous.selection,
        past: state.past.slice(0, -1),
        future: [snapshot(state), ...state.future]
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) {
        return {};
      }
      return {
        segments: next.segments,
        fills: next.fills,
        selection: next.selection,
        past: [...state.past, snapshot(state)],
        future: state.future.slice(1)
      };
    })
}));

export function getFilledFaceMap(fills: FaceFill[]) {
  return new Map(fills.map((fill) => [fill.id, { color: fill.fill, opacity: fill.opacity }]));
}
