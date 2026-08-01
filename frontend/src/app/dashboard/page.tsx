"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { ShineButton } from "@/components/ui/ShineButton";
import { OwnerPanel } from "@/components/dashboard/OwnerPanel";
import { DoctorPanel } from "@/components/dashboard/DoctorPanel";
import { ClientPanel } from "@/components/dashboard/ClientPanel";

const ROLE_LABELS = { owner: "Owner", doctor: "Doctor", client: "Client" };

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useRole();

  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-text-dim">Se încarcă…</p>
      </main>
    );
  }

  function handleSwitchRole() {
    setUser(null);
    router.push("/");
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-text-dim">Autentificat ca</p>
          <h1 className="text-2xl font-semibold">
            {user.full_name}{" "}
            <span className="text-sm font-normal text-gold">
              · {ROLE_LABELS[user.role]}
            </span>
          </h1>
        </div>
        <ShineButton variant="outline" onClick={handleSwitchRole} className="px-4 py-2 text-sm">
          Schimbă rol
        </ShineButton>
      </header>

      {user.role === "owner" && <OwnerPanel activeUser={user} />}
      {user.role === "doctor" && <DoctorPanel activeUser={user} />}
      {user.role === "client" && <ClientPanel activeUser={user} />}
    </main>
  );
}
