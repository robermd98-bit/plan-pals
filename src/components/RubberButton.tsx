import { forwardRef, type ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "paper" | "ghost";
}

export const RubberButton = forwardRef<HTMLButtonElement, Props>(
  ({ tone = "primary", className = "", style, ...rest }, ref) => {
    const bg =
      tone === "primary"
        ? "var(--pin)"
        : tone === "paper"
        ? "#FFF8E7"
        : "transparent";
    const fg = tone === "primary" ? "#FFF8E7" : "var(--ink)";
    return (
      <button
        ref={ref}
        className={`rubber-button active:rubber-button-active text-lg ${className}`}
        style={{ backgroundColor: bg, color: fg, ...style }}
        {...rest}
      />
    );
  },
);
RubberButton.displayName = "RubberButton";
