import { CalendarIcon } from "../../assets/icons";
import Button from "../common/Button";
import { FORMATIONS, TOPICS, SCHOOL_LEVELS } from "../../data/options";
import { formatRange } from "../../utils/filtering";

const labelFor = (list, value) => list.find((o) => o.value === value)?.label ?? value;

// Initials fallback while there's no photo
function initials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * @param {boolean} selectable - show the checkbox (team-forming mode)
 * @param {boolean} selected
 * @param {(amb) => void} onToggleSelect
 * @param {(amb) => void} onInterested - single-ambassador shortcut
 */
export default function AmbassadorCard({
  ambassador,
  selectable = false,
  selected = false,
  onToggleSelect,
  onInterested,
}) {
  const { rank, name, appointment, formation, camp, mobility, topics, levelsPreferred, about, availableFrom, availableTo, photo } = ambassador;
  const hasRange = Boolean(availableFrom && availableTo);

  return (
    <div
      className={`card p-5 flex flex-col transition-colors ${
        selected ? "border-[#1C1917] bg-[#FAFAF9]" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect?.(ambassador)}
            aria-label={`Select ${name}`}
            className="mt-1 w-4 h-4 accent-[#1C1917] shrink-0 cursor-pointer"
          />
        )}

        <div className="w-14 h-14 rounded-full bg-[#E7E5E4] shrink-0 flex items-center justify-center overflow-hidden">
          {photo ? (
            <img src={photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-[#78716C]">{initials(name)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#1C1917] leading-tight">
            {rank} {name}
          </p>
          <p className="text-sm text-[#78716C] mt-0.5">{appointment}</p>
          <p className="text-xs text-[#A8A29E] mt-1">
            {labelFor(FORMATIONS, formation)} · {camp}
          </p>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${
            mobility === "sharing_booth"
              ? "bg-[#DBEAFE] text-[#1D4ED8]"
              : "bg-[#F5F5F4] text-[#57534E]"
          }`}
        >
          {mobility === "sharing_booth" ? "Sharing + booth" : "Sharing only"}
        </span>
      </div>

      {about && <p className="text-sm text-[#57534E] mt-4 line-clamp-2">{about}</p>}

      <div className="flex flex-wrap gap-1.5 mt-4">
        {topics.map((t) => (
          <span key={t} className="px-2.5 py-1 rounded-full bg-[#F5F5F4] text-[11px] text-[#44403C]">
            {labelFor(TOPICS, t)}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-[#78716C] mt-4">
        <CalendarIcon width={14} height={14} className="text-[#A8A29E] shrink-0" />
        {hasRange ? formatRange(availableFrom, availableTo) : "Not specified"}
      </div>

      <p className="text-[11px] text-[#A8A29E] mt-2">
        Prefers: {levelsPreferred.map((l) => labelFor(SCHOOL_LEVELS, l)).join(", ")}
      </p>

      {!selectable && (
        <Button
          variant="primary"
          fullWidth
          className="mt-4"
          onClick={() => onInterested?.({ ...ambassador, isAmbassador: true })}
        >
          I'm Interested
        </Button>
      )}
    </div>
  );
}
