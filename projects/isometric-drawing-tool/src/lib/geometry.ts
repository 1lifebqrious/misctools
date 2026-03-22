import {
  GRID_SPACING,
  GRID_VERTICAL_STEP,
  MAX_ZOOM,
  MIN_ZOOM,
  POINTER_HIT_SCREEN_PX
} from "../constants";
import type { GridPoint, Point, Segment, Viewport } from "../types";

const GRID_HALF_SPACING = GRID_SPACING / 2;

export function worldFromAxial(q: number, r: number): Point {
  return {
    x: GRID_HALF_SPACING * (q - r),
    y: GRID_VERTICAL_STEP * (q + r)
  };
}

export function createGridPoint(q: number, r: number): GridPoint {
  const point = worldFromAxial(q, r);
  return {
    id: `${q},${r}`,
    q,
    r,
    ...point
  };
}

export function gridPointFromId(pointId: string) {
  const [q, r] = pointId.split(",").map(Number);
  return createGridPoint(q, r);
}

export function axialFromWorld(point: Point) {
  const normalizedX = point.x / GRID_HALF_SPACING;
  const normalizedY = point.y / GRID_VERTICAL_STEP;
  const q = (normalizedX + normalizedY) / 2;
  const r = (normalizedY - normalizedX) / 2;
  return { q, r };
}

export function nearestGridPoint(point: Point): GridPoint {
  const approx = axialFromWorld(point);
  const qBase = Math.round(approx.q);
  const rBase = Math.round(approx.r);

  let best = createGridPoint(qBase, rBase);
  let bestDistance = distanceSquared(point, best);

  for (let dq = -1; dq <= 1; dq += 1) {
    for (let dr = -1; dr <= 1; dr += 1) {
      const candidate = createGridPoint(qBase + dq, rBase + dr);
      const currentDistance = distanceSquared(point, candidate);
      if (currentDistance < bestDistance) {
        best = candidate;
        bestDistance = currentDistance;
      }
    }
  }

  return best;
}

export function buildGridPointMap(segments: Segment[]) {
  const points = new Map<string, GridPoint>();
  for (const segment of segments) {
    const [fromQ, fromR] = segment.fromId.split(",").map(Number);
    const [toQ, toR] = segment.toId.split(",").map(Number);
    points.set(segment.fromId, createGridPoint(fromQ, fromR));
    points.set(segment.toId, createGridPoint(toQ, toR));
  }
  return points;
}

export function isValidSegment(from: GridPoint, to: GridPoint) {
  const dq = to.q - from.q;
  const dr = to.r - from.r;
  if (dq === 0 && dr === 0) {
    return false;
  }
  return dq === 0 || dr === 0 || dq === dr;
}

export function createSegmentId(from: GridPoint, to: GridPoint) {
  return [from.id, to.id].sort().join("|");
}

export function distanceSquared(a: Point, b: Point) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function distance(a: Point, b: Point) {
  return Math.sqrt(distanceSquared(a, b));
}

export function screenToWorld(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.width / 2) / viewport.zoom + viewport.x,
    y: (point.y - viewport.height / 2) / viewport.zoom + viewport.y
  };
}

export function worldToScreen(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.x) * viewport.zoom + viewport.width / 2,
    y: (point.y - viewport.y) * viewport.zoom + viewport.height / 2
  };
}

export function clampZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function zoomViewportAtPoint(
  viewport: Viewport,
  screenPoint: Point,
  requestedZoom: number
): Viewport {
  const zoom = clampZoom(requestedZoom);
  const worldPoint = screenToWorld(screenPoint, viewport);
  return {
    ...viewport,
    zoom,
    x: worldPoint.x - (screenPoint.x - viewport.width / 2) / zoom,
    y: worldPoint.y - (screenPoint.y - viewport.height / 2) / zoom
  };
}

export function pointToSegmentDistance(point: Point, start: Point, end: Point) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    return distance(point, start);
  }

  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy))
  );
  return distance(point, {
    x: start.x + dx * t,
    y: start.y + dy * t
  });
}

export function getVisibleGridPoints(viewport: Viewport) {
  const padding = GRID_SPACING * 2;
  const worldCorners = [
    screenToWorld({ x: -padding, y: -padding }, viewport),
    screenToWorld({ x: viewport.width + padding, y: -padding }, viewport),
    screenToWorld({ x: -padding, y: viewport.height + padding }, viewport),
    screenToWorld({ x: viewport.width + padding, y: viewport.height + padding }, viewport)
  ];

  let minQ = Number.POSITIVE_INFINITY;
  let maxQ = Number.NEGATIVE_INFINITY;
  let minR = Number.POSITIVE_INFINITY;
  let maxR = Number.NEGATIVE_INFINITY;

  for (const corner of worldCorners) {
    const axial = axialFromWorld(corner);
    minQ = Math.min(minQ, Math.floor(axial.q) - 2);
    maxQ = Math.max(maxQ, Math.ceil(axial.q) + 2);
    minR = Math.min(minR, Math.floor(axial.r) - 2);
    maxR = Math.max(maxR, Math.ceil(axial.r) + 2);
  }

  const points: GridPoint[] = [];
  for (let q = minQ; q <= maxQ; q += 1) {
    for (let r = minR; r <= maxR; r += 1) {
      points.push(createGridPoint(q, r));
    }
  }
  return points;
}

export function segmentMidpoint(segment: Segment, points: Map<string, GridPoint>) {
  const start = points.get(segment.fromId);
  const end = points.get(segment.toId);
  if (!start || !end) {
    return { x: 0, y: 0 };
  }
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2
  };
}

export function findClosestSegment(
  point: Point,
  segments: Segment[],
  points: Map<string, GridPoint>,
  zoom: number
) {
  let closestSegment: Segment | null = null;
  let smallestDistance = Number.POSITIVE_INFINITY;

  for (const segment of segments) {
    const start = points.get(segment.fromId);
    const end = points.get(segment.toId);
    if (!start || !end) {
      continue;
    }
    const distance = pointToSegmentDistance(point, start, end);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestSegment = segment;
    }
  }

  if (!closestSegment || smallestDistance > hitRadiusForZoom(zoom)) {
    return null;
  }

  return closestSegment;
}

export function selectionRect(origin: Point, current: Point) {
  return {
    minX: Math.min(origin.x, current.x),
    maxX: Math.max(origin.x, current.x),
    minY: Math.min(origin.y, current.y),
    maxY: Math.max(origin.y, current.y)
  };
}

export function pointInRect(point: Point, rect: ReturnType<typeof selectionRect>) {
  return (
    point.x >= rect.minX &&
    point.x <= rect.maxX &&
    point.y >= rect.minY &&
    point.y <= rect.maxY
  );
}

export function polygonArea(points: Point[]) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }
  return area / 2;
}

export function polygonCentroid(points: Point[]): Point {
  const area = polygonArea(points) || 1;
  let x = 0;
  let y = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const factor = current.x * next.y - next.x * current.y;
    x += (current.x + next.x) * factor;
    y += (current.y + next.y) * factor;
  }
  return {
    x: x / (6 * area),
    y: y / (6 * area)
  };
}

export function pointInPolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let currentIndex = 0, previousIndex = polygon.length - 1; currentIndex < polygon.length; previousIndex = currentIndex++) {
    const current = polygon[currentIndex];
    const previous = polygon[previousIndex];
    const intersects =
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y) +
          current.x;

    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

export function hitRadiusForZoom(zoom: number) {
  return POINTER_HIT_SCREEN_PX / zoom;
}
