"use client";
import { useState, useCallback } from "react";
import { Plus, Zap, ArrowRight, BookOpen, Cpu, Shield, Coins } from "lucide-react";
import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import JobCard, { type Job } from "@/components/JobCard";
import CreateJobModal from "@/components/CreateJobModal";
import JobDetailModal from "@/components/JobDetailModal";
import LookupJobPanel from "@/components/LookupJobPanel";
import StatsBar from "@/components/StatsBar";
import {
  getJob, formatUSDC,
} from "@/lib/arc";
import type { Address } from "viem";

export default function Home() {
  const [account, setAccount] = useState<Address | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<bigint | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [watchId, setWatchId] = useState("");

  // Track jobs created in this session
  const addJobById = useCallback(async (id: bigint, txHash?: string) => {
    try {
      const data = await getJob(id);
      const job: Job = {
        id: data.id,
        client: data.client,
        provider: data.provider,
        evaluator: data.evaluator,
        description: data.description,
        budget: data.budget,
        expiredAt: data.expiredAt,
        status: data.status,
        txHash,
      };
      setJobs((prev) => {
        const existing = prev.findIndex((j) => j.id === id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = job;
          return updated;
        }
        return [job, ...prev];
      });
    } catch {}
  }, []);

  const refreshJob = useCallback(async (id: bigint) => {
    await addJobById(id);
  }, [addJobById]);

  const handleWatchJob = async () => {
    const id = watchId.trim();
    if (!id || isNaN(Number(id))) return;
    setLoadingJobs(true);
    await addJobById(BigInt(id));
    setWatchId("");
    setLoadingJobs(false);
  };

  const totalVolume = jobs
    .reduce((sum, j) => sum + Number(j.budget) / 1e6, 0)
    .toFixed(2);

  const activeJobs = jobs.filter((j) => j.status < 3).length;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Hero */}
        <div className="py-12 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full bg-arc-600/5 blur-3xl" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs text-arc-400 bg-arc-900/40 border border-arc-800/60 px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
              Arc Testnet · ERC-8183 AI Agent Commerce
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              AI Agent{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-arc-300 to-arc-500">
                Payment Portal
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Create, fund, and settle AI agent jobs using ERC-8183 smart contracts
              and USDC stablecoins on Arc Network.
            </p>
          </div>
        </div>

        {/* Wallet + Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <WalletConnect onConnected={(addr) => setAccount(addr)} />
          {account && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              <Plus size={15} /> New Job
            </button>
          )}
        </div>

        {/* Stats */}
        {jobs.length > 0 && (
          <div className="mb-6">
            <StatsBar totalJobs={jobs.length} totalVolume={totalVolume} activeJobs={activeJobs} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Jobs List */}
          <div className="lg:col-span-2">
            {/* Watch a job by ID */}
            <div className="glass rounded-2xl border border-dark-400/60 p-4 mb-4">
              <div className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5">
                <Zap size={11} className="text-arc-400" /> Track a Job by ID
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={watchId}
                  onChange={(e) => setWatchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleWatchJob()}
                  placeholder="Enter Job ID to watch…"
                  className="arc-input flex-1 px-3 py-2 text-sm"
                />
                <button
                  onClick={handleWatchJob}
                  disabled={!watchId || loadingJobs}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  {loadingJobs ? "Loading…" : "Track"}
                </button>
              </div>
            </div>

            {/* Jobs grid */}
            {jobs.length === 0 ? (
              <EmptyState connected={!!account} onNew={() => setShowCreate(true)} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id.toString()}
                    job={job}
                    onClick={() => setSelectedJobId(job.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* How it works */}
            <div className="glass rounded-2xl border border-dark-400/60 p-5">
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <BookOpen size={14} className="text-arc-400" /> How it works
              </h3>
              <div className="space-y-3">
                {STEPS.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-lg bg-arc-900/60 border border-arc-700/40 flex items-center justify-center flex-shrink-0 text-xs font-bold text-arc-400">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{s.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="glass rounded-2xl border border-dark-400/60 p-5">
              <h3 className="font-semibold text-white text-sm mb-3">Features</h3>
              <div className="space-y-2">
                {FEATURES.map((f) => (
                  <div key={f.label} className="flex items-start gap-2.5">
                    <div className="text-arc-400 mt-0.5">{f.icon}</div>
                    <div>
                      <div className="text-xs font-medium text-slate-300">{f.label}</div>
                      <div className="text-xs text-slate-500">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="glass rounded-2xl border border-dark-400/60 p-5">
              <h3 className="font-semibold text-white text-sm mb-3">Resources</h3>
              <div className="space-y-1.5">
                {LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between text-xs text-slate-400 hover:text-white py-1.5 px-2 rounded-lg hover:bg-dark-500/50 transition-all group"
                  >
                    {l.label}
                    <ArrowRight size={11} className="text-slate-600 group-hover:text-arc-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreate && account && (
        <CreateJobModal
          account={account}
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); }}
        />
      )}
      {selectedJobId !== null && account && (
        <JobDetailModal
          jobId={selectedJobId}
          account={account}
          onClose={() => setSelectedJobId(null)}
          onUpdated={() => refreshJob(selectedJobId)}
        />
      )}
    </div>
  );
}

// ─── Static data ─────────────────────────────────────────────────────────────

const STEPS = [
  { title: "Create Job", desc: "Deploy an ERC-8183 job with description, provider, and budget." },
  { title: "Fund Escrow", desc: "Approve USDC and lock payment in the smart contract." },
  { title: "Provider Submits", desc: "The AI agent submits a deliverable hash onchain." },
  { title: "Evaluator Completes", desc: "Review output and release USDC payment." },
];

const FEATURES = [
  { icon: <Shield size={13} />, label: "Escrow-protected", desc: "USDC locked in smart contract until delivery" },
  { icon: <Cpu size={13} />, label: "AI-native", desc: "Designed for autonomous AI agent workflows" },
  { icon: <Coins size={13} />, label: "USDC settlements", desc: "Stablecoin payments on Arc Network" },
];

const LINKS = [
  { label: "Arc ERC-8183 Docs", href: "https://docs.arc.network/arc/tutorials/create-your-first-erc-8183-job" },
  { label: "Register AI Agent", href: "https://docs.arc.network/arc/tutorials/register-your-first-ai-agent" },
  { label: "Arc Testnet Explorer", href: "https://testnet.arcscan.app" },
  { label: "Circle Faucet", href: "https://faucet.circle.com" },
  { label: "Arc App Kit", href: "https://docs.arc.network/app-kit" },
];

function EmptyState({ connected, onNew }: { connected: boolean; onNew: () => void }) {
  return (
    <div className="glass rounded-2xl border border-dark-400/60 p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-arc-900/60 border border-arc-700/40 flex items-center justify-center mx-auto mb-4">
        <Cpu size={24} className="text-arc-400" />
      </div>
      <h3 className="font-semibold text-white mb-2">No jobs tracked</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
        {connected
          ? "Create your first ERC-8183 job or enter an existing Job ID to track it."
          : "Connect your wallet to create and manage AI agent jobs on Arc Testnet."}
      </p>
      {connected && (
        <button onClick={onNew} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 mx-auto">
          <Plus size={14} /> Create First Job
        </button>
      )}
    </div>
  );
}
