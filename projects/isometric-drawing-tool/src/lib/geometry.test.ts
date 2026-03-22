import { describe, expect, it } from "vitest";
import { createGridPoint, isValidSegment, nearestGridPoint, pointInPolygon, worldFromAxial } from "./geometry";
import { detectFaces } from "./faces";

describe("grid snapping", () => {
  it("snaps arbitrary points to the closest lattice coordinate", () => {
    const point = nearestGridPoint({ x: 20, y: 16 });
    expect(point.q).toBe(1);
    expect(point.r).toBe(0);
  });
});

describe("isometric segment validity", () => {
  it("accepts only vertical and diagonal isometric directions", () => {
    expect(isValidSegment(createGridPoint(0, 0), createGridPoint(2, 0))).toBe(true);
    expect(isValidSegment(createGridPoint(0, 0), createGridPoint(0, 2))).toBe(true);
    expect(isValidSegment(createGridPoint(0, 0), createGridPoint(2, 2))).toBe(true);
    expect(isValidSegment(createGridPoint(0, 0), createGridPoint(1, 2))).toBe(false);
  });
});

describe("face detection", () => {
  it("detects a rhombus face and ignores open shapes", () => {
    const points = [
      createGridPoint(0, 0),
      createGridPoint(1, 0),
      createGridPoint(1, 1),
      createGridPoint(0, 1)
    ];
    const segments = [
      { id: "a", fromId: points[0].id, toId: points[1].id, stroke: "#000", opacity: 1 },
      { id: "b", fromId: points[1].id, toId: points[2].id, stroke: "#000", opacity: 1 },
      { id: "c", fromId: points[2].id, toId: points[3].id, stroke: "#000", opacity: 1 },
      { id: "d", fromId: points[3].id, toId: points[0].id, stroke: "#000", opacity: 1 }
    ];
    const map = new Map(points.map((point) => [point.id, point]));
    const faces = detectFaces(segments, map);
    expect(faces).toHaveLength(1);
    expect(faces[0].boundarySegmentIds.sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("supports hit testing inside a detected face", () => {
    const polygon = [
      worldFromAxial(0, 0),
      worldFromAxial(1, 0),
      worldFromAxial(1, 1),
      worldFromAxial(0, 1)
    ];
    expect(pointInPolygon({ x: 0, y: 14 }, polygon)).toBe(true);
    expect(pointInPolygon({ x: 120, y: 120 }, polygon)).toBe(false);
  });
});
