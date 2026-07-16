import React, { useState } from "react";
import { Label } from "./Input";
import Button from "./Button";
import { sendCode, verifyCode } from "../../api/verifyApi";

/**
 * An input that has to be verified by a code before it counts as valid.
 * Used for both email and mobile at signup.
 *
 * Three states:
 *   idle      - typing the address/number, "Send code" available
 *   sent      - code field showing, "Verify" available
 *   verified  - locked, green tick
 *
 * @param {"email"|"mobile"} channel
 * @param {(verified: boolean) => void} onVerifiedChange - tell the parent form
 */
export default function VerifiedField({
  channel,
  label,
  required,
  placeholder,
  value,
  onChange,
  onVerifiedChange,
  type = "text",
  initiallyVerified = false,
}) {
  // On a profile page the value arrives already verified; on signup it doesn't.
  const [status, setStatus] = useState(initiallyVerified ? "verified" : "idle"); // idle | sent | verified
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const fieldBase =
    "w-full rounded-lg bg-[#F5F5F4] border border-transparent px-4 py-3 text-sm text-[#1C1917] " +
    "placeholder:text-[#A8A29E] focus:bg-white focus:border-[#1C1917] focus:outline-none transition-colors";

  // Editing the address after verifying invalidates the verification.
  const handleChange = (e) => {
    onChange(e);
    if (status !== "idle") {
      setStatus("idle");
      setCode("");
      setError("");
      onVerifiedChange?.(false);
    }
  };

  const handleSend = async () => {
    if (!value?.trim()) {
      setError(`Enter your ${channel === "email" ? "email" : "mobile number"} first.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await sendCode(channel, value);
      setStatus("sent");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    setBusy(true);
    setError("");
    try {
      await verifyCode(channel, value, code);
      setStatus("verified");
      onVerifiedChange?.(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-5">
      <Label required={required}>{label}</Label>

      <div className="flex gap-2">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={status === "verified"}
          className={`${fieldBase} ${status === "verified" ? "opacity-70 cursor-not-allowed" : ""}`}
        />

        {status === "verified" ? (
          <span className="flex items-center gap-1.5 px-3 rounded-lg bg-[#DCFCE7] text-[#15803D] text-xs font-medium shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 6" />
            </svg>
            Verified
          </span>
        ) : (
          <Button
            variant="outline"
            onClick={handleSend}
            disabled={busy}
            className="shrink-0 whitespace-nowrap"
          >
            {busy && status === "idle" ? "Sending..." : status === "sent" ? "Resend" : "Send code"}
          </Button>
        )}
      </div>

      {status === "sent" && (
        <div className="flex gap-2 mt-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleVerify())}
            placeholder="6-digit code"
            inputMode="numeric"
            maxLength={6}
            className={`${fieldBase} max-w-[160px]`}
          />
          <Button onClick={handleVerify} disabled={busy || !code.trim()} className="shrink-0">
            {busy ? "Checking..." : "Verify"}
          </Button>
        </div>
      )}

      {status === "sent" && !error && (
        <p className="text-xs text-[#78716C] mt-1.5">
          We sent a code to {value}. It expires in 10 minutes.
        </p>
      )}

      {error && <p className="text-xs text-[#C2542F] mt-1.5">{error}</p>}
    </div>
  );
}
