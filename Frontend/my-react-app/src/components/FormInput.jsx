// FormInput.jsx
// A reusable input field that pairs a label + input together.
// Instead of copy-pasting the same label/input HTML in every page,
// we define it ONCE here and just pass in props to customise it.
//
// Props:
//   id         - links the label to the input (accessibility)
//   label      - the text shown above the input
//   type       - "email", "password", "text", etc.
//   value      - the current value (controlled by parent)
//   onChange   - called when user types (updates parent state)
//   placeholder
//   rightLabel - optional element shown on the right of the label
//                (e.g. the "Show/Hide" password toggle)
//   autoComplete - hint to the browser for autofill

export default function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  rightLabel,
  autoComplete,
}) {
  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">
        {label}
        {/* rightLabel lets the parent slot in extra UI
            (e.g. a Show/Hide button) without this component
            needing to know anything about passwords */}
        {rightLabel && <span>{rightLabel}</span>}
      </label>
      <input
        id={id}
        type={type}
        className="field-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
      />
    </div>
  )
}
