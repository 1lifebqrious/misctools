import { useMemo } from "react";
import { useEditorStore } from "../store/editorStore";
import type { DetectedFace } from "../types";

type StatusAnnouncerProps = {
  faces: DetectedFace[];
};

function StatusAnnouncer({ faces }: StatusAnnouncerProps) {
  const tool = useEditorStore((state) => state.tool);
  const selection = useEditorStore((state) => state.selection);
  const message = useMemo(() => {
    const toolMessage = `Current tool: ${tool}.`;
    const selectionMessage = `${selection.segmentIds.length} lines and ${selection.faceIds.length} faces selected.`;
    return `${toolMessage} ${selectionMessage} ${faces.length} closed faces detected.`;
  }, [faces.length, selection.faceIds.length, selection.segmentIds.length, tool]);

  return (
    <p className="sr-only" aria-live="polite">
      {message}
    </p>
  );
}

export default StatusAnnouncer;
