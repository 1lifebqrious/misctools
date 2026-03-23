import { create } from "zustand";
import { WAIT_MESSAGES } from "../constants";
import {
  buildNoobHint,
  buildProHint,
  createEmptyNoobDraft,
  createEmptyProDraft,
  createRandomNoobEquation,
  createRandomProEquations,
  formatNumber,
  noobGraphState,
  proGraphState,
  validateNoobDraft,
  validateProDraft
} from "../lib/math";
import { NOOB_QUESTIONS, PRO_QUESTIONS } from "../lib/problems";
import type {
  DifficultyLevel,
  FeedbackState,
  LearningMode,
  NoobDraftEquation,
  NoobEquation,
  Operator,
  ProDraftEquation,
  ProEquation
} from "../types";

type PracticeNoobState = {
  index: number;
  draft: NoobDraftEquation;
  passed: boolean;
};

type PracticeProState = {
  index: number;
  drafts: [ProDraftEquation, ProDraftEquation];
  passed: boolean;
};

type SessionState = {
  level: DifficultyLevel;
  mode: LearningMode;
  noobEquation: NoobEquation;
  proEquations: [ProEquation, ProEquation];
  practiceNoob: PracticeNoobState;
  practicePro: PracticeProState;
  feedback: FeedbackState;
  waitingMessage: string;
  setLevel: (level: DifficultyLevel) => void;
  setMode: (mode: LearningMode) => void;
  updateNoobField: (
    field: keyof Omit<NoobEquation, "variableSide" | "operator">,
    value: number
  ) => void;
  updateProField: (
    equationIndex: 0 | 1,
    field: keyof Omit<ProEquation, "operator">,
    value: number
  ) => void;
  toggleNoobOperator: () => void;
  toggleProOperator: (equationIndex: 0 | 1) => void;
  toggleNoobVariableSide: () => void;
  generateCurrent: () => void;
  updatePracticeNoobField: (
    field: keyof Omit<NoobDraftEquation, "variableSide" | "operator">,
    value: number | null
  ) => void;
  updatePracticeProField: (
    equationIndex: 0 | 1,
    field: keyof Omit<ProDraftEquation, "operator">,
    value: number | null
  ) => void;
  togglePracticeNoobOperator: () => void;
  togglePracticeProOperator: (equationIndex: 0 | 1) => void;
  togglePracticeNoobVariableSide: () => void;
  checkPractice: () => void;
  hintPractice: () => void;
  nextPractice: () => void;
};

function defaultFeedback(): FeedbackState {
  return {
    tone: "idle",
    message: "Build an equation and watch the graph explain the answer."
  };
}

function nextWaitingMessage(index: number) {
  return WAIT_MESSAGES[index % WAIT_MESSAGES.length];
}

function createInitialSessionState() {
  return {
    level: "noob" as DifficultyLevel,
    mode: "learn" as LearningMode,
    noobEquation: createRandomNoobEquation(),
    proEquations: createRandomProEquations(),
    practiceNoob: {
      index: 0,
      draft: createEmptyNoobDraft(),
      passed: false
    },
    practicePro: {
      index: 0,
      drafts: [createEmptyProDraft(), createEmptyProDraft()] as [
        ProDraftEquation,
        ProDraftEquation
      ],
      passed: false
    },
    feedback: defaultFeedback(),
    waitingMessage: WAIT_MESSAGES[0]
  };
}

export const useSessionStore = create<SessionState>((set) => ({
  ...createInitialSessionState(),
  setLevel: (level) =>
    set({
      level,
      feedback: defaultFeedback()
    }),
  setMode: (mode) =>
    set({
      mode,
      feedback: defaultFeedback()
    }),
  updateNoobField: (field, value) =>
    set((state) => ({
      noobEquation: {
        ...state.noobEquation,
        [field]: value
      },
      feedback: {
        tone: "idle",
        message: `Right now the graph solves at x = ${formatNumber(
          noobGraphState({
            ...state.noobEquation,
            [field]: value
          }).solutionX
        )}.`
      }
    })),
  updateProField: (equationIndex, field, value) =>
    set((state) => {
      const next = [...state.proEquations] as [ProEquation, ProEquation];
      next[equationIndex] = {
        ...next[equationIndex],
        [field]: value
      };
      const graph = proGraphState(next);
      return {
        proEquations: next,
        feedback: {
          tone: "idle",
          message: `The two lines currently meet at (${formatNumber(graph.solutionX)}, ${formatNumber(
            graph.solutionY
          )}).`
        }
      };
    }),
  toggleNoobOperator: () =>
    set((state) => {
      const nextOperator: Operator = state.noobEquation.operator === "+" ? "-" : "+";
      const nextEquation = {
        ...state.noobEquation,
        operator: nextOperator
      } satisfies NoobEquation;
      return {
        noobEquation: nextEquation,
        feedback: {
          tone: "idle",
          message: `The target point moved. x is now ${formatNumber(
            noobGraphState(nextEquation).solutionX
          )}.`
        }
      };
    }),
  toggleProOperator: (equationIndex) =>
    set((state) => {
      const next = [...state.proEquations] as [ProEquation, ProEquation];
      next[equationIndex] = {
        ...next[equationIndex],
        operator: next[equationIndex].operator === "+" ? "-" : "+"
      };
      return {
        proEquations: next,
        feedback: {
          tone: "idle",
          message: "One line tilted to a new angle. Look at the new crossing point."
        }
      };
    }),
  toggleNoobVariableSide: () =>
    set((state) => {
      const nextEquation = {
        ...state.noobEquation,
        variableSide: state.noobEquation.variableSide === "left" ? "right" : "left"
      } satisfies NoobEquation;
      return {
        noobEquation: nextEquation,
        feedback: {
          tone: "idle",
          message: `x moved to the other side of the expression. The graph now solves at x = ${formatNumber(
            noobGraphState(nextEquation).solutionX
          )}.`
        }
      };
    }),
  generateCurrent: () =>
    set((state) => {
      if (state.level === "noob") {
        const nextEquation = createRandomNoobEquation();
        return {
          noobEquation: nextEquation,
          feedback: {
            tone: "idle",
            message: `New equation ready. Try to predict x before the graph tells you ${formatNumber(
              noobGraphState(nextEquation).solutionX
            )}.`
          }
        };
      }

      const nextEquations = createRandomProEquations();
      const graph = proGraphState(nextEquations);
      return {
        proEquations: nextEquations,
        feedback: {
          tone: "idle",
          message: `New pair ready. The lines cross at (${formatNumber(graph.solutionX)}, ${formatNumber(
            graph.solutionY
          )}).`
        }
      };
    }),
  updatePracticeNoobField: (field, value) =>
    set((state) => ({
      practiceNoob: {
        ...state.practiceNoob,
        draft: {
          ...state.practiceNoob.draft,
          [field]: value
        },
        passed: false
      },
      waitingMessage: nextWaitingMessage(state.practiceNoob.index + 1),
      feedback: {
        tone: "idle",
        message: "Keep building. The graph will wake up after a correct check."
      }
    })),
  updatePracticeProField: (equationIndex, field, value) =>
    set((state) => {
      const nextDrafts = [...state.practicePro.drafts] as [ProDraftEquation, ProDraftEquation];
      nextDrafts[equationIndex] = {
        ...nextDrafts[equationIndex],
        [field]: value
      };
      return {
        practicePro: {
          ...state.practicePro,
          drafts: nextDrafts,
          passed: false
        },
        waitingMessage: nextWaitingMessage(state.practicePro.index + equationIndex + 1),
        feedback: {
          tone: "idle",
          message: "Build both equations from the clue before checking."
        }
      };
    }),
  togglePracticeNoobOperator: () =>
    set((state) => ({
      practiceNoob: {
        ...state.practiceNoob,
        draft: {
          ...state.practiceNoob.draft,
          operator: state.practiceNoob.draft.operator === null
            ? "+"
            : state.practiceNoob.draft.operator === "+"
              ? "-"
              : "+"
        },
        passed: false
      }
    })),
  togglePracticeProOperator: (equationIndex) =>
    set((state) => {
      const nextDrafts = [...state.practicePro.drafts] as [ProDraftEquation, ProDraftEquation];
      const currentOperator = nextDrafts[equationIndex].operator;
      nextDrafts[equationIndex] = {
        ...nextDrafts[equationIndex],
        operator: currentOperator === null ? "+" : currentOperator === "+" ? "-" : "+"
      };
      return {
        practicePro: {
          ...state.practicePro,
          drafts: nextDrafts,
          passed: false
        }
      };
    }),
  togglePracticeNoobVariableSide: () =>
    set((state) => ({
      practiceNoob: {
        ...state.practiceNoob,
        draft: {
          ...state.practiceNoob.draft,
          variableSide:
            state.practiceNoob.draft.variableSide === null
              ? "left"
              : state.practiceNoob.draft.variableSide === "left"
                ? "right"
                : "left"
        },
        passed: false
      }
    })),
  checkPractice: () =>
    set((state) => {
      if (state.level === "noob") {
        const question = NOOB_QUESTIONS[state.practiceNoob.index];
        const result = validateNoobDraft(state.practiceNoob.draft, question.expected);
        return {
          practiceNoob: {
            ...state.practiceNoob,
            passed: result.status === "correct"
          },
          feedback: {
            tone:
              result.status === "correct"
                ? "correct"
                : result.status === "partial"
                  ? "hint"
                  : "incorrect",
            message: result.message
          }
        };
      }

      const question = PRO_QUESTIONS[state.practicePro.index];
      const result = validateProDraft(state.practicePro.drafts, question.expected);
      return {
        practicePro: {
          ...state.practicePro,
          passed: result.status === "correct"
        },
        feedback: {
          tone:
            result.status === "correct"
              ? "correct"
              : result.status === "partial"
                ? "hint"
                : "incorrect",
          message: result.message
        }
      };
    }),
  hintPractice: () =>
    set((state) => {
      if (state.level === "noob") {
        const question = NOOB_QUESTIONS[state.practiceNoob.index];
        const hint = buildNoobHint(state.practiceNoob.draft, question.expected);
        return {
          practiceNoob: {
            ...state.practiceNoob,
            draft: hint.next
          },
          feedback: {
            tone: "hint",
            message: hint.message
          }
        };
      }

      const question = PRO_QUESTIONS[state.practicePro.index];
      const hint = buildProHint(state.practicePro.drafts, question.expected);
      return {
        practicePro: {
          ...state.practicePro,
          drafts: hint.next
        },
        feedback: {
          tone: "hint",
          message: hint.message
        }
      };
    }),
  nextPractice: () =>
    set((state) => {
      if (state.level === "noob") {
        const nextIndex = (state.practiceNoob.index + 1) % NOOB_QUESTIONS.length;
        return {
          practiceNoob: {
            index: nextIndex,
            draft: createEmptyNoobDraft(),
            passed: false
          },
          waitingMessage: nextWaitingMessage(nextIndex),
          feedback: defaultFeedback()
        };
      }

      const nextIndex = (state.practicePro.index + 1) % PRO_QUESTIONS.length;
      return {
        practicePro: {
          index: nextIndex,
          drafts: [createEmptyProDraft(), createEmptyProDraft()],
          passed: false
        },
        waitingMessage: nextWaitingMessage(nextIndex),
        feedback: defaultFeedback()
      };
    })
}));

export function resetSessionStore() {
  useSessionStore.setState(createInitialSessionState());
}
