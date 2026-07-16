import React from "react";
import posterImg from "../assets/images/services_posters.jpg";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:block lg:w-[38%] relative overflow-hidden">
        <img src={posterImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}