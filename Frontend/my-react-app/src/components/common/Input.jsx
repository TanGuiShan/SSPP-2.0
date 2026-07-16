import React from "react";

const fieldBase =
  "w-full rounded-lg bg-[#F5F5F4] border border-transparent px-4 py-3 text-sm text-[#1C1917] " +
  "placeholder:text-[#A8A29E] focus:bg-white focus:border-[#1C1917] focus:outline-none transition-colors";

export function Label({ children, required }) {
  return (
    <label className="block text-sm text-[#44403C] mb-1.5">
      {children}
      {required && <span className="text-[#C2542F] ml-0.5">*</span>}
    </label>
  );
}

export function Input({ label, required, id, error, className = "", ...rest }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="mb-5">
      {label && <Label required={required} htmlFor={inputId}>{label}</Label>}
      <input id={inputId} className={`${fieldBase} ${error ? "border-[#C2542F]" : ""} ${className}`} {...rest} />
      {error && <p className="mt-1 text-xs text-[#C2542F]">{error}</p>}
    </div>
  );
}

export function TextArea({ label, required, id, rows = 4, className = "", ...rest }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="mb-5">
      {label && <Label required={required}>{label}</Label>}
      <textarea id={inputId} rows={rows} className={`${fieldBase} resize-none ${className}`} {...rest} />
    </div>
  );
}

export function Select({ label, required, id, options = [], placeholder, className = "", ...rest }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="mb-5">
      {label && <Label required={required}>{label}</Label>}
      <select id={inputId} defaultValue="" className={`${fieldBase} appearance-none ${className}`} {...rest}>
        {placeholder && <option value="" disabled className="text-[#A8A29E]">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}