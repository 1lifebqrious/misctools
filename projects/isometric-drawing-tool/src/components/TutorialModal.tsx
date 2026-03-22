import CuboidDemo from "./CuboidDemo";

type TutorialModalProps = {
  open: boolean;
  onClose: () => void;
  onStartTour: () => void;
};

function TutorialModal({ open, onClose, onStartTour }: TutorialModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="tutorial-backdrop" role="presentation" onClick={onClose}>
      <section
        className="tutorial-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="tutorial-header">
          <div>
            <p className="eyebrow">Tutorial</p>
            <h2 id="tutorial-title">Learn isometric drawing step by step</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="tutorial-grid">
          <section className="tutorial-section">
            <h3>What is isometric projection?</h3>
            <p>
              Isometric projection is a way to draw 3D-looking shapes on a flat page.
              Instead of using perspective lines that get smaller in the distance, the
              three main directions stay evenly spaced. That makes boxes, buildings, and
              blocks easier to measure and easier to understand.
            </p>
            <h3>Why do people use it?</h3>
            <p>
              It helps learners see height, width, and depth at the same time. It is
              useful for maths, design, game art, engineering sketches, and for children
              who are just starting to imagine 3D forms from simple lines.
            </p>
            <h3>How this tool helps</h3>
            <p>
              Every line snaps from dot to dot, so children can focus on the shape instead
              of worrying about shaky angles. The fill tool makes closed faces visible, and
              selection tools make it easy to fix or move parts of a drawing.
            </p>
          </section>

          <section className="tutorial-section">
            <h3>Quick way to draw a cuboid</h3>
            <ol className="tutorial-steps">
              <li>Choose the Pen tool.</li>
              <li>Draw the front face as a diamond-like rectangle on the isometric dots.</li>
              <li>From each corner, draw short matching depth lines in the same slanted direction.</li>
              <li>Connect the far corners to close the back face.</li>
              <li>Use Fill to color visible faces and Select to move or tidy the shape.</li>
            </ol>
            <CuboidDemo />
            <div className="tutorial-callout">
              <p className="tutorial-callout-title">Guided journey</p>
              <p>
                Want a quick tour of the page? Start the walkthrough and the tool will
                point out each area in order, ending with a cuboid-building demo.
              </p>
              <button type="button" className="tool-button" onClick={onStartTour}>
                Start walkthrough
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default TutorialModal;
