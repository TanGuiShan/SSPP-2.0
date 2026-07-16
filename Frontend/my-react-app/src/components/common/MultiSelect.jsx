import React from "react";
import { Label } from "./Input";

/**
 * Chip-style multi-select. Used for school levels preferred, topics, etc.
 * @param {{value: string, label: string}[]} options
 * @param {string[]} value - currently selected values
 * @param {(next: string[]) => void} onChange
 */
export function MultiSelect({ label, required, options, value = [], onChange, hint }) {
  const toggle = (v) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="mb-5">
      {label && <Label required={required}>{label}</Label>}
      {hint && <p className="text-xs text-[#78716C] -mt-1 mb-2">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              aria-pressed={active}
              className={`px-3.5 py-2 rounded-full text-xs border transition-colors ${
                active
                  ? "bg-[#1C1917] border-[#1C1917] text-white"
                  : "bg-white border-[#E7E5E4] text-[#44403C] hover:border-[#A8A29E]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Bordered radio cards — for choices that need a description, like mobility.
 * @param {{value: string, label: string, description?: string}[]} options
 */
export function RadioCards({ label, required, options, value, onChange, name }) {
  return (
    <div className="mb-5">
      {label && <Label required={required}>{label}</Label>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                active ? "border-[#1C1917] bg-[#FAFAF9]" : "border-[#E7E5E4] hover:border-[#A8A29E]"
              }`}
            >
              <input
                type="radio"
                name={name}
                checked={active}
                onChange={() => onChange(opt.value)}
                className="mt-0.5 w-4 h-4 accent-[#1C1917] shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-[#1C1917]">{opt.label}</p>
                {opt.description && (
                  <p className="text-xs text-[#78716C] mt-0.5">{opt.description}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
