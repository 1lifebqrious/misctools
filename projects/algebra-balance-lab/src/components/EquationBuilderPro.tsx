import NumberPicker from "./NumberPicker";
import type { ProDraftEquation, ProEquation } from "../types";

type EquationBuilderProProps = {
  equation: ProEquation | ProDraftEquation;
  index: 0 | 1;
  onNumberChange: (
    equationIndex: 0 | 1,
    field: "xCoefficient" | "yCoefficient" | "result",
    value: number | null
  ) => void;
  onToggleOperator: (equationIndex: 0 | 1) => void;
  allowEmpty?: boolean;
};

function EquationBuilderPro({
  equation,
  index,
  onNumberChange,
  onToggleOperator,
  allowEmpty = false
}: EquationBuilderProProps) {
  return (
    <section className="builder-card">
      <div className="builder-summary">
        <p className="eyebrow">Equation {index + 1}</p>
        <div className="equation-row inline-equation-editor">
          <NumberPicker
            label={`Equation ${index + 1} X coefficient`}
            value={equation.xCoefficient}
            onChange={(value) => onNumberChange(index, "xCoefficient", value)}
            allowEmpty={allowEmpty}
            variant="equation"
          />
          <span className="equation-variable variable-x">X</span>
          <button
            type="button"
            className="primary-button equation-operator-button"
            onClick={() => onToggleOperator(index)}
            aria-label={`Toggle operator for equation ${index + 1}`}
          >
            {equation.operator ?? "?"}
          </button>
          <NumberPicker
            label={`Equation ${index + 1} Y coefficient`}
            value={equation.yCoefficient}
            onChange={(value) => onNumberChange(index, "yCoefficient", value)}
            allowEmpty={allowEmpty}
            variant="equation"
          />
          <span className="equation-variable variable-y">Y</span>
          <span className="equation-symbol">=</span>
          <NumberPicker
            label={`Equation ${index + 1} result`}
            value={equation.result}
            onChange={(value) => onNumberChange(index, "result", value)}
            allowEmpty={allowEmpty}
            variant="equation"
          />
        </div>
      </div>
    </section>
  );
}

export default EquationBuilderPro;
