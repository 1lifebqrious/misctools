import {
  buildNoobHint,
  buildProHint,
  createRandomNoobEquation,
  createRandomProEquations,
  ensureFourQuadrants,
  noobEquivalent,
  noobGraphState,
  proEquivalent,
  proGraphState,
  solveNoobEquation,
  solveProSystem,
  validateNoobDraft
} from "./math";
import { NOOB_QUESTIONS, PRO_QUESTIONS } from "./problems";

describe("algebra graph math", () => {
  it("solves noob equations including negative answers", () => {
    const equation = { variableSide: "left" as const, leftOperand: 2, operator: "+" as const, rightOperand: 10, result: 4 };
    expect(solveNoobEquation(equation)).toBe(-3);
    const graph = noobGraphState(equation);
    expect(graph.viewport.minX).toBeLessThanOrEqual(-3);
    expect(graph.viewport.minY).toBeLessThanOrEqual(-2);
  });

  it("accepts equivalent noob equations with switched variable side", () => {
    const expected = { variableSide: "left" as const, leftOperand: 2, operator: "+" as const, rightOperand: 10, result: 4 };
    const alternate = { variableSide: "right" as const, leftOperand: 10, operator: "+" as const, rightOperand: 2, result: 4 };
    expect(noobEquivalent(expected, alternate)).toBe(true);
  });

  it("solves pro systems with negative quadrants visible", () => {
    const equations = [
      { xCoefficient: 1, operator: "+" as const, yCoefficient: 1, result: 2 },
      { xCoefficient: 1, operator: "+" as const, yCoefficient: 2, result: 1 }
    ] as const;
    const solution = solveProSystem(equations);
    expect(solution).toEqual({ x: 3, y: -1 });
    const graph = proGraphState(equations);
    expect(graph.viewport.minY).toBeLessThanOrEqual(-1);
  });

  it("matches equivalent pro systems regardless of order", () => {
    const expected = PRO_QUESTIONS[0].expected;
    const reordered = [expected[1], expected[0]] as [typeof expected[0], typeof expected[1]];
    expect(proEquivalent(reordered, expected)).toBe(true);
  });

  it("deterministic hints fill the next noob field", () => {
    const question = NOOB_QUESTIONS[0];
    const hint = buildNoobHint(
      { variableSide: null, leftOperand: null, operator: null, rightOperand: null, result: null },
      question.expected
    );
    expect(hint.next.variableSide).toBe(question.expected.variableSide);
  });

  it("deterministic hints fill the next pro field", () => {
    const question = PRO_QUESTIONS[0];
    const hint = buildProHint(
      [
        { xCoefficient: null, operator: null, yCoefficient: null, result: null },
        { xCoefficient: null, operator: null, yCoefficient: null, result: null }
      ],
      question.expected
    );
    expect(hint.next[0].xCoefficient).toBe(question.expected[0].xCoefficient);
  });

  it("generator can intentionally create negative-solution noob problems", () => {
    const equation = createRandomNoobEquation(true);
    expect(solveNoobEquation(equation)).toBeLessThan(0);
  });

  it("generator can intentionally create negative-solution pro problems", () => {
    const equations = createRandomProEquations(true);
    const solution = solveProSystem(equations);
    expect(solution.x < 0 || solution.y < 0).toBe(true);
  });

  it("practice validation distinguishes partial state", () => {
    const result = validateNoobDraft(
      { variableSide: null, leftOperand: null, operator: null, rightOperand: null, result: null },
      NOOB_QUESTIONS[0].expected
    );
    expect(result.status).toBe("partial");
  });

  it("viewport helper always keeps four quadrants available", () => {
    expect(ensureFourQuadrants({ minX: 1, maxX: 4, minY: 2, maxY: 6 })).toEqual({
      minX: -5,
      maxX: 5,
      minY: -7,
      maxY: 7
    });
  });
});
