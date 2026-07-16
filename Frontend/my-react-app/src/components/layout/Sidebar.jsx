import React from "react";
import { NavLink } from "react-router-dom";
import { LogoutIcon } from "../../assets/icons";

/**
 * @param {{label: string, to: string, icon: React.ComponentType}[]} navItems
 * @param {string} roleLabel  e.g. "ARMY VIEW", "ADMIN VIEW", school name
 * @param {string} brand      e.g. "SSPP"
 * @param {() => void} onLogout
 * @param {{src?: string}} [logo]
 */
export default function Sidebar({ navItems, roleLabel, brand = "SSPP", onLogout, logo }) {
  return (
    <aside className="w-[240px] shrink-0 bg-[#1C1917] text-[#A8A29E] flex flex-col h-full">
      <div className="px-6 pt-8 pb-6 flex items-center gap-3">
        {logo?.src && (
          <img src={logo.src} alt="" className="w-9 h-9 rounded-md object-cover" />
        )}
        <div>
          <p className="text-white text-lg font-semibold tracking-tight leading-tight">{brand}</p>
          {roleLabel && (
            <p className="text-[11px] tracking-wide uppercase text-[#78716C]">{roleLabel}</p>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-[#292524] text-white font-medium"
                  : "text-[#A8A29E] hover:bg-[#292524]/60 hover:text-white",
              ].join(" ")
            }
          >
            {Icon && <Icon width={18} height={18} />}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6 pt-3 border-t border-white/10 mt-3">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-[#A8A29E] hover:bg-[#292524]/60 hover:text-white transition-colors"
        >
          <LogoutIcon width={18} height={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}