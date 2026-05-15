"use client";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { getJob } from "@/lib/arc";
import type { Address } from "viem";
import JobDetailModal from "./JobDetailModal";

interface Props {
  account: Address | null;
}

export default function LookupJobPanel({ account }: Props) {
  const [inputId, setInputId] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundId, setFoundId] = useState<bigint | null>(null);
  const [error, setError] = useState("");

  const lookup = async () => {
    const id = inputId.trim();
    if (!id || isNaN(Number(id))) return;
    setLoading(true);
    setError("");
    try {
      const job = await getJob(BigInt(id));
      if (!job) { setError("Job not found"); return; }
      setFoundId(BigInt(id));
    } catch {
      setError("Job not found or network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="number"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          placeholder="Enter Job ID…"
          className="arc-input flex-1 px-3 py-2 text-sm"
          min="0"
        />
        <button
          onClick={lookup}
          disabled={loading || !inputId}
          className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Lookup
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}

      {foundId !== null && account && (
        <JobDetailModal
          jobId={foundId}
          account={account}
          onClose={() => setFoundId(null)}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
}
