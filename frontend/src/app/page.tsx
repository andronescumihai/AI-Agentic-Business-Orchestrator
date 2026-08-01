import { GradientText } from "@/components/ui/GradientText";
import Waves from "@/components/Waves";
import { RoleSelector } from "@/components/RoleSelector";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 sm:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Waves
          lineColor="rgba(212, 175, 55, 0.3)"
          backgroundColor="transparent"
          waveSpeedX={0.0125}
          waveSpeedY={0.005}
          waveAmpX={28}
          waveAmpY={14}
          xGap={14}
          yGap={36}
        />
      </div>
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <span className="rounded-full border border-border bg-surface px-4 py-1 text-xs uppercase tracking-widest text-text-dim">
          Portofoliu · Arhitectură multi-agent
        </span>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          <GradientText>AI Orchestrator</GradientText>
          <br />
          <span className="text-foreground">pentru o clinică dentară</span>
        </h1>

        <div className="mt-10 w-full max-w-xl">
          <RoleSelector />
        </div>
      </div>
    </main>
  );
}
