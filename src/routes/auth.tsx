import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PaperNote } from "@/components/PaperNote";
import { RubberButton } from "@/components/RubberButton";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect: redirectTo } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: (redirectTo as never) ?? "/" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Algo salió mal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <h1 style={{ fontSize: 46, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>
          ¿Kedamos?
        </h1>
        <p className="text-[var(--ink)]/60 -mt-1" style={{ fontSize: 17 }}>
          el tablón de planes con desconocidos
        </p>
      </div>

      <PaperNote category={mode === "login" ? "language" : "social"} rotation={-1} className="w-full max-w-sm">
        <form onSubmit={submit} className="flex flex-col gap-3 pt-1">
          <h2 className="text-3xl text-center">
            {mode === "login" ? "Entrar" : "Crear cuenta"}
          </h2>
          {mode === "signup" && (
            <input
              required
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 text-base"
            />
          )}
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 text-base"
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/70 border-2 border-[var(--ink)]/20 rounded-md px-3 py-2 text-base"
          />
          {err && <p className="text-red-700 text-sm text-center">{err}</p>}
          <RubberButton disabled={loading} type="submit">
            {loading ? "…" : mode === "login" ? "Entrar" : "Apuntarme"}
          </RubberButton>
          <button
            type="button"
            className="text-sm underline opacity-80"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "¿No tienes cuenta? Crear una" : "Ya tengo cuenta"}
          </button>
        </form>
      </PaperNote>
    </div>
  );
}
