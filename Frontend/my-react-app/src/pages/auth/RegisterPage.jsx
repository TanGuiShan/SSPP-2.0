import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";

const ROLES = [
  {
    id: "school",
    to: "/register/school",
    title: "School",
    description: "Book engagements for your students and browse available formations.",
  },
  {
    id: "army-unit",
    to: "/register/unit",
    title: "Army Unit",
    description: "Register a unit or formation that can host engagements.",
  },
  {
    id: "army-ambassador",
    to: "/register/ambassador",
    title: "Army Ambassador",
    description: "Sign up as an individual who can share with schools.",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>Create account</h1>
        <p className="text-sm text-[#78716C] mt-2">First, tell us who you are</p>
      </div>

      <div className="space-y-3">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => navigate(role.to)}
            className="w-full text-left rounded-lg border border-[#E7E5E4] p-4 hover:border-[#1C1917] hover:bg-[#FAFAF9] transition-colors group"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#1C1917]">{role.title}</p>
                <p className="text-xs text-[#78716C] mt-1">{role.description}</p>
              </div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A8A29E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 group-hover:stroke-[#1C1917] transition-colors"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-6">
        <Link to="/login" className="text-sm text-[#44403C] underline">← Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}
