import NumberPicker from "./NumberPicker";
import type { NoobDraftEquation, NoobEquation } from "../types";

type EquationBuilderNoobProps = {
  equation: NoobEquation | NoobDraftEquation;
  onNumberChange: (
    field: "leftOperand" | "rightOperand" | "result",
    value: number | null
  ) => void;
  onToggleOperator: () => void;
  onToggleVariableSide: () => void;
  allowEmpty?: boolean;
};

function renderOperator(operator: string | null) {
  return operator ?? "?";
}

function EquationBuilderNoob({
  equation,
  onNumberChange,
  onToggleOperator,
  onToggleVariableSide,
  allowEmpty = false
}: EquationBuilderNoobProps) {
  return (
    <section className="builder-card">
      <div className="builder-summary">
        <p className="eyebrow">Equation view</p>
        <div className="equation-row inline-equation-editor">
          {equation.variableSide === "left" ? (
            <>
              <NumberPicker
                label="Coefficient"
                value={equation.leftOperand}
                onChange={(value) => onNumberChange("leftOperand", value)}
                allowEmpty={allowEmpty}
                variant="equation"
              />
              <span className="equation-variable variable-x">X</span>
              <button
                type="button"
                className="primary-button equation-operator-button"
                onClick={onToggleOperator}
                aria-label="Toggle operator"
              >
                {renderOperator(equation.operator)}
              </button>
              <NumberPicker
                label="Constant"
                value={equation.rightOperand}
                onChange={(value) => onNumberChange("rightOperand", value)}
                allowEmpty={allowEmpty}
                variant="equation"
              />
            </>
          ) : (
            <>
              <NumberPicker
                label="Left value"
                value={equation.leftOperand}
                onChange={(value) => onNumberChange("leftOperand", value)}
                allowEmpty={allowEmpty}
                variant="equation"
              />
              <button
                type="button"
                className="primary-button equation-operator-button"
                onClick={onToggleOperator}
                aria-label="Toggle operator"
              >
                {renderOperator(equation.operator)}
              </button>
              <NumberPicker
                label="Coefficient"
                value={equation.rightOperand}
                onChange={(value) => onNumberChange("rightOperand", value)}
                allowEmpty={allowEmpty}
                variant="equation"
              />
              <span className="equation-variable variable-x">X</span>
            </>
          )}
          <span className="equation-symbol">=</span>
          <NumberPicker
            label="Result"
            value={equation.result}
            onChange={(value) => onNumberChange("result", value)}
            allowEmpty={allowEmpty}
            variant="equation"
          />
        </div>
      </div>

      <button type="button" className="ghost-button" onClick={onToggleVariableSide}>
        Switch variable side
      </button>
    </section>
  );
}

export default EquationBuilderNoob;
