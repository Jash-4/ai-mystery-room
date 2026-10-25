import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Award, 
  FileText, 
  Cpu, 
  RotateCcw,
  User,
  KeyRound,
  Search
} from 'lucide-react';
import { getCaseResult } from '../services/api';

export default function CaseResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        const data = await getCaseResult(id);
        if (data.success && data.case) {
          setCaseData(data.case);
        } else {
          setError(data.error || 'Failed to load case verdict.');
        }
      } catch (err) {
        console.error('Error fetching result:', err);
        setError(err.response?.data?.error || err.message || 'Error fetching result.');
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 font-mono text-cyan-400">
        <div className="flex flex-col items-center space-y-4">
          <Cpu className="w-10 h-10 animate-spin text-cyan-400" />
          <p className="text-sm tracking-widest animate-pulse">COMPILING DIGITAL FORENSIC VERDICT...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 font-mono">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 max-w-md text-center">
          <ShieldAlert className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-100 mb-2">VERDICT UNAVAILABLE</h2>
          <p className="text-xs text-slate-400 mb-6">{error || 'Incident verdict could not be computed.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            RETURN TO COMMAND CENTER
          </button>
        </div>
      </div>
    );
  }

  const isSolved = caseData.status === 'solved';
  const culprit = caseData.suspects?.find((s) => s.id === caseData.culpritId);
  const accusedSuspect = caseData.suspects?.find((s) => s.id === caseData.accusation?.accusedSuspectId);

  const cluesDiscovered = caseData.clues?.filter((c) => c.discovered).length || 0;
  const cluesBonus = cluesDiscovered * 5;
  const hintsUsed = caseData.hints?.filter((h) => h.used).length || 0;
  const hintsPenalty = hintsUsed * 10;

  const baseDifficultyPoints = {
    easy: 100,
    medium: 150,
    hard: 200,
  }[caseData.difficulty] || 150;

  const basePointsEarned = isSolved ? baseDifficultyPoints : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] cyber-grid scanline py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Verdict Status Banner */}
        <div className={`p-8 rounded-3xl border text-center backdrop-blur-xl transition-all ${
          isSolved
            ? 'bg-emerald-950/40 border-emerald-500/60 glow-emerald'
            : 'bg-rose-950/40 border-rose-500/60 glow-rose'
        }`}>
          <div className="inline-flex p-4 rounded-2xl bg-slate-950/80 mb-4 border border-slate-800">
            {isSolved ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            ) : (
              <XCircle className="w-12 h-12 text-rose-400" />
            )}
          </div>

          <span className={`text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3 inline-block ${
            isSolved
              ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950 border border-rose-500/40 text-rose-300'
          }`}>
            {isSolved ? 'CASE CLOSED // INDICTMENT VERIFIED' : 'INDICTMENT FAILED // SUSPECT ACQUITTED'}
          </span>

          <h1 className="text-3xl sm:text-5xl font-mono font-black text-slate-100 tracking-tight uppercase mb-2">
            {isSolved ? 'INCIDENT SOLVED' : 'FAILED DEDUCTION'}
          </h1>

          <p className="text-sm font-mono text-slate-300 max-w-lg mx-auto">
            {isSolved
              ? 'Your forensic analysis held under scrutiny. The perpetrator has been detained with conclusive evidence.'
              : 'The indicted party could not be definitively linked to the incident. The true culprit evaded immediate apprehension.'}
          </p>
        </div>

        {/* Suspect Comparison Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Accusation */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
              YOUR INDICTMENT:
            </span>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-mono font-bold text-slate-100">
                  {accusedSuspect?.name || 'Unknown Suspect'}
                </h3>
                <span className="text-xs font-mono text-cyan-400 block">
                  {accusedSuspect?.role}
                </span>
              </div>
            </div>
            {caseData.accusation?.reason && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-mono">
                <span className="text-slate-500 block text-[10px] uppercase mb-1">Deduction Notes:</span>
                "{caseData.accusation.reason}"
              </div>
            )}
          </div>

          {/* Canonical Culprit */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            <span className="text-[11px] font-mono uppercase text-cyan-400 block mb-2">
              TRUE CULPRIT:
            </span>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-mono font-bold text-slate-100">
                  {culprit?.name || 'Confidential Culprit'}
                </h3>
                <span className="text-xs font-mono text-cyan-400 block">
                  {culprit?.role}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-mono">
              <span className="text-slate-500 block text-[10px] uppercase mb-1">Alibi Status:</span>
              Collapsed under forensic scrutiny.
            </div>
          </div>
        </div>

        {/* Forensic Solution Breakdown */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center space-x-2 text-cyan-400 mb-4">
            <FileText className="w-5 h-5" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider">
              OFFICIAL FORENSIC INCIDENT DEBRIEF
            </h2>
          </div>
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed font-sans space-y-4">
            {caseData.solutionExplanation}
          </div>
        </div>

        {/* Score Breakdown Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md font-mono">
          <div className="flex items-center space-x-2 text-amber-400 mb-6">
            <Award className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              INVESTIGATOR RATING BREAKDOWN
            </h2>
          </div>

          <div className="space-y-3 text-xs border-b border-slate-800 pb-4 mb-4">
            <div className="flex justify-between items-center text-slate-300">
              <span>Difficulty Protocol Base ({caseData.difficulty.toUpperCase()}):</span>
              <span className={isSolved ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {basePointsEarned} PTS
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>Forensic Clues Discovered ({cluesDiscovered} x 5 pts):</span>
              </span>
              <span className="text-cyan-400 font-bold">
                +{cluesBonus} PTS
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Tactical Hints Requested ({hintsUsed} x 10 pts):</span>
              </span>
              <span className="text-rose-400 font-bold">
                -{hintsPenalty} PTS
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div>
              <span className="text-xs uppercase text-slate-400 block">FINAL RATING:</span>
              <span className="text-2xl sm:text-3xl font-black text-cyan-300">
                {caseData.score} <span className="text-sm text-cyan-500">PTS</span>
              </span>
            </div>

            <span className={`text-xs px-3 py-1 rounded-lg uppercase font-bold ${
              isSolved 
                ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
                : 'bg-rose-950 border border-rose-500/40 text-rose-400'
            }`}>
              {isSolved ? 'MERIT COMMENDATION' : 'DISCIPLINARY REVIEW'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <Link
            to="/"
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition-all"
          >
            ← COMMAND ARCHIVE
          </Link>

          <Link
            to="/create"
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold tracking-wider uppercase transition-all glow-cyan flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4 text-slate-950" />
            <span>COMMISSION ANOTHER INCIDENT</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
