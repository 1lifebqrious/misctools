import { useEffect, useMemo, useState } from "react";
import CuboidDemo from "./CuboidDemo";

type GuidedTourOverlayProps = {
  open: boolean;
  onClose: () => void;
};

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type TourStep = {
  selector: string;
  title: string;
  description: string;
  detail?: string;
  showCuboidDemo?: boolean;
};

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="header"]',
    title: "Start at the top",
    description:
      "This header tells you what the tool is for and gives you quick access to the tutorial at any time.",
    detail: "The counters on the right show how many lines and colored faces are in your drawing."
  },
  {
    selector: '[data-tour="toolbar-tools"]',
    title: "Choose a drawing tool",
    description:
      "Use Pen to draw edges, Fill to color a closed face, Eraser to remove lines, and Select tools to pick or move parts.",
    detail:
      "For a cuboid, start with Pen. Later, use Select if you want to adjust the whole shape."
  },
  {
    selector: '[data-tour="toolbar-color"]',
    title: "Pick color and opacity",
    description:
      "These controls set the line color and face color. Opacity helps children see overlapping faces more clearly.",
    detail:
      "A nice first exercise is to color the top, side, and front faces with slightly different shades."
  },
  {
    selector: '[data-tour="canvas"]',
    title: "Draw on the isometric dots",
    description:
      "The canvas only accepts lines that match the isometric directions. That makes it easier to learn height, width, and depth.",
    detail:
      "Drag dot to dot with Pen. Hold Shift and drag to pan. Use the wheel or pinch to zoom."
  },
  {
    selector: '[data-tour="canvas-help"]',
    title: "Build a cuboid",
    description:
      "Draw one front face, add matching depth lines, then connect the far corners to close the shape.",
    detail:
      "The animation below shows the order: front face first, then depth, then back edges to close the cuboid.",
    showCuboidDemo: true
  }
];

function getRectForSelector(selector: string): TargetRect | null {
  const element = document.querySelector(selector);
  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
}

function GuidedTourOverlay({ open, onClose }: GuidedTourOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const step = useMemo(() => TOUR_STEPS[stepIndex], [stepIndex]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updateRect = () => setTargetRect(getRectForSelector(step.selector));
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [open, step.selector]);

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="tour-overlay" role="presentation">
      {targetRect ? (
        <div
          className="tour-highlight"
          style={{
            top: `${targetRect.top - 8}px`,
            left: `${targetRect.left - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`
          }}
        />
      ) : null}

      <section className="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <p className="eyebrow">Walkthrough</p>
        <h2 id="tour-title">{step.title}</h2>
        <p>{step.description}</p>
        {step.detail ? <p className="tour-detail">{step.detail}</p> : null}
        {step.showCuboidDemo ? <CuboidDemo /> : null}
        <div className="tour-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
            disabled={stepIndex === 0}
          >
            Back
          </button>
          <button
            type="button"
            className="tool-button"
            onClick={() => {
              if (stepIndex === TOUR_STEPS.length - 1) {
                onClose();
                return;
              }
              setStepIndex((current) => Math.min(TOUR_STEPS.length - 1, current + 1));
            }}
          >
            {stepIndex === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default GuidedTourOverlay;
