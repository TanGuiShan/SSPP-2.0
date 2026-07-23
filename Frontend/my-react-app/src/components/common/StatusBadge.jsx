import SgdsBadge from "@govtechsg/sgds-web-component/react/badge";

const VARIANTS = {
  completed: "success",
  approved: "success",
  "awaiting confirmation": "warning",
  awaiting: "warning",
  confirmed: "success",
  upcoming: "primary",
  pending: "warning",
  unmatched: "warning",
  cancel: "danger",
  cancelled: "danger",
  review: "info",
  withdraw: "danger",
  withdrawn: "neutral",
  rejected: "danger",
  default: "neutral",
};

export default function StatusBadge({ status, children, outlined = false }) {
  const key = String(status || "").toLowerCase();
  return (
    <SgdsBadge variant={VARIANTS[key] ?? VARIANTS.default} outlined={outlined}>
      {children || status}
    </SgdsBadge>
  );
}
