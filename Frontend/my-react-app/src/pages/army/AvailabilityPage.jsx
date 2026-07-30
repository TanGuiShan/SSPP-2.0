import { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { ChevronLeft, ChevronRight } from "../../assets/icons";
import { useAuth } from "../../hooks/useAuth";
import { updateProfile } from "../../services/firebase/profile.service";
import { publishProviderCatalog } from "../../services/firebase/catalog.service";
import { TIMING_SLOTS } from "../../data/options";
import { TEST_MODE } from "../../config/testMode";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Each date now carries ONE timing (morning / afternoon / full_day). Use the
// app-wide TIMING_SLOTS values so provider availability speaks the same language
// as the interest form and matches.
const DEFAULT_TIMING = TIMING_SLOTS[0].value; // "morning"
const timingLabel = (v) => TIMING_SLOTS.find((t) => t.value === v)?.label ?? v;

// Migrate the old shape: dates used to have no per-date timing, and timings were
// a shared array of LABEL strings ("Morning (0900–1200h)"). Map a stored value
// or legacy label back to a slot value; fall back to the earliest legacy slot.
function toTimingValue(raw) {
  if (!raw) return null;
  const byValue = TIMING_SLOTS.find((t) => t.value === raw);
  if (byValue) return byValue.value;
  const byLabel = TIMING_SLOTS.find((t) => t.label === raw);
  return byLabel ? byLabel.value : null;
}

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

const fmtDate = (d) =>
  new Date(d.year, d.month, d.day).toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function AvailabilityPage() {
  const { user, applyProfileChanges } = useAuth();
  const [cursor, setCursor] = useState({ year: 2026, month: 5 }); // June 2026
  const [selected, setSelected] = useState([]); // [{ key, day, month, year, timing }]
  const [brush, setBrush] = useState(DEFAULT_TIMING); // timing applied to newly-clicked dates
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load saved availability from the profile once the user is known, migrating
  // the old (shared-timing) shape to per-date timing.
  useEffect(() => {
    const av = user?.availability;
    if (!av || !Array.isArray(av.dates)) return;
    const legacyDefault = toTimingValue(av.timings?.[0]) ?? DEFAULT_TIMING;
    setSelected(
      av.dates.map((d) => ({
        ...d,
        timing: toTimingValue(d.timing) ?? legacyDefault,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleSave = async () => {
    setError("");
    // Keep a derived `timings` array (unique slots across all dates) so anything
    // still reading the old shape keeps working.
    const timings = [...new Set(selected.map((d) => d.timing))];
    const changes = { availability: { dates: selected, timings } };
    try {
      if (!TEST_MODE && user?.uid) {
        await updateProfile(user.uid, changes);
        if (user.providerId) {
          await publishProviderCatalog({
            role: user.role,
            providerId: user.providerId,
            ownerUid: user.uid,
            profile: { ...user, ...changes },
          });
        }
      }
      applyProfileChanges(changes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message ?? "Could not save availability. Please try again.");
    }
  };

  const cells = buildMonthGrid(cursor.year, cursor.month);
  const keyFor = (day) => `${cursor.year}-${cursor.month}-${day}`;

  // Click a calendar day: add it with the current brush timing, or remove it.
  const toggleDay = (day) => {
    const key = keyFor(day);
    setSelected((prev) =>
      prev.some((d) => d.key === key)
        ? prev.filter((d) => d.key !== key)
        : [...prev, { key, day, month: cursor.month, year: cursor.year, timing: brush }]
    );
  };

  const setDateTiming = (key, timing) =>
    setSelected((prev) => prev.map((d) => (d.key === key ? { ...d, timing } : d)));

  const removeDate = (key) => setSelected((prev) => prev.filter((d) => d.key !== key));
  const clearDates = () => setSelected([]);

  const shiftMonth = (delta) => {
    setCursor(({ year, month }) => {
      const next = month + delta;
      if (next < 0) return { year: year - 1, month: 11 };
      if (next > 11) return { year: year + 1, month: 0 };
      return { year, month: next };
    });
  };

  const isSelected = (day) => selected.some((d) => d.key === keyFor(day));

  const sortedSelected = selected
    .slice()
    .sort((a, b) => a.year - b.year || a.month - b.month || a.day - b.day);

  return (
    <>
      <PageHeader
        eyebrow="Available Dates"
        title="Available Schedule"
        subtitle="Pick the dates you're available and set a timing for each one"
        action={
          <Button disabled={selected.length === 0} onClick={handleSave}>
            Save availability
          </Button>
        }
      />

      {saved && (
        <div className="rounded-lg bg-[#DCFCE7] text-[#15803D] px-4 py-3 text-sm mb-5">
          Availability saved.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mb-5">
          {error}
        </div>
      )}

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

        {/* Timing brush — applied to the next dates you click */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-1">Timing for new dates</h2>
          <p className="text-sm text-[#78716C] mb-4">
            Pick a slot, then click dates on the calendar to add them with it. You can change any
            date's slot in the list below.
          </p>
          <div className="flex flex-col gap-2">
            {TIMING_SLOTS.map((t) => {
              const active = brush === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setBrush(t.value)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-colors text-left ${
                    active
                      ? "border-[#1C1917] bg-[#1C1917] text-white"
                      : "border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                      active ? "bg-white border-white" : "border-[#A8A29E]"
                    }`}
                  />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected dates — each with its own timing */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Selected dates
            {selected.length > 0 && (
              <span className="ml-2 text-sm font-normal text-[#A8A29E]">({selected.length})</span>
            )}
          </h2>
          {selected.length > 0 && (
            <button onClick={clearDates} className="text-xs text-[#B91C1C] hover:underline">
              Clear all
            </button>
          )}
        </div>

        {selected.length === 0 ? (
          <p className="text-sm text-[#A8A29E] italic text-center py-12">
            No dates selected yet — pick a timing above, then click dates on the calendar.
          </p>
        ) : (
          <div className="space-y-2">
            {sortedSelected.map((d) => (
              <div
                key={d.key}
                className="flex items-center justify-between gap-3 border border-[#E7E5E4] rounded-lg px-4 py-3 flex-wrap"
              >
                <span className="text-sm font-medium text-[#1C1917] min-w-[130px]">
                  {fmtDate(d)}
                </span>

                <div className="flex gap-1.5 flex-wrap">
                  {TIMING_SLOTS.map((t) => {
                    const active = d.timing === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setDateTiming(d.key, t.value)}
                        aria-pressed={active}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          active
                            ? "border-[#1C1917] bg-[#1C1917] text-white font-medium"
                            : "border-[#E7E5E4] text-[#57534E] hover:bg-[#F5F5F4]"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => removeDate(d.key)}
                  aria-label={`Remove ${fmtDate(d)}`}
                  className="text-[#B91C1C] hover:bg-[#FEE2E2] rounded-md w-7 h-7 flex items-center justify-center shrink-0 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {selected.length > 0 && (
          <p className="text-xs text-[#A8A29E] mt-4">
            {selected.length} date{selected.length > 1 ? "s" : ""} · each saved with its own timing
            ({TIMING_SLOTS.map((t) => t.label).join(", ")}).
          </p>
        )}
      </div>
    </>
  );
}
