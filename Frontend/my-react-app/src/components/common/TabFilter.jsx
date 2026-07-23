import { countForTab } from "../../utils/tabs";

/**
 * The status tab strip above a list. Every list page uses this so the school,
 * army and admin views look and behave identically.
 *
 * @param {{key,label,statuses}[]} tabs   from tabsFor([...])
 * @param {string} value                  active tab key
 * @param {(key:string)=>void} onChange   callback when a tab is clicked
 * @param {any[]} items                   full list, for the count badges
 */
export default function TabFilter({ tabs, value, onChange, items = [] }) {
  if (!tabs?.length) return null;

  return (
    <div className="sspp-filter-tabs" role="tablist">
      {tabs.map((tab) => {
        const count = countForTab(items, tab);
        const active = value === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key) }
            className={`sspp-filter-tab  ${active ? "sspp-filter-tab--active !text-white" : ""}`}
          >
            {tab.label}
            {count > 0 && <span className="sspp-filter-tab-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
