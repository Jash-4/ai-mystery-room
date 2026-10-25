import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  KeyRound, 
  Gavel, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  User, 
  FileText, 
  X
} from 'lucide-react';
import { getCase, discoverClue, requestHint, submitAccusation } from '../services/api';

export default function InvestigationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mysteryCase, setMysteryCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clue discovery in-progress state
  const [discoveringClueId, setDiscoveringClueId] = useState(null);

  // Hint requesting state
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [hintConfirmModal, setHintConfirmModal] = useState(false);

  // Accusation modal state
  const [showAccuseModal, setShowAccuseModal] = useState(false);
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [accuseReason, setAccuseReason] = useState('');
  const [isSubmittingAccuse, setIsSubmittingAccuse] = useState(false);
  const [accuseError, setAccuseError] = useState(null);

  // Suspect tagging filter / note
  const [suspectTags, setSuspectTags] = useState({});

  useEffect(() => {
    async function loadCase() {
      try {
        setLoading(true);
        const data = await getCase(id);
        if (data.success && data.case) {
          // If already concluded, redirect to results view
          if (data.case.status !== 'investigating') {
            navigate(`/case/${id}/result`);
            return;
          }
          setMysteryCase(data.case);
        } else {
          setError(data.error || 'Failed to load incident.');
        }
      } catch (err) {
        console.error('Error fetching case:', err);
        setError(err.response?.data?.error || err.message || 'Error loading incident.');
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [id, navigate]);

  // Handle clue discovery
  const handleDiscoverClue = async (clueId) => {
    if (discoveringClueId) return;
    try {
      setDiscoveringClueId(clueId);
      const res = await discoverClue(id, clueId);
      if (res.success) {
        setMysteryCase((prev) => ({
          ...prev,
          score: res.score,
          clues: prev.clues.map((c) =>
            c.id === clueId ? { ...c, discovered: true } : c
          ),
        }));
      }
    } catch (err) {
      console.error('Error discovering clue:', err);
      alert('Could not analyze clue: ' + (err.response?.data?.error || err.message));
    } finally {
      setDiscoveringClueId(null);
    }
  };

  // Handle hint unlock
  const handleRequestHint = async () => {
    try {
      setIsRequestingHint(true);
      const res = await requestHint(id);
      if (res.success) {
        setMysteryCase((prev) => ({
          ...prev,
          score: res.score,
          hints: prev.hints.map((h) =>
            h.id === res.hint.id ? { ...h, used: true, text: res.hint.text } : h
          ),
        }));
        setHintConfirmModal(false);
      }
    } catch (err) {
      console.error('Error unlocking hint:', err);
      alert('Hint request failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsRequestingHint(false);
    }
  };

  // Handle accusation submission
  const handleAccuseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSuspectId) {
      setAccuseError('Please select the primary suspect for indictment.');
      return;
    }

    try {
      setIsSubmittingAccuse(true);
      setAccuseError(null);
      const res = await submitAccusation(id, selectedSuspectId, accuseReason);
      if (res.success) {
        navigate(`/case/${id}/result`);
      } else {
        throw new Error(res.error || 'Indictment evaluation failed.');
      }
    } catch (err) {
      console.error('Error submitting accusation:', err);
      setAccuseError(err.response?.data?.error || err.message || 'Error submitting indictment.');
      setIsSubmittingAccuse(false);
    }
  };

  const toggleSuspectTag = (suspectId, tag) => {
    setSuspectTags((prev) => ({
      ...prev,
      [suspectId]: prev[suspectId] === tag ? null : tag,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 font-mono text-cyan-400">
        <div className="flex flex-col items-center space-y-4">
          <Cpu className="w-10 h-10 animate-spin text-cyan-400" />
          <p className="text-sm tracking-widest animate-pulse">ESTABLISHING SECURE HUD TELEMETRY...</p>
        </div>
      </div>
    );
  }

  if (error || !mysteryCase) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 font-mono">
        <div className="p-8 rounded-2xl bg-rose-950/60 border border-rose-500/40 max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-100 mb-2">INCIDENT NOT FOUND</h2>
          <p className="text-xs text-rose-300 mb-6">{error || 'This incident does not exist in local registry.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-rose-500 text-slate-950 font-bold text-xs"
          >
            RETURN TO COMMAND CENTER
          </button>
        </div>
      </div>
    );
  }

  const discoveredCluesCount = mysteryCase.clues.filter((c) => c.discovered).length;
  const remainingHintsCount = mysteryCase.hints.filter((h) => !h.used).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] cyber-grid scanline pb-20">
      
      {/* HUD Header */}
      <div className="sticky top-16 z-40 bg-slate-950/90 border-b border-cyan-500/30 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <span className="p-1.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono text-xs">
              CASE #{mysteryCase._id.slice(-6).toUpperCase()}
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-mono font-black text-slate-100 tracking-wide truncate max-w-md">
                {mysteryCase.title}
              </h1>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                <span className="uppercase text-cyan-400 font-semibold">{mysteryCase.difficulty} PROTOCOL</span>
                <span>•</span>
                <span>EVIDENCE: {discoveredCluesCount}/{mysteryCase.clues.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Score Counter */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-right">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">CURRENT RATING</span>
                <span className="text-lg font-mono font-black text-cyan-300">
                  {mysteryCase.score} <span className="text-xs text-cyan-500">PTS</span>
                </span>
              </div>
            </div>

            {/* Indictment Button */}
            <button
              onClick={() => setShowAccuseModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center space-x-2 glow-rose transition-all transform hover:-translate-y-0.5"
            >
              <Gavel className="w-4 h-4" />
              <span>SUBMIT INDICTMENT</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Incident Dossier Box */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-md">
          <div className="flex items-center space-x-2 mb-2 text-cyan-400">
            <FileText className="w-4 h-4" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider">
              INCIDENT BRIEF & PREMISE
            </h2>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {mysteryCase.premise}
          </p>
        </div>

        {/* Suspects Dossier Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
                PERSONS OF INTEREST ({mysteryCase.suspects.length})
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              TAG SUSPECTS TO ORGANIZE INVESTIGATION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mysteryCase.suspects.map((suspect) => {
              const currentTag = suspectTags[suspect.id];

              return (
                <div
                  key={suspect.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    currentTag === 'prime'
                      ? 'bg-rose-950/40 border-rose-500/80 glow-rose'
                      : currentTag === 'cleared'
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-mono font-bold text-slate-100">
                          {suspect.name}
                        </h3>
                        <span className="text-xs font-mono text-cyan-400 block">
                          {suspect.role}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {suspect.id}
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
                      {suspect.bio}
                    </p>

                    {/* Alibi & Motive */}
                    <div className="space-y-2 text-xs font-mono mb-4 pt-3 border-t border-slate-800/80">
                      <div>
                        <span className="text-amber-400 font-bold block text-[11px] uppercase">
                          Claimed Alibi:
                        </span>
                        <span className="text-slate-300 font-sans text-xs">
                          {suspect.alibi}
                        </span>
                      </div>
                      <div>
                        <span className="text-rose-400 font-bold block text-[11px] uppercase">
                          Motive / Pressure:
                        </span>
                        <span className="text-slate-300 font-sans text-xs">
                          {suspect.motive}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Suspect Tag Controls */}
                  <div className="flex items-center space-x-2 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => toggleSuspectTag(suspect.id, 'prime')}
                      className={`px-2 py-1 rounded transition-all ${
                        currentTag === 'prime'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800'
                      }`}
                    >
                      PRIME SUSPECT
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSuspectTag(suspect.id, 'cleared')}
                      className={`px-2 py-1 rounded transition-all ${
                        currentTag === 'cleared'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-950 hover:bg-emerald-950/60 text-slate-400 hover:text-emerald-300 border border-slate-800'
                      }`}
                    >
                      ALIBI VERIFIED
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clue Discovery Terminal */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
                FORENSIC EVIDENCE & ARTIFACTS ({discoveredCluesCount}/{mysteryCase.clues.length} REVEALED)
              </h2>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              DISCOVERING EVIDENCE AWARDS +5 PTS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mysteryCase.clues.map((clue) => {
              const isDiscovered = clue.discovered;
              const isAnalyzing = discoveringClueId === clue.id;

              return (
                <div
                  key={clue.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isDiscovered
                      ? 'bg-slate-900/80 border-cyan-500/50 glow-cyan'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {clue.id}
                      </span>
                      {isDiscovered ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ANALYZED (+5 PTS)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-amber-400">
                          <Lock className="w-3.5 h-3.5" />
                          <span>ENCRYPTED</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-mono font-bold text-slate-100 mb-2">
                      {clue.title}
                    </h4>

                    {isDiscovered ? (
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {clue.description}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic font-mono">
                        Evidence payload corrupted or encrypted. Click below to run forensics extraction.
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/80">
                    {isDiscovered ? (
                      <div className="text-[10px] font-mono text-cyan-400">
                        ✓ SECURE EVIDENCE LOGGED
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isAnalyzing}
                        onClick={() => handleDiscoverClue(clue.id)}
                        className="w-full py-2 px-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5"
                      >
                        {isAnalyzing ? (
                          <>
                            <Cpu className="w-3.5 h-3.5 animate-spin" />
                            <span>DECRYPTING EVIDENCE...</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>ANALYZE ARTIFACT (+5 PTS)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decryption Hint Drawer */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-100">
                TACTICAL DECRYPTION HINTS
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-400">
                {remainingHintsCount} REMAINING
              </span>
            </div>

            {remainingHintsCount > 0 ? (
              <button
                type="button"
                onClick={() => setHintConfirmModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all flex items-center space-x-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>REQUEST HINT (-10 PTS)</span>
              </button>
            ) : (
              <span className="text-xs font-mono text-slate-500">
                ALL HINTS HAVE BEEN DECRYPTED
              </span>
            )}
          </div>

          <div className="space-y-3">
            {mysteryCase.hints.map((hint, idx) => (
              <div
                key={hint.id || idx}
                className={`p-4 rounded-xl border transition-all ${
                  hint.used
                    ? 'bg-amber-950/20 border-amber-500/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-xs font-mono">
                  <span className={hint.used ? 'text-amber-400 font-bold' : 'text-slate-600'}>
                    HINT #{idx + 1}
                  </span>
                  <span className="text-[10px] uppercase">
                    {hint.used ? 'DECRYPTED (-10 PTS)' : 'LOCKED'}
                  </span>
                </div>

                {hint.used ? (
                  <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                    {hint.text}
                  </p>
                ) : (
                  <p className="text-xs font-mono italic">
                    Classified intelligence. Unlock to narrow down timelines and motives.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Hint Penalty */}
      {hintConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 text-center font-mono">
            <KeyRound className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-100 uppercase mb-2">
              CONFIRM HINT DECRYPTION
            </h3>
            <p className="text-xs text-slate-300 font-sans mb-6">
              Requesting tactical guidance will impose an immediate 
              <span className="text-amber-400 font-bold"> -10 point penalty</span> on your case rating.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setHintConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isRequestingHint}
                onClick={handleRequestHint}
                className="px-5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 flex items-center space-x-1"
              >
                {isRequestingHint ? <span>DECRYPTING...</span> : <span>UNLOCK (-10 PTS)</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accusation / Indictment Modal */}
      {showAccuseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-2xl w-full p-6 sm:p-8 font-mono glow-rose">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-rose-400">
                <Gavel className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-bold uppercase text-slate-100">
                  FORMAL INDICTMENT SUBMISSION
                </h3>
              </div>
              <button
                onClick={() => setShowAccuseModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {accuseError && (
              <div className="p-3 mb-4 rounded-lg bg-rose-950 border border-rose-500 text-rose-300 text-xs">
                {accuseError}
              </div>
            )}

            <form onSubmit={handleAccuseSubmit} className="space-y-6">
              
              {/* Suspect Radio Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-3">
                  1. SELECT PRIME CULPRIT:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {mysteryCase.suspects.map((suspect) => (
                    <label
                      key={suspect.id}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                        selectedSuspectId === suspect.id
                          ? 'bg-rose-950/50 border-rose-500 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accusedSuspect"
                        value={suspect.id}
                        checked={selectedSuspectId === suspect.id}
                        onChange={(e) => setSelectedSuspectId(e.target.value)}
                        className="mt-1 text-rose-500 focus:ring-rose-500"
                      />
                      <div>
                        <span className="text-xs font-bold block text-slate-100">
                          {suspect.name}
                        </span>
                        <span className="text-[11px] text-cyan-400 block">
                          {suspect.role}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deduction Reasoning */}
              <div>
                <label 
                  htmlFor="reason"
                  className="block text-xs font-bold uppercase text-slate-300 mb-2"
                >
                  2. STATE FORENSIC REASONING & EVIDENCE:
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  value={accuseReason}
                  onChange={(e) => setAccuseReason(e.target.value)}
                  placeholder="Explain how the clues disprove their alibi or establish motive..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none"
                />
              </div>

              {/* Warning Notice */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-sans leading-relaxed">
                <span className="font-bold font-mono uppercase">WARNING:</span> This action is final. Submitting an indictment concludes the investigation, verifies your deduction against the server's sealed verdict, and reveals the full solution narrative.
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAccuseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  RETURN TO HUD
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAccuse}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider glow-rose transition-all disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSubmittingAccuse ? (
                    <>
                      <Cpu className="w-3.5 h-3.5 animate-spin" />
                      <span>EVALUATING INDICTMENT...</span>
                    </>
                  ) : (
                    <>
                      <Gavel className="w-3.5 h-3.5" />
                      <span>SEAL & INDICT</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
