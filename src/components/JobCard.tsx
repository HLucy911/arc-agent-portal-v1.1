"use client";
import { Clock, DollarSign, User, ExternalLink, ChevronRight } from "lucide-react";
import { shortenAddress, explorerTx, jobStatusName } from "@/lib/arc";
import clsx from "clsx";

export interface Job {
  id: bigint;
  client: string;
  provider: string;
  evaluator: string;
  description: string;
  budget: bigint;
  expiredAt: bigint;
  status: number;
  txHash?: string;
}

interface Props {
  job: Job;
  onClick?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Open:      "status-open",
  Funded:    "status-funded",
  Submitted: "status-submitted",
  Completed: "status-completed",
  Rejected:  "status-rejected",
  Expired:   "status-expired",
};

const STATUS_DOT: Record<string, string> = {
  Open:      "bg-arc-400",
  Funded:    "bg-green-400",
  Submitted: "bg-amber-400",
  Completed: "bg-arc-300",
  Rejected:  "bg-red-400",
  Expired:   "bg-slate-500",
};

export default function JobCard({ job, onClick }: Props) {
  const statusName = jobStatusName(job.status);
  const budgetUSDC = (Number(job.budget) / 1e6).toFixed(2);
  const expiresAt = new Date(Number(job.expiredAt) * 1000);
  const expired = expiresAt < new Date();

  return (
    <div
      onClick={onClick}
      className={clsx(
        "glass glass-hover rounded-2xl p-4 cursor-pointer transition-all",
        "border border-dark-400/60 hover:border-arc-600/40"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="mono text-xs text-slate-500">#{job.id.toString()}</span>
          <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5", STATUS_COLORS[statusName])}>
            <span className={clsx("w-1.5 h-1.5 rounded-full", STATUS_DOT[statusName])} />
            {statusName}
          </span>
        </div>
        <ChevronRight size={14} className="text-slate-600 mt-0.5" />
      </div>

      {/* Description */}
      <p className="text-sm text-slate-200 font-medium mb-3 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Meta */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-dark-700/50 rounded-lg p-2">
          <div className="text-slate-500 flex items-center gap-1 mb-1">
            <DollarSign size={10} /> Budget
          </div>
          <div className="text-arc-300 font-semibold">{budgetUSDC} USDC</div>
        </div>
        <div className="bg-dark-700/50 rounded-lg p-2">
          <div className="text-slate-500 flex items-center gap-1 mb-1">
            <User size={10} /> Provider
          </div>
          <div className="mono text-slate-300">{shortenAddress(job.provider)}</div>
        </div>
        <div className="bg-dark-700/50 rounded-lg p-2">
          <div className="text-slate-500 flex items-center gap-1 mb-1">
            <Clock size={10} /> Expires
          </div>
          <div className={clsx("text-xs", expired ? "text-red-400" : "text-slate-300")}>
            {expired ? "Expired" : expiresAt.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Tx hash */}
      {job.txHash && (
        <div className="mt-2 pt-2 border-t border-dark-400/40">
          <a
            href={explorerTx(job.txHash)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mono text-xs text-arc-400 hover:text-arc-300 flex items-center gap-1 transition-colors"
          >
            {shortenAddress(job.txHash)} <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  );
}
