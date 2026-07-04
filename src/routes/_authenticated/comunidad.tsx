import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/categories";
import { PaperNote } from "@/components/PaperNote";

export const Route = createFileRoute("/_authenticated/comunidad")({
  component: Comunidad,
});

function Comunidad() {
  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-4xl text-center font-extrabold" style={{ color: "var(--ink)" }}>Salas en directo</h1>
      <p className="text-center text-[var(--ink)]/60 text-sm mt-1 mb-6">
        Habla con gente por tema, sin necesidad de estar apuntado a ningún plan
      </p>
      <div className="grid gap-3">
        <Link to="/comunidad/$category" params={{ category: "general" }}>
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ backgroundColor: "var(--pin)", color: "var(--pin-foreground)" }}>
            <span className="text-3xl">💬</span>
            <div>
              <h2 className="text-xl font-semibold">General</h2>
              <p className="text-xs opacity-80">Para hablar de lo que sea, con todo el mundo</p>
            </div>
          </div>
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} to="/comunidad/$category" params={{ category: c.id }}>
            <PaperNote category={c.id} rotation={0}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{c.emoji}</span>
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>{c.label}</h2>
                  <p className="text-xs opacity-70">Entrar a la sala</p>
                </div>
              </div>
            </PaperNote>
          </Link>
        ))}
      </div>
    </div>
  );
}
