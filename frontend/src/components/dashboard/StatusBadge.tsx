import clsx from "clsx";
import type { AppointmentStatus } from "@/lib/types";

const STYLES: Record<AppointmentStatus, string> = {
  confirmed: "bg-emerald/15 text-emerald border-emerald/30",
  pending: "bg-gold/15 text-gold border-gold/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  done: "bg-white/10 text-text-dim border-border",
};

const LABELS: Record<AppointmentStatus, string> = {
  confirmed: "Confirmată",
  pending: "În așteptare",
  cancelled: "Anulată",
  done: "Finalizată",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={clsx(
        "w-fit whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium",
        STYLES[status]
      )}
    >
      {LABELS[status]}
    </span>
  );
}
