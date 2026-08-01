"use client";

import { WeekCalendar } from "@/components/dashboard/WeekCalendar";
import type { ActiveUser } from "@/lib/types";

export function DoctorPanel({ activeUser }: { activeUser: ActiveUser }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Programările tale</h2>
      <WeekCalendar activeUser={activeUser} />
    </div>
  );
}
