import SgdsComboBox from "@govtechsg/sgds-web-component/react/combo-box";
import SgdsDatepicker from "@govtechsg/sgds-web-component/react/datepicker";
import SgdsInput from "@govtechsg/sgds-web-component/react/input";
import SgdsSelect from "@govtechsg/sgds-web-component/react/select";
import SgdsSelectOption from "@govtechsg/sgds-web-component/react/select-option";
import SgdsTextarea from "@govtechsg/sgds-web-component/react/textarea";

function makeId(label = "field") {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function toDisplayDate(isoDate) {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function toIsoDate(displayDate) {
  if (!displayDate || !/^\d{2}\/\d{2}\/\d{4}$/.test(displayDate)) return "";
  const [day, month, year] = displayDate.split("/");
  return `${year}-${month}-${day}`;
}

function forwardChange(onChange, event, value = event?.target?.value ?? "") {
  if (!onChange) return;

  // Existing forms expect a normal-looking `event.target.value`. SGDS custom
  // events already expose their host as target, but datepicker needs a format
  // conversion before the value reaches the current form logic.
  onChange({
    ...event,
    target: {
      ...(event?.target ?? {}),
      value,
      name: event?.target?.name,
    },
    currentTarget: {
      ...(event?.currentTarget ?? event?.target ?? {}),
      value,
    },
  });
}

export function Label({ children, required, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="sgds-field-label">
      {children}
      {required && <span aria-hidden="true"> *</span>}
    </label>
  );
}

export function Input({
  label,
  required,
  id,
  error,
  className = "",
  onChange,
  value,
  type = "text",
  hintText = "",
  min,
  max,
  ...rest
}) {
  const inputId = id || makeId(label);

  if (type === "date") {
    return (
      <div className={`sgds-field ${className}`}>
        <SgdsDatepicker
          id={inputId}
          label={label}
          required={required}
          value={toDisplayDate(value)}
          mode="single"
          hintText={hintText}
          invalid={Boolean(error)}
          invalidFeedback={error || ""}
          hasFeedback={Boolean(error)}
          minDate={min ? new Date(min).toISOString() : undefined}
          maxDate={max ? new Date(max).toISOString() : undefined}
          onSgdsChangeDate={(event) =>
            forwardChange(onChange, event, toIsoDate(event.target.value))
          }
          {...rest}
        />
      </div>
    );
  }

  return (
    <div className={`sgds-field ${className}`}>
      <SgdsInput
        id={inputId}
        label={label}
        required={required}
        type={type}
        value={value ?? ""}
        hintText={hintText}
        invalid={Boolean(error)}
        invalidFeedback={error || ""}
        hasFeedback={error ? "both" : "style"}
        min={min === undefined ? undefined : Number(min)}
        max={max === undefined ? undefined : Number(max)}
        onSgdsInput={(event) => forwardChange(onChange, event)}
        onSgdsChange={(event) => forwardChange(onChange, event)}
        {...rest}
      />
    </div>
  );
}

export function TextArea({
  label,
  required,
  id,
  rows = 4,
  className = "",
  error,
  onChange,
  value,
  hintText = "",
  ...rest
}) {
  const inputId = id || makeId(label);

  return (
    <div className={`sgds-field ${className}`}>
      <SgdsTextarea
        id={inputId}
        label={label}
        required={required}
        rows={rows}
        value={value ?? ""}
        hintText={hintText}
        invalid={Boolean(error)}
        invalidFeedback={error || ""}
        hasFeedback={Boolean(error)}
        resize="vertical"
        onSgdsInput={(event) => forwardChange(onChange, event)}
        onSgdsChange={(event) => forwardChange(onChange, event)}
        {...rest}
      />
    </div>
  );
}

export function Select({
  label,
  required,
  id,
  options = [],
  placeholder = "Select an option",
  className = "",
  error,
  onChange,
  value,
  hintText = "",
  ...rest
}) {
  const inputId = id || makeId(label);

  return (
    <div className={`sgds-field ${className}`}>
      <SgdsSelect
        id={inputId}
        label={label}
        required={required}
        value={value ?? ""}
        placeholder={placeholder}
        hintText={hintText}
        invalid={Boolean(error)}
        invalidFeedback={error || ""}
        hasFeedback={Boolean(error)}
        onSgdsChange={(event) => forwardChange(onChange, event)}
        onSgdsSelect={(event) => forwardChange(onChange, event)}
        {...rest}
      >
        {options.map((option) => {
          const optionValue = String(option.value ?? option);
          return (
            <SgdsSelectOption key={optionValue} value={optionValue}>
              {option.label ?? option}
            </SgdsSelectOption>
          );
        })}
      </SgdsSelect>
    </div>
  );
}

/**
 * Searchable single-select, for long option lists (e.g. the 183 primary and
 * 148 secondary schools). A plain <Select> is unusable at that length, so this
 * uses SGDS's combo-box, which filters as you type.
 *
 * Same prop shape as <Select> so it's a drop-in: options=[{value,label}].
 */
export function ComboBox({
  label,
  required,
  options = [],
  value,
  onChange,
  placeholder = "Search or select...",
  hintText,
  error,
  name,
  className = "",
}) {
  // SGDS wants [{ label, value }] on menuList.
  const menuList = options.map((o) => ({ label: o.label, value: o.value }));

  return (
    <div className={`sgds-field ${className}`.trim()}>
      <SgdsComboBox
        label={label}
        name={name}
        required={required}
        placeholder={placeholder}
        hintText={hintText}
        menuList={menuList}
        value={value ?? ""}
        clearable
        invalid={Boolean(error)}
        invalidFeedback={error || undefined}
        hasFeedback={Boolean(error)}
        onSgdsSelect={(event) => {
          // Selection can arrive on detail or on the element's value.
          const next =
            event?.detail?.value ??
            event?.target?.value ??
            "";
          onChange?.(next);
        }}
        onSgdsChange={(event) => {
          const next = event?.detail?.value ?? event?.target?.value ?? "";
          onChange?.(next);
        }}
      />
    </div>
  );
}
