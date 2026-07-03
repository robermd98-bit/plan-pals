import { type ReactNode, type CSSProperties } from "react";
import { motion } from "framer-motion";
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
  confirming?: boolean;
  confirmLabel?: string;
  pulsing?: boolean;
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

export function PulseRings({
  color = "var(--pin)",
  count = 3,
  rounded = "rounded-sm",
  expand = 1.06,
}: {
  color?: string;
  count?: number;
  rounded?: string;
  expand?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className={`absolute inset-0 ${rounded} pointer-events-none`}
          style={{ border: `2px solid ${color}` }}
          initial={{ opacity: 0.55, scale: 1 }}
          animate={{ opacity: 0, scale: expand }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.55, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

function ConfirmStamp({ label }: { label: string }) {
  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center rounded-sm overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ backgroundColor: "rgba(255,248,231,0.55)" }}
    >
      {[0, 0.15, 0.3].map((delay) => (
        <motion.span
          key={delay}
          className="absolute rounded-full pointer-events-none"
          style={{ border: "3px solid var(--pin)", width: 40, height: 40, top: "50%", left: "50%" }}
          initial={{ opacity: 0.8, scale: 0.3, x: "-50%", y: "-50%" }}
          animate={{ opacity: 0, scale: 7, x: "-50%", y: "-50%" }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }}
        />
      ))}
      <motion.div
        initial={{ scale: 2.4, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: -8 }}
        transition={{ type: "spring", stiffness: 360, damping: 16 }}
        className="rubber-button text-2xl relative z-10"
        style={{ backgroundColor: "var(--pin)", color: "#FFF8E7" }}
      >
        {label}
      </motion.div>
    </motion.div>
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
  confirming = false,
  confirmLabel = "¡Hecho!",
  pulsing = false,
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
      {pulsing && <PulseRings color={washiColor(category)} />}
      {pin && <span className="pin-dot" />}
      {tape && <span className="tape-corner" style={{ background: washiColor(category) }} />}
      {children}
      {attendees && attendees.length > 0 && (
        <AttendeeStack attendees={attendees} total={attendeesTotal} />
      )}
      {confirming && <ConfirmStamp label={confirmLabel} />}
    </div>
  );
}
