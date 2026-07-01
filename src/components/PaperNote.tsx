import { type ReactNode, type CSSProperties } from "react";
import { paperColor, washiColor } from "@/lib/categories";

export interface NoteAttendee {
  name: string;
  avatar_url?: string | null;
}

interface PaperNoteProps {
  category?: string;
  rotation?: number;
  pin?: boolean;
  tape?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onClick?: () => void;
  attendees?: NoteAttendee[];
  attendeesTotal?: number;
}

const AVATAR_TINTS = ["#E76F51", "#2A9D8F", "#E9C46A", "#6D597A", "#457B9D", "#F4A261"];

function tintFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

function AttendeeStack({ attendees, total }: { attendees: NoteAttendee[]; total?: number }) {
  if (!attendees.length) return null;
  const extra = (total ?? attendees.length) - attendees.length;
  return (
    <div className="absolute -bottom-3 -right-2 flex items-center" style={{ transform: "rotate(4deg)" }}>
      {attendees.slice(0, 4).map((a, i) => (
        <div
          key={i}
          className="avatar-stack-ring"
          style={{
            marginLeft: i === 0 ? 0 : -14,
            zIndex: 10 + i,
            backgroundColor: a.avatar_url ? undefined : tintFor(a.name || "?"),
          }}
          title={a.name}
        >
          {a.avatar_url ? (
            <img src={a.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{(a.name || "?").slice(0, 1).toUpperCase()}</span>
          )}
        </div>
      ))}
      {extra > 0 && (
        <div
          className="avatar-stack-ring"
          style={{ marginLeft: -14, zIndex: 20, backgroundColor: "var(--ink)" }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
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
  attendees,
  attendeesTotal,
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
      {tape && <span className="tape-corner" style={{ background: washiColor(category) }} />}
      {children}
      {attendees && attendees.length > 0 && (
        <AttendeeStack attendees={attendees} total={attendeesTotal} />
      )}
    </div>
  );
}
