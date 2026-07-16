import React from "react";
import { CalendarIcon } from "../../assets/icons";
import Button from "../common/Button";

export default function FormationCard({ formation, onInterested }) {
  const { name, location, availableFrom, availableTo, image, badge } = formation;

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="relative h-40 bg-[#E7E5E4]">
        {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
        {badge && (
          <div className="absolute bottom-3 left-3 w-11 h-11 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden">
            <img src={badge} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-[#1C1917]">{name}</h3>
        <p className="text-sm text-[#78716C] mt-0.5">Location: {location}</p>
        <div className="flex items-center gap-2 text-sm text-[#44403C] mt-3 mb-4">
          <CalendarIcon width={16} height={16} className="text-[#A8A29E]" />
          <div>
            <p className="font-medium">Available From</p>
            <p className="text-[#78716C]">{availableFrom} – {availableTo}</p>
          </div>
        </div>
        <Button variant="primary" fullWidth className="mt-auto" onClick={() => onInterested?.(formation)}>
          I'm Interested
        </Button>
      </div>
    </div>
  );
}