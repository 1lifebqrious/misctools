import { useRef } from "react";
import { MAX_ZOOM, MIN_ZOOM, PALETTE_PRESETS } from "../constants";
import { useEditorStore } from "../store/editorStore";
import type { ToolMode } from "../types";

const PRIMARY_TOOLS: Array<{ id: ToolMode; label: string }> = [
  { id: "pen", label: "Pen" },
  { id: "eraser", label: "Eraser" },
  { id: "fill", label: "Fill" },
  { id: "pan", label: "Pan" }
];

const SELECT_TOOLS: Array<{ id: ToolMode; label: string }> = [
  { id: "select", label: "Select" },
  { id: "lasso", label: "Lasso" },
  { id: "rectangleSelect", label: "Rectangle" }
];

function toolLabel(tool: ToolMode) {
  return SELECT_TOOLS.find((item) => item.id === tool)?.label ?? "Select";
}

function Toolbar() {
  const selectMenuRef = useRef<HTMLDetailsElement | null>(null);
  const tool = useEditorStore((state) => state.tool);
  const color = useEditorStore((state) => state.color);
  const opacity = useEditorStore((state) => state.opacity);
  const viewport = useEditorStore((state) => state.viewport);
  const setTool = useEditorStore((state) => state.setTool);
  const setColor = useEditorStore((state) => state.setColor);
  const setOpacity = useEditorStore((state) => state.setOpacity);
  const setZoom = useEditorStore((state) => state.setZoom);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const deleteSelection = useEditorStore((state) => state.deleteSelection);
  const copySelection = useEditorStore((state) => state.copySelection);
  const cutSelection = useEditorStore((state) => state.cutSelection);
  const pasteSelection = useEditorStore((state) => state.pasteSelection);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const selection = useEditorStore((state) => state.selection);
  const clipboard = useEditorStore((state) => state.clipboard);

  const hasSelection =
    selection.segmentIds.length > 0 || selection.faceIds.length > 0;
  const inSelectGroup =
    tool === "select" || tool === "lasso" || tool === "rectangleSelect";

  const handleToolClick = (nextTool: ToolMode) => {
    if (nextTool === "eraser" && hasSelection) {
      deleteSelection();
      return;
    }
    setTool(nextTool);
    if (nextTool === "select" || nextTool === "lasso" || nextTool === "rectangleSelect") {
      selectMenuRef.current?.removeAttribute("open");
    }
  };

  return (
    <aside className="toolbar" aria-label="Drawing controls">
      <section className="toolbar-section" data-tour="toolbar-tools">
        <h2>Tools</h2>
        <div className="tool-grid" role="toolbar" aria-label="Tool selection">
          <details
            ref={selectMenuRef}
            className={inSelectGroup ? "tool-dropdown active" : "tool-dropdown"}
          >
            <summary
              className={inSelectGroup ? "tool-button active tool-dropdown-trigger" : "tool-button tool-dropdown-trigger"}
            >
              {toolLabel(tool)}
            </summary>
            <div className="tool-dropdown-menu" role="menu" aria-label="Selection tools">
              {SELECT_TOOLS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === tool ? "tool-button active" : "tool-button"}
                  aria-pressed={item.id === tool}
                  onClick={() => handleToolClick(item.id)}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  clearSelection();
                  selectMenuRef.current?.removeAttribute("open");
                }}
              >
                Clear
              </button>
            </div>
          </details>
          {PRIMARY_TOOLS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === tool ? "tool-button active" : "tool-button"}
              aria-pressed={item.id === tool}
              onClick={() => handleToolClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="toolbar-section" data-tour="toolbar-color">
        <h2>Color</h2>
        <div className="palette-grid" aria-label="Color palette">
          {PALETTE_PRESETS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              className={swatch === color ? "swatch active" : "swatch"}
              aria-label={`Select ${swatch}`}
              aria-pressed={swatch === color}
              style={{ backgroundColor: swatch }}
              onClick={() => setColor(swatch)}
            />
          ))}
        </div>
        <label className="toolbar-label" htmlFor="custom-color">
          Custom color
        </label>
        <input
          id="custom-color"
          className="color-input"
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />
        <label className="toolbar-label" htmlFor="opacity">
          Opacity: {Math.round(opacity * 100)}%
        </label>
        <input
          id="opacity"
          type="range"
          min={0}
          max={100}
          value={Math.round(opacity * 100)}
          onChange={(event) => setOpacity(Number(event.target.value) / 100)}
        />
      </section>

      <section className="toolbar-section">
        <div className="section-header-row">
          <h2>Zoom</h2>
          <div className="zoom-row">
            <button type="button" onClick={() => setZoom(Math.max(MIN_ZOOM, viewport.zoom - 0.1))}>
              -
            </button>
            <span>{Math.round(viewport.zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom(Math.min(MAX_ZOOM, viewport.zoom + 0.1))}>
              +
            </button>
          </div>
        </div>
      </section>

      <section className="toolbar-section">
        <div className="section-header-row">
          <h2>Clipboard</h2>
          <div className="icon-button-row">
            <button
              type="button"
              className="secondary-button icon-button"
              aria-label="Copy selection"
              title="Copy"
              onClick={copySelection}
            >
              ⧉
            </button>
            <button
              type="button"
              className="secondary-button icon-button"
              aria-label="Cut selection"
              title="Cut"
              onClick={cutSelection}
            >
              ✂
            </button>
            <button
              type="button"
              className="secondary-button icon-button"
              aria-label="Paste selection"
              title="Paste"
              onClick={pasteSelection}
              disabled={!clipboard}
            >
              ⎘
            </button>
          </div>
        </div>
      </section>

      <section className="toolbar-section">
        <div className="section-header-row">
          <h2>History</h2>
          <div className="history-row">
            <button type="button" onClick={undo}>
              Undo
            </button>
            <button type="button" onClick={redo}>
              Redo
            </button>
          </div>
        </div>
      </section>
    </aside>
  );
}

export default Toolbar;
