import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:block lg:w-[38%] relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 gap-0">
          <div className="bg-gradient-to-b from-sky-200 to-sky-400" />
          <div className="bg-gradient-to-b from-emerald-200 to-emerald-600" />
          <div className="bg-gradient-to-b from-indigo-200 to-indigo-500" />
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}