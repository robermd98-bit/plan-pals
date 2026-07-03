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
        ? "#FFFFFF"
        : "transparent";
    const fg = tone === "primary" ? "var(--pin-foreground)" : "var(--ink)";
    const border = tone === "ghost" ? "1.5px solid transparent" : undefined;
    return (
      <button
        ref={ref}
        className={`rubber-button active:rubber-button-active disabled:opacity-40 disabled:pointer-events-none text-base ${className}`}
        style={{ backgroundColor: bg, color: fg, border, ...style }}
        {...rest}
      />
    );
  },
);
RubberButton.displayName = "RubberButton";
