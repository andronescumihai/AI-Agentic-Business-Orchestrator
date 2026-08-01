"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import type { ActiveUser, Appointment } from "@/lib/types";

export function ClientPanel({ activeUser }: { activeUser: ActiveUser }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/appointments?role=${activeUser.role}&userId=${activeUser.id}`)
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments ?? []))
      .finally(() => setLoading(false));
  }, [activeUser]);

  if (loading) {
    return <p className="text-text-dim">Se încarcă programările tale…</p>;
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Programările tale</h2>
      {appointments.length === 0 ? (
        <GlassPanel className="p-6 text-center text-text-dim">
          Nu ai nicio programare momentan.
        </GlassPanel>
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              activeUser={activeUser}
              counterpartLabel={`cu ${a.doctor_name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
