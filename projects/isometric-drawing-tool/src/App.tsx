import { useEffect, useMemo, useState } from "react";
import EditorCanvas from "./components/EditorCanvas";
import GuidedTourOverlay from "./components/GuidedTourOverlay";
import StatusAnnouncer from "./components/StatusAnnouncer";
import TutorialModal from "./components/TutorialModal";
import Toolbar from "./components/Toolbar";
import { PHONE_BREAKPOINT } from "./constants";
import { detectFaces } from "./lib/faces";
import { buildGridPointMap } from "./lib/geometry";
import { useEditorStore } from "./store/editorStore";

function App() {
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const segments = useEditorStore((state) => state.segments);
  const fills = useEditorStore((state) => state.fills);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const gridPoints = useMemo(() => buildGridPointMap(segments), [segments]);
  const faces = useMemo(() => detectFaces(segments, gridPoints), [segments, gridPoints]);
  const filledFaces = useMemo(
    () => faces.filter((face) => fills.some((fill) => fill.id === face.id)),
    [faces, fills]
  );

  if (viewportWidth < PHONE_BREAKPOINT) {
    return (
      <main className="phone-blocker">
        <section className="phone-card" aria-labelledby="phone-card-title">
          <p className="eyebrow">Tablet or desktop required</p>
          <h1 id="phone-card-title">This tool is designed for larger screens.</h1>
          <p>
            Open it on an iPad, another tablet, or a desktop browser to use the
            isometric canvas and drawing tools comfortably.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header" data-tour="header">
        <div>
          <p className="eyebrow">Learning tool</p>
          <h1>Isometric Drawing Tool</h1>
          <p className="header-copy">
            Draw snapped isometric lines, select multiple shapes, and color closed
            faces on an infinite-feeling dot grid.
          </p>
        </div>
        <div className="header-stats" aria-label="Document summary">
          <span>{segments.length} lines</span>
          <span>{filledFaces.length} colored faces</span>
          <button
            type="button"
            className="tutorial-trigger"
            onClick={() => setIsTutorialOpen(true)}
          >
            Tutorial
          </button>
        </div>
      </header>

      <section className="workspace" aria-label="Drawing workspace">
        <Toolbar />
        <EditorCanvas faces={faces} gridPoints={gridPoints} />
      </section>
      <StatusAnnouncer faces={faces} />
      <TutorialModal
        open={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onStartTour={() => {
          setIsTutorialOpen(false);
          setIsTourOpen(true);
        }}
      />
      <GuidedTourOverlay open={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </main>
  );
}

export default App;
