import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { ChevronLeft, ChevronRight } from "../../assets/icons";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const TIMINGS = ["Morning (0900–1200h)", "Afternoon (1400–1700h)", "Full day"];

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function AvailabilityPage() {
  const [cursor, setCursor] = useState({ year: 2026, month: 5 }); // June 2026
  const [selected, setSelected] = useState([]);
  const [timings, setTimings] = useState([TIMINGS[0]]);

  const toggleTiming = (t) =>
    setTimings((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const cells = buildMonthGrid(cursor.year, cursor.month);

  const keyFor = (day) => `${cursor.year}-${cursor.month}-${day}`;

  const toggleDay = (day) => {
    const key = keyFor(day);
    setSelected((prev) =>
      prev.some((d) => d.key === key)
        ? prev.filter((d) => d.key !== key)
        : [...prev, { key, day, month: cursor.month, year: cursor.year }]
    );
  };

  const shiftMonth = (delta) => {
    setCursor(({ year, month }) => {
      const next = month + delta;
      if (next < 0) return { year: year - 1, month: 11 };
      if (next > 11) return { year: year + 1, month: 0 };
      return { year, month: next };
    });
  };

  const isSelected = (day) => selected.some((d) => d.key === keyFor(day));

  return (
    <>
      <PageHeader
        eyebrow="Available Dates"
        title="Available Schedule"
        subtitle="Select the dates your unit is available for engagement"
        action={
          <Button
            disabled={selected.length === 0 || timings.length === 0}
            onClick={() => console.log({ dates: selected, timings })}
          >
            Save availability
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Calendar */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="p-2 rounded-lg text-[#78716C] hover:bg-[#F5F5F4] transition-colors"
            >
              <ChevronLeft />
            </button>
            <p className="text-lg font-semibold">{MONTHS[cursor.month]} {cursor.year}</p>
            <button
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="p-2 rounded-lg text-[#78716C] hover:bg-[#F5F5F4] transition-colors"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[11px] uppercase tracking-wide text-[#A8A29E] py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) =>
              day === null ? (
                <div key={`pad-${i}`} />
              ) : (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  aria-pressed={isSelected(day)}
                  className={`aspect-square rounded-lg text-sm transition-colors ${
                    isSelected(day)
                      ? "bg-[#1C1917] text-white font-medium"
                      : "text-[#44403C] hover:bg-[#F5F5F4]"
                  }`}
                >
                  {day}
                </button>
              )
            )}
          </div>
        </div>

        {/* Selected dates */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Selected dates</h2>
          <div className="card p-5 min-h-[240px]">
            {selected.length === 0 ? (
              <p className="text-sm text-[#A8A29E] italic text-center py-12">
                No dates selected yet
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selected
                  .slice()
                  .sort((a, b) => a.day - b.day)
                  .map((d) => (
                    <button
                      key={d.key}
                      onClick={() => toggleDay(d.day)}
                      className="px-3 py-1.5 rounded-full bg-[#F5F5F4] text-xs text-[#44403C] hover:bg-[#E7E5E4] transition-colors"
                    >
                      {d.day} {MONTHS[d.month].slice(0, 3)} ×
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preferred timing */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-1">Preferred timing</h2>
        <p className="text-sm text-[#78716C] mb-4">
          Select every slot your unit can do — applies to all dates chosen above
        </p>
        <div className="flex gap-3 flex-wrap">
          {TIMINGS.map((t) => {
            const active = timings.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTiming(t)}
                aria-pressed={active}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-colors ${
                  active
                    ? "border-[#1C1917] bg-[#1C1917] text-white"
                    : "border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    active ? "bg-white border-white" : "border-[#A8A29E]"
                  }`}
                >
                  {active && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1C1917" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 6" />
                    </svg>
                  )}
                </span>
                {t}
              </button>
            );
          })}
        </div>
        {timings.length === 0 && (
          <p className="text-xs text-[#C2542F] mt-3">Pick at least one timing slot.</p>
        )}
      </div>
    </>
  );
}