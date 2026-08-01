"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowCard } from "@/components/ui/GlowCard";
import { ShineButton } from "@/components/ui/ShineButton";
import { useRole } from "@/context/RoleContext";
import type { ActiveUser, Role } from "@/lib/types";

const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  doctor: "Doctor",
  client: "Client",
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: "Acces total: finanțe, toate programările, escaladări AI.",
  doctor: "Vede doar programările proprii.",
  client: "Vede programările proprii și poate adăuga notițe.",
};

export function RoleSelector() {
  const router = useRouter();
  const { setUser } = useRole();
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role>("owner");
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setUsers(data.users ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const usersForRole = users.filter((u) => u.role === selectedRole);

  function handleEnter() {
    const user = usersForRole.find((u) => u.id === selectedId) ?? usersForRole[0];
    if (!user) return;
    setUser(user);
    router.push("/dashboard");
  }

  return (
    <GlassPanel className="w-full p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
          <GlowCard
            key={role}
            glow={role === "owner" ? "gold" : "emerald"}
            onClick={() => {
              setSelectedRole(role);
              setSelectedId("");
            }}
            className={`cursor-pointer p-4 text-left transition-colors ${
              selectedRole === role ? "border-gold/50" : ""
            }`}
          >
            <p className="font-semibold text-foreground">{ROLE_LABELS[role]}</p>
            <p className="mt-1 text-sm text-text-dim">{ROLE_DESCRIPTIONS[role]}</p>
          </GlowCard>
        ))}
      </div>

      <div className="mt-6">
        {loading && <p className="text-sm text-text-dim">Se încarcă userii din Supabase…</p>}
        {error && <p className="text-sm text-red-400">Eroare: {error}</p>}

        {!loading && !error && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-gold/50"
            >
              <option value="" disabled>
                Alege un utilizator ({ROLE_LABELS[selectedRole]})
              </option>
              {usersForRole.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>

            <ShineButton
              onClick={handleEnter}
              disabled={usersForRole.length === 0 || !selectedId}
              className="disabled:opacity-40"
            >
              Intră în cont →
            </ShineButton>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
