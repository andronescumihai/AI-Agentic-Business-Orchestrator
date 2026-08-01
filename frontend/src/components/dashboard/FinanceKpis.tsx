import { GlowCard } from "@/components/ui/GlowCard";
import type { FinanceSummary } from "@/lib/types";

function formatRON(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinanceKpis({ summary }: { summary: FinanceSummary }) {
  const kpis = [
    { label: "Venituri", value: summary.revenue, glow: "emerald" as const },
    { label: "Cheltuieli", value: summary.expenses, glow: "gold" as const },
    { label: "Profit net", value: summary.profit, glow: "emerald" as const },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {kpis.map((kpi) => (
        <GlowCard key={kpi.label} glow={kpi.glow}>
          <p className="text-sm text-text-dim">{kpi.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {formatRON(kpi.value)}
          </p>
        </GlowCard>
      ))}
    </div>
  );
}
