import type { DetectedFace, GridPoint, Point, Segment } from "../types";
import { polygonArea, polygonCentroid } from "./geometry";

type DirectedEdge = {
  from: string;
  to: string;
  segmentId: string;
};

function edgeKey(from: string, to: string) {
  return `${from}->${to}`;
}

function sortedNeighbors(pointId: string, neighbors: string[], gridPoints: Map<string, GridPoint>) {
  const origin = gridPoints.get(pointId);
  if (!origin) {
    return [];
  }

  return [...neighbors].sort((leftId, rightId) => {
    const left = gridPoints.get(leftId);
    const right = gridPoints.get(rightId);
    if (!left || !right) {
      return 0;
    }
    const leftAngle = Math.atan2(left.y - origin.y, left.x - origin.x);
    const rightAngle = Math.atan2(right.y - origin.y, right.x - origin.x);
    return leftAngle - rightAngle;
  });
}

function segmentLookup(segments: Segment[]) {
  const byDirection = new Map<string, string>();
  for (const segment of segments) {
    byDirection.set(edgeKey(segment.fromId, segment.toId), segment.id);
    byDirection.set(edgeKey(segment.toId, segment.fromId), segment.id);
  }
  return byDirection;
}

export function detectFaces(segments: Segment[], gridPoints: Map<string, GridPoint>): DetectedFace[] {
  if (segments.length < 3) {
    return [];
  }

  const adjacency = new Map<string, Set<string>>();
  for (const segment of segments) {
    if (!adjacency.has(segment.fromId)) {
      adjacency.set(segment.fromId, new Set());
    }
    if (!adjacency.has(segment.toId)) {
      adjacency.set(segment.toId, new Set());
    }
    adjacency.get(segment.fromId)!.add(segment.toId);
    adjacency.get(segment.toId)!.add(segment.fromId);
  }

  const orderedNeighbors = new Map<string, string[]>();
  for (const [pointId, neighbors] of adjacency.entries()) {
    orderedNeighbors.set(pointId, sortedNeighbors(pointId, [...neighbors], gridPoints));
  }

  const visited = new Set<string>();
  const faces: DetectedFace[] = [];
  const directions = segmentLookup(segments);

  const allEdges: DirectedEdge[] = [];
  for (const segment of segments) {
    allEdges.push({ from: segment.fromId, to: segment.toId, segmentId: segment.id });
    allEdges.push({ from: segment.toId, to: segment.fromId, segmentId: segment.id });
  }

  for (const edge of allEdges) {
    const startKey = edgeKey(edge.from, edge.to);
    if (visited.has(startKey)) {
      continue;
    }

    const pointIds: string[] = [];
    const boundarySegmentIds: string[] = [];
    const polygon: Point[] = [];

    let currentFrom = edge.from;
    let currentTo = edge.to;
    let guard = 0;

    while (guard < segments.length * 4) {
      guard += 1;
      const currentKey = edgeKey(currentFrom, currentTo);
      if (visited.has(currentKey)) {
        break;
      }
      visited.add(currentKey);

      pointIds.push(currentFrom);
      const point = gridPoints.get(currentFrom);
      if (!point) {
        break;
      }
      polygon.push({ x: point.x, y: point.y });
      const segmentId = directions.get(currentKey);
      if (segmentId) {
        boundarySegmentIds.push(segmentId);
      }

      const neighbors = orderedNeighbors.get(currentTo) ?? [];
      const incomingIndex = neighbors.indexOf(currentFrom);
      if (incomingIndex === -1 || neighbors.length < 2) {
        break;
      }
      const nextIndex = (incomingIndex - 1 + neighbors.length) % neighbors.length;
      const nextPoint = neighbors[nextIndex];
      currentFrom = currentTo;
      currentTo = nextPoint;

      if (currentFrom === edge.from && currentTo === edge.to) {
        break;
      }
    }

    if (polygon.length < 3) {
      continue;
    }

    const area = polygonArea(polygon);
    if (Math.abs(area) < 1) {
      continue;
    }

    faces.push({
      id: [...new Set(boundarySegmentIds)].sort().join("|"),
      pointIds,
      boundarySegmentIds: [...new Set(boundarySegmentIds)],
      polygon,
      centroid: polygonCentroid(polygon),
      area
    });
  }

  const uniqueFaces = new Map<string, DetectedFace>();
  for (const face of faces) {
    if (face.area <= 0) {
      continue;
    }
    if (!uniqueFaces.has(face.id)) {
      uniqueFaces.set(face.id, face);
    }
  }

  return [...uniqueFaces.values()].filter((face) => Math.abs(face.area) > 1);
}
