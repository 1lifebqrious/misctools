import { useEffect, useMemo, useState } from "react";

type GuidedTourOverlayProps = {
  open: boolean;
  onClose: () => void;
};

type TourStep = {
  selector: string;
  title: string;
  description: string;
};

const STEPS: TourStep[] = [
  {
    selector: '[data-tour="header"]',
    title: "Start in the header",
    description: "Pick Learn or Practice, open the tutorial again, and choose the level you want to explore."
  },
  {
    selector: '[data-tour="builder"]',
    title: "Build the equation",
    description: "Use the stepper buttons to change the numbers. In Noob you can also move x from one slot to the other."
  },
  {
    selector: '[data-tour="graph"]',
    title: "Watch the graph react",
    description: "Every change updates the lines and keeps the negative quadrants visible when the answer falls there."
  },
  {
    selector: '[data-tour="reductions"]',
    title: "Look at the reduced view",
    description: "In Pro, this box reduces the system into one x-only equation and one y-only equation."
  },
  {
    selector: '[data-tour="practice"]',
    title: "Practice without spoilers",
    description: "In Practice, the graph waits until your Check passes. Hint fixes one field at a time."
  }
];

function GuidedTourOverlay({ open, onClose }: GuidedTourOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = useMemo(() => STEPS[stepIndex], [stepIndex]);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      return;
    }

    const updateRect = () => {
      const element = document.querySelector(step.selector);
      setRect(element?.getBoundingClientRect() ?? null);
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [open, step.selector]);

  if (!open) {
    return null;
  }

  return (
    <div className="tour-overlay" role="presentation">
      {rect ? (
        <div
          className="tour-highlight"
          style={{
            top: `${rect.top - 8}px`,
            left: `${rect.left - 8}px`,
            width: `${rect.width + 16}px`,
            height: `${rect.height + 16}px`
          }}
        />
      ) : null}
      <section className="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <p className="eyebrow">Walkthrough</p>
        <h2 id="tour-title">{step.title}</h2>
        <p>{step.description}</p>
        <div className="tour-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="ghost-button"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
          >
            Back
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              if (stepIndex === STEPS.length - 1) {
                onClose();
                return;
              }
              setStepIndex((current) => current + 1);
            }}
          >
            {stepIndex === STEPS.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default GuidedTourOverlay;
