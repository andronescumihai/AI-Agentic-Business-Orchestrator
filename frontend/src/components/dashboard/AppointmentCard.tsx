"use client";

import { useCallback, useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { NoteForm } from "@/components/dashboard/NoteForm";
import type { ActiveUser, Appointment, AppointmentNote } from "@/lib/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ro-RO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AppointmentCard({
  appointment,
  activeUser,
  counterpartLabel,
}: {
  appointment: Appointment;
  activeUser: ActiveUser;
  counterpartLabel: string;
}) {
  const [notes, setNotes] = useState<AppointmentNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const notesQuery = `appointmentId=${appointment.id}&role=${activeUser.role}&userId=${activeUser.id}`;

  const refreshNotes = useCallback(async () => {
    const res = await fetch(`/api/notes?${notesQuery}`);
    const data = await res.json();
    setNotes(data.notes ?? []);
  }, [notesQuery]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/notes?${notesQuery}`);
      const data = await res.json();
      setNotes(data.notes ?? []);
      setLoadingNotes(false);
    }
    load();
  }, [notesQuery]);

  return (
    <GlassPanel className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium capitalize">{formatDateTime(appointment.scheduled_at)}</p>
          <p className="text-sm text-text-dim">{counterpartLabel}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      {appointment.notes && (
        <p className="mt-3 text-sm text-text-dim">Detalii: {appointment.notes}</p>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <p className="text-xs uppercase tracking-wide text-text-dim">Notițe</p>
        {loadingNotes ? (
          <p className="mt-2 text-sm text-text-dim">Se încarcă…</p>
        ) : notes.length === 0 ? (
          <p className="mt-2 text-sm text-text-dim">Nicio notiță încă.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {notes.map((n) => (
              <li key={n.id} className="text-sm">
                <span className="font-medium">{n.author_name}:</span> {n.content}
              </li>
            ))}
          </ul>
        )}

        <NoteForm
          appointmentId={appointment.id}
          activeUser={activeUser}
          onNoteAdded={refreshNotes}
        />
      </div>
    </GlassPanel>
  );
}
