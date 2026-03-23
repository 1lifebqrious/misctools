import { MAX_PICKER_VALUE, MIN_PICKER_VALUE } from "../constants";
import type {
  GraphViewport,
  NoobDraftEquation,
  NoobEquation,
  NoobGraphState,
  Operator,
  ProDraftEquation,
  ProEquation,
  ProGraphState,
  ProReduction,
  ValidationResult,
  VariableSide
} from "../types";

type StandardLinear = {
  coefficient: number;
  rhs: number;
};

type StandardSystem = {
  xCoefficient: number;
  yCoefficient: number;
  rhs: number;
};

function gcd(a: number, b: number): number {
  if (b === 0) {
    return Math.abs(a);
  }
  return gcd(b, a % b);
}

function gcdMany(values: number[]) {
  return values.reduce((current, value) => gcd(current, value));
}

function nonZeroRange(value: number) {
  return Number.isFinite(value) && Math.abs(value) > 0.0001;
}

function clampBounds(min: number, max: number) {
  if (Math.abs(max - min) < 1) {
    return { min: min - 1, max: max + 1 };
  }
  return { min, max };
}

export function clampPickerValue(value: number) {
  return Math.min(MAX_PICKER_VALUE, Math.max(MIN_PICKER_VALUE, value));
}

export function formatNumber(value: number) {
  if (Number.isInteger(value)) {
    return `${value}`;
  }
  return value.toFixed(2).replace(/\.00$/, "");
}

export function createEmptyNoobDraft(): NoobDraftEquation {
  return {
    variableSide: null,
    leftOperand: null,
    operator: null,
    rightOperand: null,
    result: null
  };
}

export function createEmptyProDraft(): ProDraftEquation {
  return {
    xCoefficient: null,
    operator: null,
    yCoefficient: null,
    result: null
  };
}

export function toggleOperator(current: Operator | null): Operator {
  if (current === null) {
    return "+";
  }
  return current === "+" ? "-" : "+";
}

export function completeNoobEquation(draft: NoobDraftEquation): draft is NoobEquation {
  return (
    draft.variableSide !== null &&
    draft.leftOperand !== null &&
    draft.operator !== null &&
    draft.rightOperand !== null &&
    draft.result !== null
  );
}

export function completeProEquation(draft: ProDraftEquation): draft is ProEquation {
  return (
    draft.xCoefficient !== null &&
    draft.operator !== null &&
    draft.yCoefficient !== null &&
    draft.result !== null
  );
}

export function noobSlopeAndIntercept(equation: NoobEquation) {
  if (equation.variableSide === "left") {
    return {
      slope: equation.leftOperand,
      intercept: equation.operator === "+" ? equation.rightOperand : -equation.rightOperand
    };
  }

  return {
    slope: equation.operator === "+" ? equation.rightOperand : -equation.rightOperand,
    intercept: equation.leftOperand
  };
}

export function solveNoobEquation(equation: NoobEquation) {
  const { slope, intercept } = noobSlopeAndIntercept(equation);
  return (equation.result - intercept) / slope;
}

function normalizeLinear({ coefficient, rhs }: StandardLinear) {
  if (coefficient === 0) {
    return { coefficient, rhs };
  }

  const divisor = gcd(Math.abs(coefficient), Math.abs(rhs));
  let nextCoefficient = divisor === 0 ? coefficient : coefficient / divisor;
  let nextRhs = divisor === 0 ? rhs : rhs / divisor;
  if (nextCoefficient < 0) {
    nextCoefficient *= -1;
    nextRhs *= -1;
  }
  return {
    coefficient: nextCoefficient,
    rhs: nextRhs
  };
}

function noobToStandard(equation: NoobEquation): StandardLinear {
  const { slope, intercept } = noobSlopeAndIntercept(equation);
  return {
    coefficient: slope,
    rhs: equation.result - intercept
  };
}

export function noobEquivalent(left: NoobEquation, right: NoobEquation) {
  const normalizedLeft = normalizeLinear(noobToStandard(left));
  const normalizedRight = normalizeLinear(noobToStandard(right));
  return (
    normalizedLeft.coefficient === normalizedRight.coefficient &&
    normalizedLeft.rhs === normalizedRight.rhs
  );
}

function normalizeSystem(equation: ProEquation): StandardSystem {
  const yCoefficient = equation.operator === "+" ? equation.yCoefficient : -equation.yCoefficient;
  const divisor = gcdMany([
    Math.abs(equation.xCoefficient),
    Math.abs(yCoefficient),
    Math.abs(equation.result)
  ]);

  let xCoefficient = equation.xCoefficient / divisor;
  let nextYCoefficient = yCoefficient / divisor;
  let rhs = equation.result / divisor;

  if (xCoefficient < 0 || (xCoefficient === 0 && nextYCoefficient < 0)) {
    xCoefficient *= -1;
    nextYCoefficient *= -1;
    rhs *= -1;
  }

  return {
    xCoefficient,
    yCoefficient: nextYCoefficient,
    rhs
  };
}

function systemKey(system: StandardSystem) {
  return `${system.xCoefficient}|${system.yCoefficient}|${system.rhs}`;
}

export function proEquivalent(
  current: readonly [ProEquation, ProEquation],
  expected: readonly [ProEquation, ProEquation]
) {
  const currentKeys = current.map((equation) => systemKey(normalizeSystem(equation))).sort();
  const expectedKeys = expected.map((equation) => systemKey(normalizeSystem(equation))).sort();
  return currentKeys[0] === expectedKeys[0] && currentKeys[1] === expectedKeys[1];
}

export function solveProSystem([first, second]: readonly [ProEquation, ProEquation]) {
  const left = normalizeSystem(first);
  const right = normalizeSystem(second);
  const determinant =
    left.xCoefficient * right.yCoefficient - right.xCoefficient * left.yCoefficient;

  const x =
    (left.rhs * right.yCoefficient - right.rhs * left.yCoefficient) / determinant;
  const y =
    (left.xCoefficient * right.rhs - right.xCoefficient * left.rhs) / determinant;

  return { x, y };
}

export function reduceProEquation(
  equations: readonly [ProEquation, ProEquation],
  variable: "x" | "y"
): ProReduction {
  const [first, second] = equations.map(normalizeSystem);

  if (variable === "x") {
    const coefficient =
      first.xCoefficient * second.yCoefficient - second.xCoefficient * first.yCoefficient;
    const rhs = first.rhs * second.yCoefficient - second.rhs * first.yCoefficient;
    return {
      coefficient,
      rhs,
      variable,
      value: rhs / coefficient
    };
  }

  const coefficient =
    first.yCoefficient * second.xCoefficient - second.yCoefficient * first.xCoefficient;
  const rhs = first.rhs * second.xCoefficient - second.rhs * first.xCoefficient;
  return {
    coefficient,
    rhs,
    variable,
    value: rhs / coefficient
  };
}

export function noobGraphState(equation: NoobEquation): NoobGraphState {
  const { slope, intercept } = noobSlopeAndIntercept(equation);
  const solutionX = solveNoobEquation(equation);
  const solutionY = equation.result;
  const xIntercept = -intercept / slope;
  const xBounds = clampBounds(
    Math.min(0, solutionX, xIntercept),
    Math.max(0, solutionX, xIntercept)
  );
  const yBounds = clampBounds(
    Math.min(0, intercept, equation.result),
    Math.max(0, intercept, equation.result)
  );

  return {
    slope,
    intercept,
    targetY: equation.result,
    solutionX,
    solutionY,
    viewport: ensureFourQuadrants({
      minX: xBounds.min,
      maxX: xBounds.max,
      minY: yBounds.min,
      maxY: yBounds.max
    })
  };
}

function lineSlopeIntercept(equation: ProEquation) {
  const ySigned = equation.operator === "+" ? equation.yCoefficient : -equation.yCoefficient;
  return {
    slope: -equation.xCoefficient / ySigned,
    intercept: equation.result / ySigned
  };
}

export function proGraphState(equations: readonly [ProEquation, ProEquation]): ProGraphState {
  const [firstEquation, secondEquation] = equations;
  const first = lineSlopeIntercept(firstEquation);
  const second = lineSlopeIntercept(secondEquation);
  const solution = solveProSystem(equations);
  const xIntercepts = [
    firstEquation.result / firstEquation.xCoefficient,
    secondEquation.result / secondEquation.xCoefficient
  ];
  const ySignedFirst = firstEquation.operator === "+" ? firstEquation.yCoefficient : -firstEquation.yCoefficient;
  const ySignedSecond = secondEquation.operator === "+" ? secondEquation.yCoefficient : -secondEquation.yCoefficient;
  const yIntercepts = [
    firstEquation.result / ySignedFirst,
    secondEquation.result / ySignedSecond
  ];

  const xBounds = clampBounds(
    Math.min(0, solution.x, ...xIntercepts),
    Math.max(0, solution.x, ...xIntercepts)
  );
  const yBounds = clampBounds(
    Math.min(0, solution.y, ...yIntercepts),
    Math.max(0, solution.y, ...yIntercepts)
  );

  return {
    first: {
      ...first,
      label: "Equation A",
      color: "#c63850"
    },
    second: {
      ...second,
      label: "Equation B",
      color: "#1368ce"
    },
    solutionX: solution.x,
    solutionY: solution.y,
    viewport: ensureFourQuadrants({
      minX: xBounds.min,
      maxX: xBounds.max,
      minY: yBounds.min,
      maxY: yBounds.max
    }),
    reductionX: reduceProEquation(equations, "x"),
    reductionY: reduceProEquation(equations, "y")
  };
}

export function ensureFourQuadrants(viewport: GraphViewport): GraphViewport {
  const xRadius = centeredRadius(viewport.minX, viewport.maxX);
  const yRadius = centeredRadius(viewport.minY, viewport.maxY);
  return {
    minX: -xRadius,
    maxX: xRadius,
    minY: -yRadius,
    maxY: yRadius
  };
}

function centeredRadius(min: number, max: number) {
  return Math.max(4, Math.ceil(Math.max(Math.abs(min), Math.abs(max)) + 1));
}

export function validateNoobDraft(
  draft: NoobDraftEquation,
  expected: NoobEquation
): ValidationResult {
  if (!completeNoobEquation(draft)) {
    return {
      status: "partial",
      message: "Fill every part of the equation first."
    };
  }

  if (noobEquivalent(draft, expected)) {
    return {
      status: "correct",
      message: `Yes. This equation leads to x = ${formatNumber(solveNoobEquation(expected))}.`
    };
  }

  return {
    status: "incorrect",
    message: "That equation does not match the story yet. Try checking the operator or one of the numbers."
  };
}

export function validateProDraft(
  current: readonly [ProDraftEquation, ProDraftEquation],
  expected: readonly [ProEquation, ProEquation]
): ValidationResult {
  if (!completeProEquation(current[0]) || !completeProEquation(current[1])) {
    return {
      status: "partial",
      message: "Complete both equations before you check."
    };
  }

  if (proEquivalent([current[0], current[1]], expected)) {
    const solution = solveProSystem(expected);
    return {
      status: "correct",
      message: `Exactly. The lines meet at (${formatNumber(solution.x)}, ${formatNumber(solution.y)}).`
    };
  }

  return {
    status: "incorrect",
    message: "These two equations do not describe the same pair of clues yet."
  };
}

export function buildNoobHint(
  draft: NoobDraftEquation,
  expected: NoobEquation
): { next: NoobDraftEquation; message: string } {
  if (draft.variableSide !== expected.variableSide) {
    return {
      next: { ...draft, variableSide: expected.variableSide },
      message: "Start by placing x on the side that matches the story."
    };
  }
  if (draft.leftOperand !== expected.leftOperand) {
    return {
      next: { ...draft, leftOperand: expected.leftOperand },
      message: "The first number should match how many groups or starting units the story gives."
    };
  }
  if (draft.operator !== expected.operator) {
    return {
      next: { ...draft, operator: expected.operator },
      message: "The story is adding or taking away something. Flip the sign."
    };
  }
  if (draft.rightOperand !== expected.rightOperand) {
    return {
      next: { ...draft, rightOperand: expected.rightOperand },
      message: "Update the second number to match the story."
    };
  }
  if (draft.result !== expected.result) {
    return {
      next: { ...draft, result: expected.result },
      message: "The result on the right side should be this number."
    };
  }
  return {
    next: draft,
    message: "Everything is already in the right place. Try Check."
  };
}

export function buildProHint(
  current: readonly [ProDraftEquation, ProDraftEquation],
  expected: readonly [ProEquation, ProEquation]
): { next: [ProDraftEquation, ProDraftEquation]; message: string } {
  const compareOne = (
    draft: ProDraftEquation,
    target: ProEquation
  ): { updated: ProDraftEquation; changed: boolean; message: string } => {
    if (draft.xCoefficient !== target.xCoefficient) {
      return {
        updated: { ...draft, xCoefficient: target.xCoefficient },
        changed: true,
        message: "Start with the x coefficient in this equation."
      };
    }
    if (draft.operator !== target.operator) {
      return {
        updated: { ...draft, operator: target.operator },
        changed: true,
        message: "The sign between x and y needs to change."
      };
    }
    if (draft.yCoefficient !== target.yCoefficient) {
      return {
        updated: { ...draft, yCoefficient: target.yCoefficient },
        changed: true,
        message: "Match the y coefficient to the clue."
      };
    }
    if (draft.result !== target.result) {
      return {
        updated: { ...draft, result: target.result },
        changed: true,
        message: "The result on the right side should be this number."
      };
    }
    return {
      updated: draft,
      changed: false,
      message: ""
    };
  };

  const first = compareOne(current[0], expected[0]);
  if (first.changed) {
    return {
      next: [first.updated, current[1]],
      message: first.message
    };
  }

  const second = compareOne(current[1], expected[1]);
  if (second.changed) {
    return {
      next: [current[0], second.updated],
      message: second.message
    };
  }

  return {
    next: [current[0], current[1]],
    message: "Both equations already look ready. Try Check."
  };
}

export function createRandomNoobEquation(forceNegativeSolution = false): NoobEquation {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const variableSide: VariableSide = Math.random() > 0.5 ? "left" : "right";
    const leftOperand = randomInt(1, 6);
    const operator: Operator = Math.random() > 0.5 ? "+" : "-";
    const rightOperand = randomInt(1, 10);
    const solution = forceNegativeSolution
      ? randomInt(-6, -1)
      : Math.random() < 0.3
        ? randomInt(-6, -1)
        : randomInt(1, 6);
    const { result } =
      variableSide === "left"
        ? {
            result:
              leftOperand * solution +
              (operator === "+" ? rightOperand : -rightOperand)
          }
        : {
            result:
              leftOperand +
              (operator === "+" ? rightOperand : -rightOperand) * solution
          };

    if (result >= MIN_PICKER_VALUE && result <= MAX_PICKER_VALUE) {
      return {
        variableSide,
        leftOperand,
        operator,
        rightOperand,
        result
      };
    }
  }

  return {
    variableSide: "left",
    leftOperand: 2,
    operator: "+",
    rightOperand: 5,
    result: 9
  };
}

export function createRandomProEquations(forceNegative = false): [ProEquation, ProEquation] {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const x = forceNegative
      ? randomInt(-5, -1)
      : Math.random() < 0.35
        ? randomInt(-5, -1)
        : randomInt(1, 6);
    const y = forceNegative
      ? randomInt(-5, 5)
      : Math.random() < 0.35
        ? randomInt(-5, -1)
        : randomInt(1, 6);

    const first: ProEquation = {
      xCoefficient: randomInt(1, 6),
      operator: Math.random() > 0.5 ? "+" : "-",
      yCoefficient: randomInt(1, 6),
      result: 1
    };
    const second: ProEquation = {
      xCoefficient: randomInt(1, 6),
      operator: Math.random() > 0.5 ? "+" : "-",
      yCoefficient: randomInt(1, 6),
      result: 1
    };

    const signedFirst = first.operator === "+" ? first.yCoefficient : -first.yCoefficient;
    const signedSecond = second.operator === "+" ? second.yCoefficient : -second.yCoefficient;
    const determinant =
      first.xCoefficient * signedSecond - second.xCoefficient * signedFirst;
    if (determinant === 0) {
      continue;
    }

    const firstResult = first.xCoefficient * x + signedFirst * y;
    const secondResult = second.xCoefficient * x + signedSecond * y;
    if (
      firstResult >= MIN_PICKER_VALUE &&
      firstResult <= MAX_PICKER_VALUE &&
      secondResult >= MIN_PICKER_VALUE &&
      secondResult <= MAX_PICKER_VALUE
    ) {
      first.result = firstResult;
      second.result = secondResult;
      return [first, second];
    }
  }

  return [
    { xCoefficient: 1, operator: "+", yCoefficient: 1, result: 2 },
    { xCoefficient: 1, operator: "-", yCoefficient: 2, result: 5 }
  ];
}

export function projectPoint(
  x: number,
  y: number,
  viewport: GraphViewport,
  width: number,
  height: number
) {
  return {
    x: ((x - viewport.minX) / (viewport.maxX - viewport.minX)) * width,
    y: height - ((y - viewport.minY) / (viewport.maxY - viewport.minY)) * height
  };
}

export function linePath(
  slope: number,
  intercept: number,
  viewport: GraphViewport,
  width: number,
  height: number
) {
  const left = projectPoint(viewport.minX, slope * viewport.minX + intercept, viewport, width, height);
  const right = projectPoint(viewport.maxX, slope * viewport.maxX + intercept, viewport, width, height);
  return `M ${left.x} ${left.y} L ${right.x} ${right.y}`;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
