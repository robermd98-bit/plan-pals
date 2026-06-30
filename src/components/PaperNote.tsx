import { type ReactNode, type CSSProperties } from "react";
import { paperColor, washiColor } from "@/lib/categories";

interface PaperNoteProps {
  category?: string;
  rotation?: number;
  pin?: boolean;
  tape?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onClick?: () => void;
}

export function PaperNote({
  category = "social",
  rotation = -2,
  pin = true,
  tape = true,
  className = "",
  style,
  children,
  onClick,
}: PaperNoteProps) {
  return (
    <div
      onClick={onClick}
      className={`paper-shadow relative rounded-sm px-5 py-5 ${className}`}
      style={{
        backgroundColor: paperColor(category),
        transform: `rotate(${rotation}deg)`,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.015) 0 1px, transparent 1px 4px)",
        ...style,
      }}
    >
      {pin && <span className="pin-dot" />}
      {tape && (
        <span
          className="tape-corner"
          style={{ background: washiColor(category) }}
        />
      )}
      {children}
    </div>
  );
}
