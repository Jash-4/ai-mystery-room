import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Terminal, PlusCircle, Activity } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-400 group-hover:glow-cyan transition-all">
            <ShieldAlert className="w-5 h-5 animate-pulse text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm tracking-widest font-black uppercase text-slate-100">
                Project Blackout
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-semibold">
                v2.4 SEC
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 tracking-wider">
              AI CYBER-FORENSICS INCIDENT LAB
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              location.pathname === '/'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>INCIDENTS</span>
          </Link>

          <Link
            to="/create"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              location.pathname === '/create'
                ? 'bg-cyan-500 text-slate-950 font-bold glow-cyan'
                : 'bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>NEW INCIDENT</span>
          </Link>

          {/* Telemetry pill */}
          <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-slate-800 text-[11px] font-mono text-emerald-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>FEED_ONLINE</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
