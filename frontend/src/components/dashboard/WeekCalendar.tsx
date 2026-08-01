"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { NoteForm } from "@/components/dashboard/NoteForm";
import { getWeekRange, isSameDay } from "@/lib/date";
import type { ActiveUser, Appointment, AppointmentStatus } from "@/lib/types";

const WEEK_OPTIONS = [
  { offset: 0, label: "Săptămâna curentă" },
  { offset: 1, label: "Săptămâna viitoare" },
  { offset: 2, label: "Peste 2 săptămâni" },
];

const DAY_LABELS = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

const STATUS_DOT: Record<AppointmentStatus, string> = {
  confirmed: "bg-emerald",
  pending: "bg-gold",
  cancelled: "bg-red-500",
  done: "bg-text-dim",
};

function formatDayHeader(d: Date) {
  return d.toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}

interface DoctorOption {
  id: string;
  full_name: string;
}

export function WeekCalendar({
  activeUser,
  doctorOptions,
}: {
  activeUser: ActiveUser;
  /** Doar pentru owner: lista de doctori pentru filtrul opțional. */
  doctorOptions?: DoctorOption[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [doctorFilter, setDoctorFilter] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { start, end, days } = getWeekRange(weekOffset);

  const refreshAppointments = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      role: activeUser.role,
      userId: activeUser.id,
      from: start,
      to: end,
    });
    if (activeUser.role === "owner" && doctorFilter) {
      params.set("doctorId", doctorFilter);
    }

    fetch(`/api/appointments?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments ?? []))
      .finally(() => setLoading(false));
  }, [activeUser.role, activeUser.id, start, end, doctorFilter, refreshKey]);

  const expanded = appointments.find((a) => a.id === expandedId) ?? null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {WEEK_OPTIONS.map((opt) => (
            <button
              key={opt.offset}
              onClick={() => setWeekOffset(opt.offset)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                weekOffset === opt.offset
                  ? "border-gold/50 bg-gold/15 text-gold"
                  : "border-border bg-surface text-text-dim hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {activeUser.role === "owner" && doctorOptions && doctorOptions.length > 0 && (
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-gold/50"
          >
            <option value="">Toți doctorii</option>
            {doctorOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className="text-text-dim">Se încarcă…</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {days.map((day, i) => {
            const dayAppointments = appointments.filter((a) =>
              isSameDay(new Date(a.scheduled_at), day)
            );
            return (
              <GlassPanel key={i} className="p-3">
                <p className="text-xs uppercase tracking-wide text-text-dim">
                  {DAY_LABELS[i]}
                </p>
                <p className="mb-2 text-sm font-medium">{formatDayHeader(day)}</p>

                {dayAppointments.length === 0 ? (
                  <p className="text-xs text-text-dim">—</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {dayAppointments.map((a) => (
                      <motion.button
                        key={a.id}
                        layoutId={`appt-${a.id}`}
                        onClick={() => setExpandedId(a.id)}
                        className="relative flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border border-border/60 bg-surface p-1 text-center transition-colors hover:border-gold/40"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[a.status]}`} />
                        <span className="text-[11px] font-medium leading-tight">
                          {formatTime(a.scheduled_at)}
                        </span>
                        {a.appointmentNotes.length > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-black">
                            {a.appointmentNotes.length}
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedId(null)}
          >
            <motion.div
              layoutId={`appt-${expanded.id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium capitalize">
                    {new Date(expanded.scheduled_at).toLocaleDateString("ro-RO", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    })}{" "}
                    · {formatTime(expanded.scheduled_at)}
                  </p>
                  <p className="text-sm text-text-dim">
                    {activeUser.role === "owner"
                      ? `${expanded.client_name} · ${expanded.doctor_name}`
                      : activeUser.role === "doctor"
                        ? expanded.client_name
                        : expanded.doctor_name}
                  </p>
                </div>
                <StatusBadge status={expanded.status} />
              </div>

              {expanded.notes && (
                <p className="mt-3 text-sm text-text-dim">Detalii: {expanded.notes}</p>
              )}

              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs uppercase tracking-wide text-text-dim">Notițe</p>
                {expanded.appointmentNotes.length === 0 ? (
                  <p className="mt-2 text-sm text-text-dim">Nicio notiță încă.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {expanded.appointmentNotes.map((n) => (
                      <li key={n.id} className="text-sm">
                        <span className="font-medium">{n.author_name}:</span> {n.content}
                      </li>
                    ))}
                  </ul>
                )}

                {activeUser.role === "doctor" && (
                  <NoteForm
                    appointmentId={expanded.id}
                    activeUser={activeUser}
                    onNoteAdded={refreshAppointments}
                  />
                )}
              </div>

              <button
                onClick={() => setExpandedId(null)}
                className="mt-4 text-sm text-text-dim hover:text-foreground"
              >
                Închide
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
