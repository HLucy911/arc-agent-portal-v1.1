"use client";
import { Zap, ExternalLink, Github } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-400/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-arc-600 flex items-center justify-center shadow-lg shadow-arc-600/30">
              <Zap size={14} className="text-white" fill="currentColor" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight">Arc Agent Portal</span>
              <span className="ml-2 text-xs text-arc-400 font-medium bg-arc-900/60 px-1.5 py-0.5 rounded">
                ERC-8183
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>Explorer</span>
              <ExternalLink size={11} />
            </a>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 btn-secondary rounded-lg"
            >
              Faucet
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
