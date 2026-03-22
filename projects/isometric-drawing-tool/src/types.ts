export type ToolMode =
  | "select"
  | "pen"
  | "eraser"
  | "lasso"
  | "rectangleSelect"
  | "fill"
  | "pan";

export type Point = {
  x: number;
  y: number;
};

export type GridPoint = Point & {
  id: string;
  q: number;
  r: number;
};

export type Segment = {
  id: string;
  fromId: string;
  toId: string;
  stroke: string;
  opacity: number;
};

export type FaceFill = {
  id: string;
  boundarySegmentIds: string[];
  fill: string;
  opacity: number;
};

export type ClipboardSegment = {
  id: string;
  from: { q: number; r: number };
  to: { q: number; r: number };
  stroke: string;
  opacity: number;
};

export type ClipboardFill = {
  id: string;
  boundarySegmentIds: string[];
  fill: string;
  opacity: number;
};

export type ClipboardSelection = {
  segments: ClipboardSegment[];
  fills: ClipboardFill[];
  anchor: { q: number; r: number };
  pasteCount: number;
};

export type DetectedFace = {
  id: string;
  pointIds: string[];
  boundarySegmentIds: string[];
  polygon: Point[];
  centroid: Point;
  area: number;
};

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
  width: number;
  height: number;
};

export type SelectionState = {
  segmentIds: string[];
  faceIds: string[];
};

export type DraftSegment = {
  from: GridPoint;
  to: GridPoint;
};

export type RectangleSelection = {
  origin: Point;
  current: Point;
};

export type LassoSelection = {
  points: Point[];
};

export type MoveSelectionPreview = {
  dq: number;
  dr: number;
};

export type SelectionOverlay =
  | { type: "rectangle"; data: RectangleSelection }
  | { type: "lasso"; data: LassoSelection }
  | { type: "move"; data: MoveSelectionPreview }
  | null;

export type EditorActions = {
  setTool: (tool: ToolMode) => void;
  setColor: (color: string) => void;
  setOpacity: (opacity: number) => void;
  setViewportSize: (width: number, height: number) => void;
  setViewportPosition: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  addSegment: (from: GridPoint, to: GridPoint) => void;
  eraseSegmentAtPoint: (
    point: Point,
    gridPoints: Map<string, GridPoint>,
    zoom: number
  ) => void;
  deleteSelection: () => void;
  clearSelection: () => void;
  applySelection: (segmentIds: string[], faceIds: string[], additive: boolean) => void;
  selectAtPoint: (
    point: Point,
    gridPoints: Map<string, GridPoint>,
    faces: DetectedFace[],
    zoom: number,
    additive: boolean
  ) => void;
  applyFillToFace: (face: DetectedFace) => void;
  moveSelectionByDelta: (dq: number, dr: number) => void;
  copySelection: () => void;
  cutSelection: () => void;
  pasteSelection: () => void;
  setDraftSegment: (draft: DraftSegment | null) => void;
  setSelectionOverlay: (overlay: SelectionOverlay) => void;
  pruneFills: () => void;
  undo: () => void;
  redo: () => void;
};
