import { useEffect, useState } from "react";
import SgdsAlert from "@govtechsg/sgds-web-component/react/alert";
import Button from "./Button";
import { Input } from "./Input";
import StatusBadge from "./StatusBadge";
import { sendCode, verifyCode } from "../../api/verifyApi";
import { SKIP_VERIFICATION } from "../../config/testMode";

/**
 * An email/mobile field that must be verified with a one-time code.
 *
 * Existing signup pages can keep using the same props. The underlying inputs,
 * buttons, status and error feedback now use SGDS v3 components.
 */
export default function VerifiedField({
  channel,
  label,
  required,
  placeholder,
  value,
  onChange,
  onVerifiedChange,
  hintText,
  type = "text",
  initiallyVerified = false,
}) {
  const [status, setStatus] = useState(
    initiallyVerified || SKIP_VERIFICATION ? "verified" : "idle"
  );
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (SKIP_VERIFICATION) onVerifiedChange?.(true);
  }, [onVerifiedChange]);

  const handleChange = (event) => {
    onChange(event);

    if (!SKIP_VERIFICATION && status !== "idle") {
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
      setError(err instanceof Error ? err.message : "Unable to send the verification code.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;

    setBusy(true);
    setError("");

    try {
      await verifyCode(channel, value, code);
      setStatus("verified");
      onVerifiedChange?.(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify the code.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="verified-field">
      <div className="verified-field__main-row">
        <Input
          label={label}
          hintText={hintText}
          required={required}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={status === "verified"}
          className="verified-field__input"
        />

        <div className="verified-field__action">
          {status === "verified" ? (
            <StatusBadge status="verified" label="Verified" />
          ) : (
            <Button
              variant="secondary"
              onClick={handleSend}
              disabled={busy}
              loading={busy && status === "idle"}
            >
              {status === "sent" ? "Resend code" : "Send code"}
            </Button>
          )}
        </div>
      </div>

      {status === "sent" && (
        <div className="verified-field__code-row">
          <Input
            label="Verification code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleVerify();
              }
            }}
            placeholder="Enter the 6-digit code"
            inputMode="numeric"
            maxLength={6}
            className="verified-field__code-input"
          />
          <div className="verified-field__action">
            <Button
              onClick={handleVerify}
              disabled={busy || !code.trim()}
              loading={busy}
            >
              Verify
            </Button>
          </div>
        </div>
      )}

      {status === "sent" && !error && (
        <p className="verified-field__hint">
          We sent a code to {value}. It expires in 10 minutes.
        </p>
      )}

      {error && (
        <SgdsAlert variant="danger" dismissible={false} className="verified-field__alert">
          {error}
        </SgdsAlert>
      )}
    </div>
  );
}
