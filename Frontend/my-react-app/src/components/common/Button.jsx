import React from "react";

const VARIANTS = {
  primary: "bg-[#1C1917] text-white hover:bg-black",
  secondary: "bg-[#F5F5F4] text-[#1C1917] hover:bg-[#E7E5E4]",
  outline: "bg-transparent text-[#1C1917] border border-[#D6D3D1] hover:bg-[#F5F5F4]",
  danger: "bg-[#C2542F] text-white hover:bg-[#A8431F]",
  ghost: "bg-transparent text-[#78716C] hover:text-[#1C1917]",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-5 py-3",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-lg font-medium transition-colors duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}