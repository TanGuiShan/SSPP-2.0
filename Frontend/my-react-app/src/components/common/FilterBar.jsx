import { useState } from "react";
import SgdsCheckbox from "@govtechsg/sgds-web-component/react/checkbox";
import Button from "./Button";
import { Input } from "./Input";

export default function FilterBar({
  filters,
  onChange,
  groups,
  resultCount,
  totalCount,
  defaultOpen = false,
}) {
  // Collapsed by default: the panel is tall enough to push the actual results
  // below the fold, which is the opposite of helpful on a browse page.
  const [expanded, setExpanded] = useState(defaultOpen);

  const set = (key, value) => onChange({ ...filters, [key]: value });

  const toggleIn = (key, optionValue) => {
    const current = filters[key] ?? [];
    set(
      key,
      current.includes(optionValue)
        ? current.filter((value) => value !== optionValue)
        : [...current, optionValue],
    );
  };

  const activeCount =
    groups.reduce((count, group) => count + (filters[group.key]?.length ?? 0), 0) +
    (filters.availableFrom ? 1 : 0) +
    (filters.availableTo ? 1 : 0);

  const clearAll = () => {
    const cleared = Object.fromEntries(groups.map((group) => [group.key, []]));
    onChange({ ...cleared, availableFrom: "", availableTo: "" });
  };

  return (
    <section className="card sspp-filter-panel" aria-label="Search filters">
      <div className="sspp-filter-heading">
        <button
          type="button"
          className="sspp-filter-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="sspp-filter-body"
        >
          <span
            className={`sspp-filter-chevron ${expanded ? "is-open" : ""}`}
            aria-hidden="true"
          >
            ▸
          </span>
          <span className="sspp-filter-heading-text">
            <span className="sspp-filter-title">
              Filters
              {activeCount > 0 && (
                <span className="sspp-filter-badge">{activeCount}</span>
              )}
            </span>
            <span className="sspp-filter-count">
              Showing {resultCount} of {totalCount}
            </span>
          </span>
        </button>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>

      <div id="sspp-filter-body" hidden={!expanded}>
      <div className="sspp-filter-dates">
        <Input
          type="date"
          label="Available from"
          value={filters.availableFrom ?? ""}
          onChange={(event) => set("availableFrom", event.target.value)}
        />
        <Input
          type="date"
          label="Available to"
          value={filters.availableTo ?? ""}
          onChange={(event) => set("availableTo", event.target.value)}
        />
      </div>

      <div className="sspp-filter-groups">
        {groups.map((group) => (
          <fieldset key={group.key}>
            <legend>{group.label}</legend>
            <div className="sgds-choice-grid">
              {group.options.map((option) => (
                <SgdsCheckbox
                  key={option.value}
                  checked={(filters[group.key] ?? []).includes(option.value)}
                  value={option.value}
                  onSgdsChange={() => toggleIn(group.key, option.value)}
                >
                  {option.label}
                </SgdsCheckbox>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      </div>
    </section>
  );
}
