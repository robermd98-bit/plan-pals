import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { userId: data.user.id };
  },
  component: AuthShell,
});

function AuthShell() {
  const { userId } = Route.useRouteContext();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (!data?.onboarded && location.pathname !== "/onboarding") {
        navigate({ to: "/onboarding" });
      }
      setChecked(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>
          Cargando…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Outlet />
      <BottomNav />
    </div>
  );
}
