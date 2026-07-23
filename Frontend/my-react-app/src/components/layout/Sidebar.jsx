import SgdsSidebar from "@govtechsg/sgds-web-component/react/sidebar";
import SgdsSidebarItem from "@govtechsg/sgds-web-component/react/sidebar-item";
import { useLocation, useNavigate } from "react-router-dom";
import { LogoutIcon } from "../../assets/icons";
import { useEngagements } from "../../hooks/useEngagements";

/**
 * SGDS v3 application sidebar. Navigation still uses React Router, so moving
 * between pages remains client-side and does not refresh the application.
 */
export default function Sidebar({ navItems, roleLabel, brand = "SSPP", onLogout, logo }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected } = useEngagements();
  const activeItem = navItems.find((item) => location.pathname.startsWith(item.to));

  return (
    <SgdsSidebar
      className="sspp-sidebar"
      active={activeItem?.to ?? ""}
      variant="collapsible"
      scrim
      ariaLabel={`${roleLabel || brand} navigation`}
    >
      <div slot="upper" className="sspp-sidebar-brand">
        {logo?.src ? (
          <img src={logo.src} alt="" className="sspp-sidebar-logo" />
        ) : (
          <div className="sspp-sidebar-mark" aria-hidden="true">S</div>
        )}
        <div className="sspp-sidebar-brand-copy">
          <strong>{brand}</strong>
          {roleLabel && <span>{roleLabel}</span>}
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium w-max border border-emerald-200">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
            {isConnected ? "Firestore Live" : "Connecting..."}
          </div>
        </div>
      </div>

      {navItems.map(({ label, to, icon: Icon }) => (
        <SgdsSidebarItem
          key={to}
          name={to}
          title={label}
          onClick={() => navigate(to)}
        >
          {Icon && (
            <span slot="icon" className="sspp-sidebar-icon" aria-hidden="true">
              <Icon width={20} height={20} />
            </span>
          )}
        </SgdsSidebarItem>
      ))}

      {/* Logout lives in the lower slot but is still a sidebar ITEM, so it
          collapses to just its icon along with everything else. */}
      <SgdsSidebarItem
        slot="lower"
        name="logout"
        title="Logout"
        className="sspp-sidebar-logout"
        onClick={onLogout}
      >
        <span slot="icon" className="sspp-sidebar-icon" aria-hidden="true">
          <LogoutIcon width={20} height={20} />
        </span>
      </SgdsSidebarItem>
    </SgdsSidebar>
  );
}
