import SgdsButton from "@govtechsg/sgds-web-component/react/button";

const VARIANT_MAP = {
  primary: { variant: "primary", tone: "brand" },
  secondary: { variant: "outline", tone: "brand" },
  outline: { variant: "outline", tone: "neutral" },
  danger: { variant: "primary", tone: "danger" },
  ghost: { variant: "ghost", tone: "neutral" },
};

const SIZE_MAP = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
};

/**
 * Compatibility wrapper around SGDS v3's button.
 * Existing pages can keep using <Button variant="secondary" /> while the
 * underlying control is now the official SGDS component.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  loading = false,
  ...rest
}) {
  const appearance = VARIANT_MAP[variant] ?? VARIANT_MAP.primary;

  return (
    <SgdsButton
      {...rest}
      type={type}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      variant={appearance.variant}
      tone={appearance.tone}
      size={SIZE_MAP[size] ?? "md"}
      fullWidth={fullWidth}
      className={className}
    >
      {children}
    </SgdsButton>
  );
}
