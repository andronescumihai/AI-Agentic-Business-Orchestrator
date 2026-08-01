"use client";

import { useEffect, useState } from "react";
import { FinanceKpis } from "@/components/dashboard/FinanceKpis";
import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import { InboundRequestsList } from "@/components/dashboard/InboundRequestsList";
import type { ActiveUser, FinanceSummary, InboundRequest } from "@/lib/types";

interface UserRow {
  id: string;
  full_name: string;
  role: string;
}

export function OwnerPanel({ activeUser }: { activeUser: ActiveUser }) {
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [doctors, setDoctors] = useState<UserRow[]>([]);
  const [requests, setRequests] = useState<InboundRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [financeRes, usersRes, reqRes] = await Promise.all([
        fetch(`/api/finance?role=${activeUser.role}`).then((r) => r.json()),
        fetch(`/api/users`).then((r) => r.json()),
        fetch(`/api/inbound?role=${activeUser.role}`).then((r) => r.json()),
      ]);
      setFinance(financeRes);
      setDoctors((usersRes.users ?? []).filter((u: UserRow) => u.role === "doctor"));
      setRequests(reqRes.requests ?? []);
      setLoading(false);
    }
    load();
  }, [activeUser]);

  if (loading) {
    return <p className="text-text-dim">Se încarcă panoul owner…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Sumar financiar</h2>
        {finance && <FinanceKpis summary={finance} />}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Programările tuturor doctorilor</h2>
        <WeekCalendar activeUser={activeUser} doctorOptions={doctors} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Cereri recente (agent de comunicare)</h2>
        <InboundRequestsList requests={requests} />
      </section>
    </div>
  );
}
