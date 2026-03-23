export type DifficultyLevel = "noob" | "pro";
export type LearningMode = "learn" | "practice";
export type Operator = "+" | "-";
export type VariableSide = "left" | "right";

export type NoobEquation = {
  variableSide: VariableSide;
  leftOperand: number;
  operator: Operator;
  rightOperand: number;
  result: number;
};

export type NoobDraftEquation = {
  variableSide: VariableSide | null;
  leftOperand: number | null;
  operator: Operator | null;
  rightOperand: number | null;
  result: number | null;
};

export type ProEquation = {
  xCoefficient: number;
  operator: Operator;
  yCoefficient: number;
  result: number;
};

export type ProDraftEquation = {
  xCoefficient: number | null;
  operator: Operator | null;
  yCoefficient: number | null;
  result: number | null;
};

export type GraphViewport = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type NoobGraphState = {
  slope: number;
  intercept: number;
  targetY: number;
  solutionX: number;
  solutionY: number;
  viewport: GraphViewport;
};

export type ProGraphLine = {
  slope: number;
  intercept: number;
  label: string;
  color: string;
};

export type ProReduction = {
  coefficient: number;
  rhs: number;
  variable: "x" | "y";
  value: number;
};

export type ProGraphState = {
  first: ProGraphLine;
  second: ProGraphLine;
  solutionX: number;
  solutionY: number;
  viewport: GraphViewport;
  reductionX: ProReduction;
  reductionY: ProReduction;
};

export type ValidationStatus = "correct" | "incorrect" | "partial";

export type ValidationResult = {
  status: ValidationStatus;
  message: string;
};

export type NoobPracticeQuestion = {
  id: string;
  level: "noob";
  prompt: string;
  expected: NoobEquation;
};

export type ProPracticeQuestion = {
  id: string;
  level: "pro";
  prompt: string;
  expected: [ProEquation, ProEquation];
};

export type PracticeQuestion = NoobPracticeQuestion | ProPracticeQuestion;

export type FeedbackTone = "idle" | "correct" | "incorrect" | "hint";
export type FeedbackState = {
  tone: FeedbackTone;
  message: string;
};
