import { MAX_PICKER_VALUE, MIN_PICKER_VALUE } from "../constants";
import { clampPickerValue } from "../lib/math";

type NumberPickerProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  allowEmpty?: boolean;
  variant?: "stacked" | "inline" | "equation";
};

function NumberPicker({
  label,
  value,
  onChange,
  allowEmpty = false,
  variant = "stacked"
}: NumberPickerProps) {
  const decrease = () => {
    if (value === null) {
      onChange(MIN_PICKER_VALUE);
      return;
    }
    onChange(clampPickerValue(value - 1));
  };

  const increase = () => {
    if (value === null) {
      onChange(MIN_PICKER_VALUE);
      return;
    }
    onChange(clampPickerValue(value + 1));
  };

  if (variant === "inline") {
    return (
      <div className="inline-picker" role="group" aria-label={label}>
        <button
          type="button"
          className="ghost-button tiny round-button"
          onClick={decrease}
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        <span className={value === null ? "picker-value inline empty" : "picker-value inline"}>
          {value === null ? "?" : value}
        </span>
        <button
          type="button"
          className="ghost-button tiny round-button"
          onClick={increase}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    );
  }

  if (variant === "equation") {
    return (
      <div className="equation-picker" role="group" aria-label={label}>
        <button
          type="button"
          className="ghost-button tiny round-button equation-step-button"
          onClick={increase}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
        <span className={value === null ? "picker-value equation empty" : "picker-value equation"}>
          {value === null ? "?" : value}
        </span>
        <button
          type="button"
          className="ghost-button tiny round-button equation-step-button"
          onClick={decrease}
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
      </div>
    );
  }

  return (
    <div className="picker-block">
      <span className="picker-label">{label}</span>
      <div className="picker-controls">
        <button type="button" className="ghost-button small" onClick={decrease} aria-label={`Decrease ${label}`}>
          -
        </button>
        <span className={value === null ? "picker-value empty" : "picker-value"}>
          {value === null ? "?" : value}
        </span>
        <button type="button" className="ghost-button small" onClick={increase} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
      {allowEmpty ? (
        <button
          type="button"
          className="ghost-button tiny"
          onClick={() => onChange(null)}
          aria-label={`Clear ${label}`}
        >
          Clear
        </button>
      ) : null}
      <span className="picker-range">
        {MIN_PICKER_VALUE} to {MAX_PICKER_VALUE}
      </span>
    </div>
  );
}

export default NumberPicker;
