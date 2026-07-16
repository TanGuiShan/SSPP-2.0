import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

export default function AppLayout({ navItems, roleLabel, brand, onLogout, logo, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#FAFAF9] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar navItems={navItems} roleLabel={roleLabel} brand={brand} onLogout={onLogout} logo={logo} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[240px]">
            <Sidebar navItems={navItems} roleLabel={roleLabel} brand={brand} onLogout={onLogout} logo={logo} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader title={brand} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}