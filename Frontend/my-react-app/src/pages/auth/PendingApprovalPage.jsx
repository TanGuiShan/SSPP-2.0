import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";

export default function PendingApprovalPage() {
  return (
    <AuthLayout>
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-[#FEF3C7] flex items-center justify-center mx-auto mb-6">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <h1 className="text-3xl mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Awaiting approval
        </h1>
        <p className="text-sm text-[#78716C] mb-6">
          Your email is verified. Because you're signing up from outside a government domain, an
          admin needs to approve your volunteer account before you can sign in. You'll get an email
          once that's done.
        </p>

        <div className="rounded-lg bg-[#F5F5F4] px-4 py-3 text-left mb-6">
          <p className="text-xs text-[#78716C]">
            Government staff (school or defence email) skip this step and get access straight away.
          </p>
        </div>

        <Link to="/login">
          <Button variant="secondary" fullWidth size="lg">Back to sign in</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
