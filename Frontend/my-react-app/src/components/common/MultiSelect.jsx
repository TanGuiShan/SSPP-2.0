import SgdsCheckbox from "@govtechsg/sgds-web-component/react/checkbox";
import SgdsRadio from "@govtechsg/sgds-web-component/react/radio";
import SgdsRadioGroup from "@govtechsg/sgds-web-component/react/radio-group";
import { Label } from "./Input";

/** Multi-value selection built from SGDS checkboxes. */
export function MultiSelect({ label, required, options, value = [], onChange, hint }) {
  const toggle = (optionValue) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <fieldset className="sgds-choice-field">
      {label && <Label required={required}>{label}</Label>}
      {hint && <p className="sgds-field-hint">{hint}</p>}
      <div className="sgds-choice-grid">
        {options.map((option) => (
          <SgdsCheckbox
            key={option.value}
            value={option.value}
            checked={value.includes(option.value)}
            onSgdsChange={() => toggle(option.value)}
          >
            {option.label}
          </SgdsCheckbox>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Single-value selection built from SGDS radio controls.
 *
 * IMPORTANT: SgdsRadioGroup finds its radios with queryAssignedElements(),
 * which only sees DIRECT slotted children. Wrapping each <SgdsRadio> in a
 * layout div hides them from the group, so selecting one never deselects the
 * others (they all appear checked). Radios must therefore be direct children
 * of the group — the card look is applied to the radio itself, and any
 * description is rendered inside the radio.
 */
export function RadioCards({ label, required, options, value, onChange, name }) {
  return (
    <div className="sgds-choice-field sgds-radio-card-group">
      <SgdsRadioGroup
        label={label}
        required={required}
        name={name}
        value={value ?? ""}
        onSgdsChange={(event) => onChange(event.detail?.value ?? event.target.value)}
      >
        {options.map((option) => (
          <SgdsRadio key={option.value} value={option.value} className="sgds-radio-card">
            {option.label}
            {option.description && (
              <span className="sgds-radio-card-desc">{option.description}</span>
            )}
          </SgdsRadio>
        ))}
      </SgdsRadioGroup>
    </div>
  );
}
