import {
  CANVAS_BACKGROUND,
  GRID_DOT_RADIUS,
  SELECTION_COLOR
} from "../constants";
import type {
  DetectedFace,
  DraftSegment,
  GridPoint,
  Point,
  Segment,
  SelectionOverlay,
  SelectionState,
  Viewport
} from "../types";
import { withOpacity } from "./color";
import { createGridPoint, getVisibleGridPoints, worldToScreen } from "./geometry";

type RenderSceneArgs = {
  ctx: CanvasRenderingContext2D;
  viewport: Viewport;
  segments: Segment[];
  gridPoints: Map<string, GridPoint>;
  fills: Map<string, { color: string; opacity: number }>;
  faces: DetectedFace[];
  selection: SelectionState;
  draftSegment: DraftSegment | null;
  overlay: SelectionOverlay;
};

function drawSelectionOutline(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length === 0) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = SELECTION_COLOR;
  ctx.fillStyle = "rgba(19, 104, 206, 0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawGhostSelection(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  segments: Segment[],
  faces: DetectedFace[],
  selection: SelectionState,
  delta: { dq: number; dr: number },
  gridPoints: Map<string, GridPoint>
) {
  const movedPointCache = new Map<string, GridPoint>();
  const movedPoint = (id: string) => {
    if (movedPointCache.has(id)) {
      return movedPointCache.get(id)!;
    }
    const [q, r] = id.split(",").map(Number);
    const base = gridPoints.get(id) ?? createGridPoint(q, r);
    const next = createGridPoint(base.q + delta.dq, base.r + delta.dr);
    movedPointCache.set(id, next);
    return next;
  };

  ctx.save();
  ctx.globalAlpha = 0.45;

  for (const face of faces) {
    if (!selection.faceIds.includes(face.id)) {
      continue;
    }
    const points = face.pointIds.map((pointId) => worldToScreen(movedPoint(pointId), viewport));
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) {
      ctx.lineTo(points[index].x, points[index].y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(19, 104, 206, 0.16)";
    ctx.strokeStyle = "rgba(19, 104, 206, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.fill();
    ctx.stroke();
  }

  for (const segment of segments) {
    if (!selection.segmentIds.includes(segment.id)) {
      continue;
    }
    const start = worldToScreen(movedPoint(segment.fromId), viewport);
    const end = worldToScreen(movedPoint(segment.toId), viewport);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = "rgba(19, 104, 206, 0.9)";
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 7]);
    ctx.stroke();
  }

  ctx.restore();
}

export function renderScene({
  ctx,
  viewport,
  segments,
  gridPoints,
  fills,
  faces,
  selection,
  draftSegment,
  overlay
}: RenderSceneArgs) {
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  ctx.fillStyle = CANVAS_BACKGROUND;
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  for (const face of faces) {
    const fill = fills.get(face.id);
    if (!fill) {
      continue;
    }
    const points = face.polygon.map((point) => worldToScreen(point, viewport));
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) {
      ctx.lineTo(points[index].x, points[index].y);
    }
    ctx.closePath();
    ctx.fillStyle = withOpacity(fill.color, fill.opacity);
    ctx.fill();
    ctx.restore();
  }

  const dots = getVisibleGridPoints(viewport);
  ctx.save();
  ctx.fillStyle = "rgba(31, 41, 51, 0.18)";
  for (const point of dots) {
    const screen = worldToScreen(point, viewport);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, GRID_DOT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  for (const segment of segments) {
    const start = gridPoints.get(segment.fromId);
    const end = gridPoints.get(segment.toId);
    if (!start || !end) {
      continue;
    }
    const startScreen = worldToScreen(start, viewport);
    const endScreen = worldToScreen(end, viewport);
    const selected = selection.segmentIds.includes(segment.id);
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = withOpacity(segment.stroke, segment.opacity);
    ctx.lineWidth = selected ? 6 : 4;
    ctx.beginPath();
    ctx.moveTo(startScreen.x, startScreen.y);
    ctx.lineTo(endScreen.x, endScreen.y);
    ctx.stroke();

    if (selected) {
      ctx.strokeStyle = "rgba(19, 104, 206, 0.65)";
      ctx.lineWidth = 10;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(startScreen.x, startScreen.y);
      ctx.lineTo(endScreen.x, endScreen.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  for (const face of faces) {
    if (!selection.faceIds.includes(face.id)) {
      continue;
    }
    drawSelectionOutline(
      ctx,
      face.polygon.map((point) => worldToScreen(point, viewport))
    );
  }

  if (draftSegment) {
    ctx.save();
    ctx.strokeStyle = "rgba(19, 104, 206, 0.75)";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    const from = worldToScreen(draftSegment.from, viewport);
    const to = worldToScreen(draftSegment.to, viewport);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  if (overlay?.type === "rectangle") {
    const origin = worldToScreen(overlay.data.origin, viewport);
    const current = worldToScreen(overlay.data.current, viewport);
    ctx.save();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = SELECTION_COLOR;
    ctx.fillStyle = "rgba(19, 104, 206, 0.08)";
    ctx.strokeRect(
      Math.min(origin.x, current.x),
      Math.min(origin.y, current.y),
      Math.abs(current.x - origin.x),
      Math.abs(current.y - origin.y)
    );
    ctx.fillRect(
      Math.min(origin.x, current.x),
      Math.min(origin.y, current.y),
      Math.abs(current.x - origin.x),
      Math.abs(current.y - origin.y)
    );
    ctx.restore();
  }

  if (overlay?.type === "lasso" && overlay.data.points.length > 1) {
    const points = overlay.data.points.map((point) => worldToScreen(point, viewport));
    ctx.save();
    ctx.setLineDash([9, 7]);
    ctx.strokeStyle = SELECTION_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) {
      ctx.lineTo(points[index].x, points[index].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  if (overlay?.type === "move" && (overlay.data.dq !== 0 || overlay.data.dr !== 0)) {
    drawGhostSelection(ctx, viewport, segments, faces, selection, overlay.data, gridPoints);
  }
}
