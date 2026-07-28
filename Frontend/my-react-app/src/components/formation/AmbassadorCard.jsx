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
  const {
    rank,
    name,
    appointment,
    formation,
    camp,
    mobility,
    topics = [],
    levelsPreferred = [],
    about,
    availableFrom,
    availableTo,
    photo,
  } = ambassador;

  const hasRange = Boolean(availableFrom && availableTo);
  const upperCaseRank = rank ? rank.toUpperCase() : "";
  const isBooth = mobility === "sharing_booth";

  return (
    <div
      className={`card p-5 flex flex-col transition-all duration-200 ${
        selected
          ? "border-[#4F46E5] ring-1 ring-[#4F46E5] bg-[#F5F3FF]"
          : "hover:shadow-lg hover:border-[#D6D3D1]"
      }`}
    >
      <div className="flex items-start gap-4">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect?.(ambassador)}
            aria-label={`Select ${name}`}
            className="mt-1.5 w-4 h-4 accent-[#4F46E5] shrink-0 cursor-pointer"
          />
        )}

        <div className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm bg-gradient-to-br from-[#EEF2FF] to-[#EDE9FE]">
          {photo ? (
            <img src={photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-[#6366F1]">{initials(name)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {upperCaseRank && (
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold tracking-wide mb-1">
              {upperCaseRank}
            </span>
          )}
          <p className="font-semibold text-[#1C1917] leading-tight">{name}</p>
          <p className="text-sm text-[#78716C] mt-0.5">{appointment}</p>
          <p className="text-xs text-[#A8A29E] mt-1">
            {labelFor(FORMATIONS, formation)}
            {camp ? ` · ${camp}` : ""}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 ${
            isBooth ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#F5F5F4] text-[#57534E]"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
          {isBooth ? "Sharing + booth" : "Sharing only"}
        </span>
      </div>

      {about && (
        <p className="text-sm text-[#57534E] mt-4 line-clamp-2 leading-relaxed">{about}</p>
      )}

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {topics.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-full bg-[#F5F5F4] text-[11px] font-medium text-[#57534E]"
            >
              {labelFor(TOPICS, t)}
            </span>
          ))}
        </div>
      )}

      <div className="h-px bg-[#F0EEEC] my-4" />

      <div className="flex items-center gap-2">
        <CalendarIcon width={14} height={14} className="text-[#A8A29E] shrink-0" />
        <span className="text-[10px] uppercase tracking-wide text-[#A8A29E]">Available</span>
        <span className="text-xs font-medium text-[#44403C]">
          {hasRange ? formatRange(availableFrom, availableTo) : "Not specified"}
        </span>
      </div>

      {levelsPreferred.length > 0 && (
        <p className="text-[11px] text-[#A8A29E] mt-2">
          Prefers {levelsPreferred.map((l) => labelFor(SCHOOL_LEVELS, l)).join(", ")}
        </p>
      )}

      {!selectable && (
        <Button
          variant="primary"
          fullWidth
          className="mt-5"
          onClick={() => onInterested?.({ ...ambassador, isAmbassador: true })}
        >
          I'm Interested
        </Button>
      )}
    </div>
  );
}
