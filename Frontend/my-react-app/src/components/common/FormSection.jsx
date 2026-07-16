import React from "react";

/**
 * A titled block inside a long scrolling form. Keeps the signup pages
 * readable without turning them into a multi-step wizard.
 */
export default function FormSection({ step, title, description, children }) {
  return (
    <section className="card p-6 md:p-8 mb-5">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {step && (
            <span className="w-6 h-6 rounded-full bg-[#1C1917] text-white text-xs font-medium flex items-center justify-center shrink-0">
              {step}
            </span>
          )}
          <h2 className="text-lg font-semibold text-[#1C1917]">{title}</h2>
        </div>
        {description && (
          <p className="text-sm text-[#78716C] mt-1.5 ml-9">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
