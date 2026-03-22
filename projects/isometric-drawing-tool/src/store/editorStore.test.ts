import { beforeEach, describe, expect, it } from "vitest";
import { createGridPoint } from "../lib/geometry";
import { useEditorStore } from "./editorStore";

describe("editor store", () => {
  beforeEach(() => {
    useEditorStore.setState({
      tool: "select",
      color: "#263238",
      opacity: 1,
      segments: [],
      fills: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
        width: 800,
        height: 600
      },
      selection: {
        segmentIds: [],
        faceIds: []
      },
      draftSegment: null,
      selectionOverlay: null,
      clipboard: null,
      past: [],
      future: []
    });
  });

  it("adds valid segments and prevents duplicates", () => {
    const store = useEditorStore.getState();
    const from = createGridPoint(0, 0);
    const to = createGridPoint(2, 0);
    store.addSegment(from, to);
    store.addSegment(from, to);

    expect(useEditorStore.getState().segments).toHaveLength(1);
  });

  it("removes fills when an edge is erased", () => {
    const store = useEditorStore.getState();
    const a = createGridPoint(0, 0);
    const b = createGridPoint(1, 0);
    const c = createGridPoint(1, 1);
    const d = createGridPoint(0, 1);

    store.addSegment(a, b);
    store.addSegment(b, c);
    store.addSegment(c, d);
    store.addSegment(d, a);

    const faceId = useEditorStore
      .getState()
      .segments.map((segment) => segment.id)
      .sort()
      .join("|");

    useEditorStore.setState({
      fills: [
        {
          id: faceId,
          boundarySegmentIds: useEditorStore.getState().segments.map((segment) => segment.id),
          fill: "#ff0000",
          opacity: 0.5
        }
      ]
    });

    const points = new Map(
      [a, b, c, d].map((point) => [point.id, point])
    );
    store.eraseSegmentAtPoint({ x: 12, y: 7 }, points, 1);

    expect(useEditorStore.getState().fills).toHaveLength(0);
  });

  it("deletes the current selection directly", () => {
    const store = useEditorStore.getState();
    const from = createGridPoint(0, 0);
    const to = createGridPoint(1, 0);
    store.addSegment(from, to);

    const segmentId = useEditorStore.getState().segments[0].id;
    useEditorStore.setState({
      selection: {
        segmentIds: [segmentId],
        faceIds: []
      }
    });

    store.deleteSelection();

    expect(useEditorStore.getState().segments).toHaveLength(0);
    expect(useEditorStore.getState().tool).toBe("eraser");
  });

  it("moves the selected segment by a grid delta", () => {
    const store = useEditorStore.getState();
    const from = createGridPoint(0, 0);
    const to = createGridPoint(1, 0);
    store.addSegment(from, to);

    const originalId = useEditorStore.getState().segments[0].id;
    useEditorStore.setState({
      selection: {
        segmentIds: [originalId],
        faceIds: []
      }
    });

    store.moveSelectionByDelta(1, 1);

    const moved = useEditorStore.getState().segments[0];
    expect(moved.fromId).toBe("1,1");
    expect(moved.toId).toBe("2,1");
  });

  it("supports undo and redo for edits", () => {
    const store = useEditorStore.getState();
    const from = createGridPoint(0, 0);
    const to = createGridPoint(1, 0);
    store.addSegment(from, to);

    expect(useEditorStore.getState().segments).toHaveLength(1);
    store.undo();
    expect(useEditorStore.getState().segments).toHaveLength(0);
    store.redo();
    expect(useEditorStore.getState().segments).toHaveLength(1);
  });

  it("copies and pastes the current selection with an offset", () => {
    const store = useEditorStore.getState();
    const a = createGridPoint(0, 0);
    const b = createGridPoint(1, 0);
    store.addSegment(a, b);

    const segmentId = useEditorStore.getState().segments[0].id;
    useEditorStore.setState({
      selection: {
        segmentIds: [segmentId],
        faceIds: []
      }
    });

    store.copySelection();
    store.pasteSelection();

    expect(useEditorStore.getState().segments).toHaveLength(2);
    expect(useEditorStore.getState().selection.segmentIds).toHaveLength(1);
    expect(useEditorStore.getState().segments[1].fromId).toBe("1,1");
  });

  it("cuts the selection into the clipboard", () => {
    const store = useEditorStore.getState();
    const a = createGridPoint(0, 0);
    const b = createGridPoint(1, 0);
    store.addSegment(a, b);

    const segmentId = useEditorStore.getState().segments[0].id;
    useEditorStore.setState({
      selection: {
        segmentIds: [segmentId],
        faceIds: []
      }
    });

    store.cutSelection();

    expect(useEditorStore.getState().segments).toHaveLength(0);
    expect(useEditorStore.getState().clipboard?.segments).toHaveLength(1);
  });
});
