"use client";
import { Layers, DollarSign, Activity, Network } from "lucide-react";

interface Props {
  totalJobs: number;
  totalVolume: string;
  activeJobs: number;
}

export default function StatsBar({ totalJobs, totalVolume, activeJobs }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        icon={<Layers size={14} />}
        label="Total Jobs"
        value={totalJobs.toString()}
      />
      <StatCard
        icon={<DollarSign size={14} />}
        label="USDC Volume"
        value={`$${totalVolume}`}
      />
      <StatCard
        icon={<Activity size={14} />}
        label="Active Jobs"
        value={activeJobs.toString()}
        accent
      />
      <StatCard
        icon={<Network size={14} />}
        label="Network"
        value="Arc Testnet"
        small
      />
    </div>
  );
}

function StatCard({ icon, label, value, accent, small }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="glass rounded-xl p-3 border border-dark-400/60">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
        <span className="text-arc-400">{icon}</span>
        {label}
      </div>
      <div className={`font-bold ${small ? "text-sm" : "text-lg"} ${accent ? "text-arc-300" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}
