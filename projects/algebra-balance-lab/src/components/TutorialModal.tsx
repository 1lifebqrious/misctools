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
    <div className="overlay-backdrop" role="presentation" onClick={onClose}>
      <section
        className="overlay-card tutorial-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="overlay-header">
          <div>
            <p className="eyebrow">Tutorial</p>
            <h2 id="tutorial-title">Why equations turn into graphs</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="tutorial-grid">
          <section className="tutorial-panel">
            <h3>Noob level</h3>
            <p>
              In Noob, your equation becomes one straight line. The target line stays
              flat. Where they meet, the x-value is the answer.
            </p>
            <h3>Pro level</h3>
            <p>
              In Pro, each equation becomes its own line. The one point where both lines
              touch is the only pair that makes both equations true.
            </p>
          </section>

          <section className="tutorial-panel">
            <h3>Negative answers still count</h3>
            <p>
              Sometimes the answer lives left of zero, below zero, or both. That is why
              the graph always keeps all four quadrants ready.
            </p>
            <h3>How to use the lab</h3>
            <ol className="step-list">
              <li>Pick Noob or Pro.</li>
              <li>Build the equation with the number pickers.</li>
              <li>Switch to Practice when you want a word problem.</li>
              <li>Use Check to reveal the graph only after you are correct.</li>
            </ol>
            <button type="button" className="primary-button" onClick={onStartTour}>
              Start walkthrough
            </button>
          </section>
        </div>
      </section>
    </div>
  );
}

export default TutorialModal;
