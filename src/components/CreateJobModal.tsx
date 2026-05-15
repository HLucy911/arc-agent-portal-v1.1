"use client";
import { useState } from "react";
import { X, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import {
  getBrowserWalletClient,
  createJob,
  setBudget,
  extractJobIdFromTx,
  explorerTx,
} from "@/lib/arc";
import type { Address, Hex } from "viem";

interface Props {
  account: Address;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "idle" | "creating" | "budget" | "done" | "error";

export default function CreateJobModal({ account, onClose, onSuccess }: Props) {
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState("");
  const [evaluator, setEvaluator] = useState(account);
  const [budgetAmount, setBudgetAmount] = useState("5.00");
  const [expiryHours, setExpiryHours] = useState("1");
  const [step, setStep] = useState<Step>("idle");
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [jobId, setJobId] = useState<bigint | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const isValid =
    description.trim().length > 0 &&
    provider.startsWith("0x") &&
    provider.length === 42 &&
    parseFloat(budgetAmount) > 0;

  const handleCreate = async () => {
    if (!isValid) return;
    setStep("creating");
    setErrorMsg("");

    try {
      const wc = getBrowserWalletClient();
      if (!wc) throw new Error("Wallet not connected");

      // Step 1: createJob
      const hash = await createJob(
        wc,
        account,
        provider as Address,
        evaluator as Address,
        description.trim(),
        parseInt(expiryHours)
      );
      setTxHash(hash);

      // Wait for receipt and get jobId
      const id = await extractJobIdFromTx(hash);
      if (!id) throw new Error("Could not extract job ID from transaction");
      setJobId(id);

      // Step 2: setBudget
      setStep("budget");
      await setBudget(wc, account, id, budgetAmount);

      setStep("done");
      setTimeout(onSuccess, 1200);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setErrorMsg(msg.length > 120 ? msg.slice(0, 120) + "…" : msg);
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in">
      <div className="glass rounded-2xl border border-dark-400/60 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-400/40">
          <div>
            <h2 className="font-bold text-white">Create Job</h2>
            <p className="text-xs text-slate-500 mt-0.5">Deploy an ERC-8183 job on Arc Testnet</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Description */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Job Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Analyze dataset and return summary report in JSON format"
              rows={3}
              className="arc-input w-full px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Provider */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Provider Address</label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="0x… AI agent or worker wallet"
              className="arc-input w-full px-3 py-2 text-sm mono"
            />
          </div>

          {/* Evaluator */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">
              Evaluator Address
              <span className="ml-2 text-arc-400">(defaults to your wallet)</span>
            </label>
            <input
              type="text"
              value={evaluator}
              onChange={(e) => setEvaluator(e.target.value as Address)}
              className="arc-input w-full px-3 py-2 text-sm mono"
            />
          </div>

          {/* Budget + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">Budget (USDC)</label>
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                min="0.01"
                step="0.01"
                className="arc-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">Expiry (hours)</label>
              <input
                type="number"
                value={expiryHours}
                onChange={(e) => setExpiryHours(e.target.value)}
                min="1"
                max="168"
                className="arc-input w-full px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Progress */}
          {step !== "idle" && (
            <div className="bg-dark-700/60 rounded-xl p-3 text-sm space-y-2 border border-dark-400/40">
              <ProgressRow label="Creating job onchain" done={["budget","done"].includes(step)} loading={step === "creating"} />
              <ProgressRow label="Setting budget" done={step === "done"} loading={step === "budget"} />
              {step === "done" && jobId !== null && (
                <div className="text-green-400 text-xs flex items-center gap-1.5 mt-1">
                  <CheckCircle2 size={13} /> Job #{jobId.toString()} created successfully
                </div>
              )}
              {txHash && (
                <a href={explorerTx(txHash)} target="_blank" rel="noreferrer"
                  className="mono text-xs text-arc-400 hover:text-arc-300 flex items-center gap-1">
                  View on Arcscan <ExternalLink size={10} />
                </a>
              )}
            </div>
          )}

          {step === "error" && (
            <p className="text-red-400 text-xs bg-red-900/20 rounded-lg p-2 border border-red-800/30">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!isValid || ["creating", "budget", "done"].includes(step)}
            className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {["creating", "budget"].includes(step) ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {step === "creating" ? "Creating…" : "Setting budget…"}
              </>
            ) : step === "done" ? (
              <>
                <CheckCircle2 size={14} className="text-green-400" /> Created!
              </>
            ) : (
              "Create Job"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  done,
  loading,
}: {
  label: string;
  done: boolean;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {done ? (
        <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />
      ) : loading ? (
        <Loader2 size={13} className="text-arc-400 animate-spin flex-shrink-0" />
      ) : (
        <div className="w-3 h-3 rounded-full border border-slate-600 flex-shrink-0" />
      )}
      <span className={done ? "text-green-400" : loading ? "text-white" : "text-slate-500"}>
        {label}
      </span>
    </div>
  );
}
