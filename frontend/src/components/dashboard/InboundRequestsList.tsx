import { GlassPanel } from "@/components/ui/GlassPanel";
import type { InboundRequest } from "@/lib/types";

export function InboundRequestsList({ requests }: { requests: InboundRequest[] }) {
  if (requests.length === 0) {
    return (
      <GlassPanel className="p-6 text-center text-text-dim">
        Nicio cerere înregistrată încă de agentul de comunicare.
      </GlassPanel>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((r) => (
        <GlassPanel key={r.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-foreground">{r.message}</p>
            <span
              className={
                r.escalated
                  ? "shrink-0 rounded-full border border-gold/30 bg-gold/15 px-3 py-1 text-xs text-gold"
                  : "shrink-0 rounded-full border border-emerald/30 bg-emerald/15 px-3 py-1 text-xs text-emerald"
              }
            >
              {r.escalated ? "Escaladat" : "Auto-răspuns"}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-text-dim">
            <span>Încredere AI: {r.ai_confidence != null ? `${Math.round(r.ai_confidence * 100)}%` : "—"}</span>
            {r.owner_response && <span>Răspuns owner: „{r.owner_response}”</span>}
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
