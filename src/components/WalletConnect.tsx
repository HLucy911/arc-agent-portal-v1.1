"use client";
import { useState, useEffect, useCallback } from "react";
import { Wallet, ChevronDown, Copy, Check, ExternalLink, LogOut } from "lucide-react";
import { getBrowserWalletClient, getUSDCBalance, formatUSDC, shortenAddress, explorerAddress } from "@/lib/arc";
import type { Address } from "viem";

interface Props {
  onConnected: (address: Address) => void;
}

export default function WalletConnect({ onConnected }: Props) {
  const [address, setAddress] = useState<Address | null>(null);
  const [balance, setBalance] = useState<string>("0.00");
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async (addr: Address) => {
    try {
      const bal = await getUSDCBalance(addr);
      setBalance(formatUSDC(bal));
    } catch {}
  }, []);

  const connect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const wc = getBrowserWalletClient();
      if (!wc) {
        setError("No wallet detected. Please install MetaMask or Rabby.");
        return;
      }
      const [addr] = await wc.requestAddresses();
      setAddress(addr);
      onConnected(addr);
      refreshBalance(addr);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Connection refused";
      setError(msg);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setOpen(false);
  };

  const copy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    if (address) {
      const interval = setInterval(() => refreshBalance(address), 15000);
      return () => clearInterval(interval);
    }
  }, [address, refreshBalance]);

  if (!address) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={connect}
          disabled={connecting}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Wallet size={15} />
          {connecting ? "Connecting…" : "Connect Wallet"}
        </button>
        {error && <p className="text-xs text-red-400 max-w-xs text-right">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass glass-hover flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm"
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
        <span className="text-slate-300 font-medium">{shortenAddress(address)}</span>
        <span className="text-arc-400 font-semibold">{balance} USDC</span>
        <ChevronDown size={13} className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 glass rounded-xl border border-dark-400/60 p-3 shadow-2xl animate-in z-50">
          <div className="text-xs text-slate-500 mb-1">Connected wallet</div>
          <div className="mono text-xs text-slate-300 mb-2 break-all">{address}</div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <span className="bg-dark-500 px-2 py-1 rounded text-arc-300 font-semibold">{balance} USDC</span>
            <span className="text-slate-600">Arc Testnet</span>
          </div>
          <div className="flex gap-2">
            <button onClick={copy} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs">
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a href={explorerAddress(address)} target="_blank" rel="noreferrer"
              className="btn-secondary flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs">
              <ExternalLink size={12} /> View
            </a>
            <button onClick={disconnect} className="btn-secondary px-2 py-1.5 text-xs text-red-400 hover:border-red-500/40">
              <LogOut size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
