"use client";
import { useState, useEffect } from "react";
import {
  X, ExternalLink, RefreshCw, Loader2, CheckCircle2,
  DollarSign, User, Clock, Hash, FileText, Zap
} from "lucide-react";
import {
  getJob, getBrowserWalletClient,
  approveUSDC, fundJob, submitDeliverable, completeJob,
  formatUSDC, parseUSDC, explorerTx, explorerAddress,
  jobStatusName, shortenAddress,
} from "@/lib/arc";
import type { Address, Hex } from "viem";
import clsx from "clsx";

interface Props {
  jobId: bigint;
  account: Address;
  onClose: () => void;
  onUpdated: () => void;
}

type Action = "fund" | "submit" | "complete";
type ActionState = "idle" | "pending" | "done" | "error";

export default function JobDetailModal({ jobId, account, onClose, onUpdated }: Props) {
  const [job, setJob] = useState<Awaited<ReturnType<typeof getJob>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionLabel, setActionLabel] = useState("");
  const [deliverableInput, setDeliverableInput] = useState("");
  const [lastTx, setLastTx] = useState<Hex | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getJob(jobId);
      setJob(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [jobId]);

  const run = async (action: Action) => {
    const wc = getBrowserWalletClient();
    if (!wc || !job) return;
    setActionState("pending");
    setErrorMsg("");
    try {
      let hash: Hex;
      if (action === "fund") {
        setActionLabel("Approving USDC…");
        hash = await approveUSDC(wc, account, job.budget);
        setActionLabel("Funding escrow…");
        hash = await fundJob(wc, account, jobId);
      } else if (action === "submit") {
        setActionLabel("Submitting deliverable…");
        hash = await submitDeliverable(wc, account, jobId, deliverableInput);
      } else {
        setActionLabel("Completing job…");
        hash = await completeJob(wc, account, jobId);
      }
      setLastTx(hash);
      setActionState("done");
      await refresh();
      onUpdated();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setErrorMsg(msg.length > 120 ? msg.slice(0, 120) + "…" : msg);
      setActionState("error");
    }
  };

  const statusName = job ? jobStatusName(job.status) : "";
  const canFund = statusName === "Open" && job?.client.toLowerCase() === account.toLowerCase();
  const canSubmit = statusName === "Funded" && job?.provider.toLowerCase() === account.toLowerCase();
  const canComplete = statusName === "Submitted" && job?.evaluator.toLowerCase() === account.toLowerCase();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in">
      <div className="glass rounded-2xl border border-dark-400/60 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-400/40 sticky top-0 glass z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-arc-800/60 flex items-center justify-center">
              <Zap size={15} className="text-arc-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Job #{jobId.toString()}</span>
                {job && (
                  <StatusBadge status={jobStatusName(job.status)} />
                )}
              </div>
              <p className="text-xs text-slate-500">ERC-8183 · Arc Testnet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="text-slate-500 hover:text-white p-1 transition-colors">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white p-1 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {loading && !job ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-arc-400" />
          </div>
        ) : job ? (
          <div className="p-5 space-y-4">
            {/* Description */}
            <div className="bg-dark-700/40 rounded-xl p-4 border border-dark-400/30">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <FileText size={11} /> Description
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{job.description}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <InfoRow icon={<DollarSign size={12} />} label="Budget" value={`${formatUSDC(job.budget)} USDC`} accent />
              <InfoRow icon={<Clock size={12} />} label="Expires" value={new Date(Number(job.expiredAt) * 1000).toLocaleString()} />
              <InfoRow icon={<User size={12} />} label="Client" value={shortenAddress(job.client)} mono link={explorerAddress(job.client)} />
              <InfoRow icon={<User size={12} />} label="Provider" value={shortenAddress(job.provider)} mono link={explorerAddress(job.provider)} />
              <InfoRow icon={<User size={12} />} label="Evaluator" value={shortenAddress(job.evaluator)} mono link={explorerAddress(job.evaluator)} />
              <InfoRow icon={<Hash size={12} />} label="Job ID" value={`#${job.id.toString()}`} mono />
            </div>

            {/* Job lifecycle */}
            <LifecycleBar status={Number(job.status)} />

            {/* Actions */}
            <div className="space-y-3">
              {canFund && (
                <ActionSection
                  title="Fund Escrow"
                  desc={`Approve ${formatUSDC(job.budget)} USDC and move job to Funded state.`}
                  loading={actionState === "pending"}
                  loadingLabel={actionLabel}
                  done={actionState === "done"}
                  onAction={() => run("fund")}
                  label="Approve & Fund"
                />
              )}
              {canSubmit && (
                <div className="bg-dark-700/40 rounded-xl p-4 border border-dark-400/30 space-y-3">
                  <div>
                    <div className="text-xs text-slate-400 font-medium mb-0.5">Submit Deliverable</div>
                    <p className="text-xs text-slate-500">Enter the deliverable content — it will be hashed onchain.</p>
                  </div>
                  <textarea
                    value={deliverableInput}
                    onChange={(e) => setDeliverableInput(e.target.value)}
                    placeholder="Paste deliverable output, URL, or hash value…"
                    rows={3}
                    className="arc-input w-full px-3 py-2 text-sm resize-none"
                  />
                  <button
                    onClick={() => run("submit")}
                    disabled={!deliverableInput.trim() || actionState === "pending"}
                    className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    {actionState === "pending" ? (
                      <><Loader2 size={13} className="animate-spin" /> {actionLabel}</>
                    ) : "Submit Deliverable"}
                  </button>
                </div>
              )}
              {canComplete && (
                <ActionSection
                  title="Complete Job"
                  desc="Evaluate and release USDC payment to the provider."
                  loading={actionState === "pending"}
                  loadingLabel={actionLabel}
                  done={actionState === "done"}
                  onAction={() => run("complete")}
                  label="Complete & Pay"
                  variant="success"
                />
              )}
            </div>

            {/* Tx result */}
            {lastTx && (
              <a href={explorerTx(lastTx)} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-arc-400 hover:text-arc-300 transition-colors">
                <CheckCircle2 size={12} className="text-green-400" />
                View transaction <ExternalLink size={11} />
              </a>
            )}
            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-900/20 rounded-lg p-2 border border-red-800/30">{errorMsg}</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Open: "status-open", Funded: "status-funded", Submitted: "status-submitted",
    Completed: "status-completed", Rejected: "status-rejected", Expired: "status-expired",
  };
  return (
    <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", colors[status] ?? "status-open")}>
      {status}
    </span>
  );
}

function InfoRow({ icon, label, value, mono, accent, link }: {
  icon: React.ReactNode; label: string; value: string;
  mono?: boolean; accent?: boolean; link?: string;
}) {
  const textCls = clsx(
    "text-sm font-medium",
    accent ? "text-arc-300" : "text-slate-200",
    mono && "mono text-xs"
  );
  return (
    <div className="bg-dark-700/40 rounded-lg p-3 border border-dark-400/30">
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">{icon}{label}</div>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer" className={clsx(textCls, "hover:text-arc-300 flex items-center gap-1")}>
          {value} <ExternalLink size={10} />
        </a>
      ) : (
        <div className={textCls}>{value}</div>
      )}
    </div>
  );
}

function LifecycleBar({ status }: { status: number }) {
  const steps = ["Open", "Funded", "Submitted", "Completed"];
  return (
    <div className="bg-dark-700/40 rounded-xl p-4 border border-dark-400/30">
      <div className="text-xs text-slate-500 mb-3">Job lifecycle</div>
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={clsx(
              "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0",
              i < status ? "bg-arc-600 text-white" :
              i === status ? "bg-arc-500 text-white ring-2 ring-arc-400/40" :
              "bg-dark-500 text-slate-600"
            )}>
              {i < status ? <CheckCircle2 size={12} /> : i + 1}
            </div>
            <div className="flex-1 flex flex-col items-start ml-1.5 mr-2 min-w-0">
              <span className={clsx("text-xs truncate", i <= status ? "text-slate-300" : "text-slate-600")}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={clsx("h-px flex-1 mx-1", i < status ? "bg-arc-600" : "bg-dark-400")} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionSection({ title, desc, loading, loadingLabel, done, onAction, label, variant = "primary" }: {
  title: string; desc: string; loading: boolean; loadingLabel: string;
  done: boolean; onAction: () => void; label: string; variant?: "primary" | "success";
}) {
  return (
    <div className="bg-dark-700/40 rounded-xl p-4 border border-dark-400/30">
      <div className="text-xs text-slate-400 font-medium mb-0.5">{title}</div>
      <p className="text-xs text-slate-500 mb-3">{desc}</p>
      <button
        onClick={onAction}
        disabled={loading || done}
        className={clsx(
          "w-full py-2.5 text-sm flex items-center justify-center gap-2 rounded-lg font-semibold transition-all",
          variant === "success"
            ? "bg-green-900/40 border border-green-600/40 text-green-300 hover:bg-green-800/40 disabled:opacity-50"
            : "btn-primary"
        )}
      >
        {loading ? (
          <><Loader2 size={13} className="animate-spin" /> {loadingLabel}</>
        ) : done ? (
          <><CheckCircle2 size={13} /> Done</>
        ) : label}
      </button>
    </div>
  );
}
