import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  Cpu, 
  Search, 
  KeyRound, 
  ArrowRight,
  Database,
  Lock,
  Radio
} from 'lucide-react';
import { getAllCases } from '../services/api';

export default function Home() {
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const data = await getAllCases();
        if (data.success) {
          setRecentCases(data.cases || []);
        }
      } catch (err) {
        console.warn('Could not load case archive:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] cyber-grid scanline pb-16">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        
        {/* Incident Alert Banner */}
        <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-8 backdrop-blur-md">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>CYBER-FORENSIC PROTOCOL ACTIVE // LEVEL 4 CLEARANCE</span>
        </div>

        {/* Hero Incident Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 font-mono uppercase mb-4 leading-none">
            Project <span className="text-cyan-400 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Blackout</span>
            <span className="block text-2xl sm:text-3xl font-light text-slate-400 tracking-normal mt-2 normal-case font-sans">
              AI Cyber-Forensics Incident Room
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans mb-8">
            Unauthorized weights extraction. Sabotaged neural pipelines. Rogue insider access. 
            Step into the command terminal as a digital forensics investigator. Interrogate suspects, 
            piece together encrypted clues, decode signal hints, and indict the rogue actor before the trail goes cold.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/create"
              className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-sm tracking-wider transition-all transform hover:-translate-y-0.5 glow-cyan"
            >
              <Terminal className="w-4 h-4 text-slate-950" />
              <span>INITIALIZE INCIDENT</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>

            <a
              href="#protocol"
              className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-mono text-xs tracking-wider transition-all"
            >
              <span>READ PROTOCOL</span>
            </a>
          </div>
        </div>

        {/* Core Mechanics Matrix */}
        <div id="protocol" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-cyan-500/40 transition-all">
            <div className="p-3 w-fit rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-mono font-semibold text-slate-100 mb-2">Procedural Gemini Cases</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Every mystery is synthesized dynamically with tailored suspect alibis, motives, and forensic artifacts via Google Gemini.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-indigo-500/40 transition-all">
            <div className="p-3 w-fit rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-mono font-semibold text-slate-100 mb-2">Forensic Clue Discovery</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Inspect corrupted packet captures, memory dumps, and physical access badges. Uncovering clues awards +5 points to your case rating.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-amber-500/40 transition-all">
            <div className="p-3 w-fit rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400 mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-mono font-semibold text-slate-100 mb-2">Strategic Decryption Hints</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Stuck on contradictory alibis? Request tactical decryption hints from the lab at a strategic penalty (-10 points per hint).
            </p>
          </div>
        </div>

        {/* Case Archive / Recent Incidents */}
        <div className="border-t border-slate-800/80 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xl font-mono font-bold tracking-wider text-slate-100">
                ACTIVE INCIDENT LOGS
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {recentCases.length} CASE{recentCases.length === 1 ? '' : 'S'} ARCHIVED
            </span>
          </div>

          {loading ? (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center font-mono text-sm text-slate-400 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>SYNCING CENTRAL ARCHIVE...</span>
            </div>
          ) : recentCases.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
              <Lock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-mono text-slate-400 mb-4">
                NO ACTIVE INCIDENT LOGS REGISTERED IN THIS SECTOR
              </p>
              <Link
                to="/create"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-mono hover:bg-cyan-900/60 transition-all"
              >
                <span>COMMISSION FIRST INCIDENT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentCases.map((c) => {
                const isInvestigating = c.status === 'investigating';
                const isSolved = c.status === 'solved';

                return (
                  <div
                    key={c._id}
                    className="p-5 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          isInvestigating 
                            ? 'bg-amber-950/60 border border-amber-500/40 text-amber-400' 
                            : isSolved 
                            ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400' 
                            : 'bg-rose-950/60 border border-rose-500/40 text-rose-400'
                        }`}>
                          {c.status}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          DIFF: {c.difficulty} | SCORE: {c.score}
                        </span>
                      </div>

                      <h4 className="text-base font-mono font-bold text-slate-100 mb-1.5 truncate">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                        {c.premise}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs font-mono">
                      <span className="text-slate-500">
                        {c.suspects?.length || 0} Suspects • {c.clues?.filter(cl => cl.discovered).length || 0}/{c.clues?.length || 0} Clues
                      </span>

                      <Link
                        to={isInvestigating ? `/case/${c._id}` : `/case/${c._id}/result`}
                        className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        <span>{isInvestigating ? 'RESUME HUD' : 'VIEW DEBRIEF'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
