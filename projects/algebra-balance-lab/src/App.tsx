import { useEffect, useMemo, useState } from "react";
import EquationBuilderNoob from "./components/EquationBuilderNoob";
import EquationBuilderPro from "./components/EquationBuilderPro";
import GraphPanel from "./components/GraphPanel";
import GuidedTourOverlay from "./components/GuidedTourOverlay";
import TutorialModal from "./components/TutorialModal";
import { PHONE_BREAKPOINT } from "./constants";
import {
  completeNoobEquation,
  completeProEquation,
  formatNumber,
  noobGraphState,
  proGraphState
} from "./lib/math";
import { NOOB_QUESTIONS, PRO_QUESTIONS } from "./lib/problems";
import { useSessionStore } from "./store/sessionStore";
import type { DifficultyLevel } from "./types";

const LEVELS: DifficultyLevel[] = ["noob", "pro"];

function App() {
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const level = useSessionStore((state) => state.level);
  const mode = useSessionStore((state) => state.mode);
  const noobEquation = useSessionStore((state) => state.noobEquation);
  const proEquations = useSessionStore((state) => state.proEquations);
  const practiceNoob = useSessionStore((state) => state.practiceNoob);
  const practicePro = useSessionStore((state) => state.practicePro);
  const feedback = useSessionStore((state) => state.feedback);
  const waitingMessage = useSessionStore((state) => state.waitingMessage);
  const setLevel = useSessionStore((state) => state.setLevel);
  const setMode = useSessionStore((state) => state.setMode);
  const updateNoobField = useSessionStore((state) => state.updateNoobField);
  const updateProField = useSessionStore((state) => state.updateProField);
  const toggleNoobOperator = useSessionStore((state) => state.toggleNoobOperator);
  const toggleProOperator = useSessionStore((state) => state.toggleProOperator);
  const toggleNoobVariableSide = useSessionStore((state) => state.toggleNoobVariableSide);
  const generateCurrent = useSessionStore((state) => state.generateCurrent);
  const updatePracticeNoobField = useSessionStore((state) => state.updatePracticeNoobField);
  const updatePracticeProField = useSessionStore((state) => state.updatePracticeProField);
  const togglePracticeNoobOperator = useSessionStore((state) => state.togglePracticeNoobOperator);
  const togglePracticeProOperator = useSessionStore((state) => state.togglePracticeProOperator);
  const togglePracticeNoobVariableSide = useSessionStore((state) => state.togglePracticeNoobVariableSide);
  const checkPractice = useSessionStore((state) => state.checkPractice);
  const hintPractice = useSessionStore((state) => state.hintPractice);
  const nextPractice = useSessionStore((state) => state.nextPractice);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const noobPracticeQuestion = NOOB_QUESTIONS[practiceNoob.index];
  const proPracticeQuestion = PRO_QUESTIONS[practicePro.index];

  const proReduction = useMemo(() => {
    if (mode === "practice") {
      if (!practicePro.passed || !completeProEquation(practicePro.drafts[0]) || !completeProEquation(practicePro.drafts[1])) {
        return null;
      }
      return proGraphState([practicePro.drafts[0], practicePro.drafts[1]]);
    }
    return proGraphState(proEquations);
  }, [mode, practicePro, proEquations]);

  const noobSolved = useMemo(() => noobGraphState(noobEquation).solutionX, [noobEquation]);

  if (viewportWidth < PHONE_BREAKPOINT) {
    return (
      <main className="phone-blocker">
        <section className="phone-card">
          <p className="eyebrow">Tablet or desktop required</p>
          <h1>This algebra lab needs more room.</h1>
          <p>
            Open it on a tablet or desktop to see the graph, equation builder, and
            reduction panels comfortably.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="lab-shell">
      <header className="lab-header" data-tour="header">
        <div>
          <p className="eyebrow">Learning tool</p>
          <h1>Algebra Balance Lab</h1>
          <p className="header-copy">
            Build equations, watch them become graphs, and see exactly where the answer
            lives.
          </p>
        </div>
        <div className="header-controls">
          <div className="segmented-row" role="toolbar" aria-label="Learning mode">
            <button
              type="button"
              className={mode === "learn" ? "pill-button active" : "pill-button"}
              onClick={() => setMode("learn")}
            >
              Learn
            </button>
            <button
              type="button"
              className={mode === "practice" ? "pill-button active" : "pill-button"}
              onClick={() => setMode("practice")}
            >
              Practice
            </button>
          </div>
          <button type="button" className="primary-button" onClick={() => setTutorialOpen(true)}>
            Tutorial
          </button>
        </div>
      </header>

      <section className="lab-body">
        <aside className="left-panel">
          <section className="panel-card">
            <h2>Level</h2>
            <div className="segmented-row">
              {LEVELS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={item === level ? "pill-button active" : "pill-button"}
                  onClick={() => setLevel(item)}
                >
                  {item === "noob" ? "Noob" : "Pro"}
                </button>
              ))}
            </div>
          </section>

          {mode === "practice" ? (
            <section className="panel-card" data-tour="practice">
              <div className="panel-header-row">
                <h2>Problem</h2>
                <button type="button" className="ghost-button" onClick={nextPractice}>
                  Next
                </button>
              </div>
              <p className="problem-text">
                {level === "noob" ? noobPracticeQuestion.prompt : proPracticeQuestion.prompt}
              </p>
            </section>
          ) : (
            <section className="panel-card">
              <div className="panel-header-row">
                <h2>{level === "noob" ? "Equation generator" : "System generator"}</h2>
                <button type="button" className="ghost-button" onClick={generateCurrent}>
                  Generate
                </button>
              </div>
              <p className="problem-text">
                {level === "noob"
                  ? `This equation currently solves at X = ${formatNumber(noobSolved)}.`
                  : "Generate fresh equations and see where the two lines meet."}
              </p>
            </section>
          )}

          <section className="panel-card" data-tour="builder">
            <div className="panel-header-row">
              <h2>{level === "noob" ? "Equation builder" : "Equation builders"}</h2>
              {mode === "practice" ? (
                <div className="button-row">
                  <button type="button" className="ghost-button" onClick={hintPractice}>
                    Hint
                  </button>
                  <button type="button" className="primary-button" onClick={checkPractice}>
                    Check
                  </button>
                </div>
              ) : null}
            </div>

            {level === "noob" ? (
              <EquationBuilderNoob
                equation={mode === "practice" ? practiceNoob.draft : noobEquation}
                onNumberChange={(field, value) => {
                  if (mode === "practice") {
                    updatePracticeNoobField(field, value);
                    return;
                  }
                  if (value !== null) {
                    updateNoobField(field, value);
                  }
                }}
                onToggleOperator={() => {
                  if (mode === "practice") {
                    togglePracticeNoobOperator();
                    return;
                  }
                  toggleNoobOperator();
                }}
                onToggleVariableSide={() => {
                  if (mode === "practice") {
                    togglePracticeNoobVariableSide();
                    return;
                  }
                  toggleNoobVariableSide();
                }}
                allowEmpty={mode === "practice"}
              />
            ) : (
              <div className="builder-stack">
                <EquationBuilderPro
                  equation={mode === "practice" ? practicePro.drafts[0] : proEquations[0]}
                  index={0}
                  onNumberChange={(equationIndex, field, value) => {
                    if (mode === "practice") {
                      updatePracticeProField(equationIndex, field, value);
                      return;
                    }
                    if (value !== null) {
                      updateProField(equationIndex, field, value);
                    }
                  }}
                  onToggleOperator={(equationIndex) => {
                    if (mode === "practice") {
                      togglePracticeProOperator(equationIndex);
                      return;
                    }
                    toggleProOperator(equationIndex);
                  }}
                  allowEmpty={mode === "practice"}
                />
                <EquationBuilderPro
                  equation={mode === "practice" ? practicePro.drafts[1] : proEquations[1]}
                  index={1}
                  onNumberChange={(equationIndex, field, value) => {
                    if (mode === "practice") {
                      updatePracticeProField(equationIndex, field, value);
                      return;
                    }
                    if (value !== null) {
                      updateProField(equationIndex, field, value);
                    }
                  }}
                  onToggleOperator={(equationIndex) => {
                    if (mode === "practice") {
                      togglePracticeProOperator(equationIndex);
                      return;
                    }
                    toggleProOperator(equationIndex);
                  }}
                  allowEmpty={mode === "practice"}
                />
              </div>
            )}
          </section>
        </aside>

        <section className="stage-panel">
          <div className="graph-card" data-tour="graph">
            {level === "noob" ? (
              <GraphPanel
                level="noob"
                equation={
                  mode === "practice" && completeNoobEquation(practiceNoob.draft)
                    ? practiceNoob.draft
                    : noobEquation
                }
                hidden={mode === "practice" && !practiceNoob.passed}
                hiddenMessage={waitingMessage}
              />
            ) : (
              <GraphPanel
                level="pro"
                equations={
                  mode === "practice" &&
                  completeProEquation(practicePro.drafts[0]) &&
                  completeProEquation(practicePro.drafts[1])
                    ? [practicePro.drafts[0], practicePro.drafts[1]]
                    : proEquations
                }
                hidden={mode === "practice" && !practicePro.passed}
                hiddenMessage={waitingMessage}
              />
            )}
          </div>

          <section className="reduction-card" data-tour="reductions">
            <div className="panel-header-row">
              <h2>{level === "noob" ? "A quick read" : "Reduced view"}</h2>
            </div>
            {level === "noob" ? (
              <p className="problem-text">
                The answer is the X-value directly below the meeting point of the slanted
                line and the flat target line.
              </p>
            ) : proReduction ? (
              <div className="reduction-grid">
                <div className="reduction-block">
                  <p className="eyebrow">
                    <span className="equation-variable variable-x">X</span>-only reduction
                  </p>
                  <h3>
                    {formatNumber(proReduction.reductionX.coefficient)}
                    <span className="equation-variable variable-x">X</span> ={" "}
                    {formatNumber(proReduction.reductionX.rhs)}
                  </h3>
                  <p>
                    <span className="equation-variable variable-x">X</span> ={" "}
                    {formatNumber(proReduction.reductionX.value)}
                  </p>
                </div>
                <div className="reduction-block">
                  <p className="eyebrow">
                    <span className="equation-variable variable-y">Y</span>-only reduction
                  </p>
                  <h3>
                    {formatNumber(proReduction.reductionY.coefficient)}
                    <span className="equation-variable variable-y">Y</span> ={" "}
                    {formatNumber(proReduction.reductionY.rhs)}
                  </h3>
                  <p>
                    <span className="equation-variable variable-y">Y</span> ={" "}
                    {formatNumber(proReduction.reductionY.value)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="problem-text">
                Check the practice answer first to unlock the reduced X-only and Y-only view.
              </p>
            )}
          </section>

          <section className={`feedback-card ${feedback.tone}`}>
            <h2>{mode === "practice" ? "Practice feedback" : "What the graph is saying"}</h2>
            <p>{feedback.message}</p>
          </section>
        </section>
      </section>

      <TutorialModal
        open={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        onStartTour={() => {
          setTutorialOpen(false);
          setTourOpen(true);
        }}
      />
      <GuidedTourOverlay open={tourOpen} onClose={() => setTourOpen(false)} />
    </main>
  );
}

export default App;
