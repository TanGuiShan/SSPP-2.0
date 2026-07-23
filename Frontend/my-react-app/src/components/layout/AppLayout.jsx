import SgdsMasthead from "@govtechsg/sgds-web-component/react/masthead";
import Sidebar from "./Sidebar";
import GovernmentFooter from "./GovernmentFooter";
import TestModeBanner from "./TestModeBanner";

export default function AppLayout({ navItems, roleLabel, brand, onLogout, logo, children }) {
  return (
    <div className="sspp-app-shell">
      <SgdsMasthead fluid />
      <TestModeBanner />

      <div className="sspp-app-frame">
        <Sidebar
          navItems={navItems}
          roleLabel={roleLabel}
          brand={brand}
          onLogout={onLogout}
          logo={logo}
        />

        <div className="sspp-app-content">
          <main id="main-content" className="sspp-main-content">
            <div className="sspp-content-container">{children}</div>
          </main>
          <GovernmentFooter layout="sidebar" />
        </div>
      </div>
    </div>
  );
}
