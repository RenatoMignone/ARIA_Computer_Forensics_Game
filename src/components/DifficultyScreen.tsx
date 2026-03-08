import { useState, useEffect } from 'react';
import { useGame, SAVE_SCHEMA_VERSION } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SaveSlot, LeaderboardEntry } from '../types/game';
import { FolderOpen, Trophy } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

export function DifficultyScreen() {
    const { dispatch } = useGame();
    const { playBootSequence } = useAudio();
    const [resumeCode, setResumeCode] = useState('');
    const [resumeError, setResumeError] = useState<string | null>(null);
    const [scoreCode, setScoreCode] = useState('');
    const [scoreDecoded, setScoreDecoded] = useState<Record<string, unknown> | null>(null);
    const [scoreCodeError, setScoreCodeError] = useState<string | null>(null);
    // Task 3.3: Timer prompt state
    const [pendingDifficulty, setPendingDifficulty] = useState<'standard' | 'hard' | 'expert' | null>(null);
    // Task 3.5: Last debrief snapshot
    const [lastDebrief, setLastDebrief] = useState<Record<string, unknown> | null>(null);
    const [viewingLastDebrief, setViewingLastDebrief] = useState(false);

    const handleSelect = (diff: 'standard' | 'hard' | 'expert') => {
        setPendingDifficulty(diff); // open timer prompt
    };

    const confirmDifficulty = (timerMs: number | null) => {
        if (!pendingDifficulty) return;
        playBootSequence();
        dispatch({ type: 'SET_DIFFICULTY', difficulty: pendingDifficulty });
        if (timerMs !== null) {
            dispatch({ type: 'START_TIMER', durationMs: timerMs });
        }
        setPendingDifficulty(null);
    };

    const [saves, setSaves] = useState<SaveSlot[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const rawSaves = localStorage.getItem('aria_saves');
        if (rawSaves) {
            try {
                setSaves(JSON.parse(rawSaves));
            } catch {
                // ignore
            }
        }
        
        const rawLb = localStorage.getItem('aria_leaderboard');
        if (rawLb) {
            try {
                setLeaderboard(JSON.parse(rawLb));
            } catch {
                // ignore
            }
        }

        // Task 3.5: Load last debrief snapshot
        const rawDebrief = localStorage.getItem('aria_last_debrief');
        if (rawDebrief) {
            try {
                setLastDebrief(JSON.parse(rawDebrief));
            } catch {
                // ignore
            }
        }
    }, []);

    const handleLoadSave = (slot: SaveSlot) => {
        if (slot.gameState.SAVE_SCHEMA_VERSION !== SAVE_SCHEMA_VERSION) {
            alert(
                `This save file was created with an older version of ARIA (schema v${slot.gameState.SAVE_SCHEMA_VERSION ?? 0}) and cannot be loaded. Please start a new investigation.`
            );
            return;
        }
        playBootSequence();
        dispatch({
            type: 'LOAD_GAME_STATE',
            state: {
                ...slot.gameState,
                difficulty: slot.gameState.difficulty as any,
                phase: 'investigation',
                tutorialSeen: true,
                glossaryOpen: false,
                lastScoreDelta: null
            }
        });
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const handleResume = () => {
        try {
            const parsed = JSON.parse(atob(resumeCode));
            if (parsed.SAVE_SCHEMA_VERSION !== SAVE_SCHEMA_VERSION) {
                setResumeError(
                    `This save code was created with an older version of ARIA (schema v${parsed.SAVE_SCHEMA_VERSION ?? 0}) and cannot be loaded. Please start a new investigation.`
                );
                return;
            }
            playBootSequence();
            dispatch({ type: 'LOAD_GAME_STATE', state: parsed });
        } catch {
            setResumeError('Invalid save code. Start a new investigation instead.');
        }
    };

    const handleDecodeScore = () => {
        try {
            const data = JSON.parse(atob(scoreCode));
            if (!data.type || data.type !== 'score_share') throw new Error('Not a score share code');
            setScoreDecoded(data);
            setScoreCodeError(null);
        } catch {
            setScoreDecoded(null);
            setScoreCodeError('Invalid score code. Make sure you copied it correctly from the Debrief screen.');
        }
    };

    return (
        <AnimatePresence>
            {/* Task 3.3: Timer prompt modal */}
            {pendingDifficulty && (
                <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0d1420] border border-[#1f2937] rounded-xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <h3 className="text-lg font-mono font-bold text-cyan-400 mb-2">⏱️ Enable Investigation Timer?</h3>
                        <p className="text-xs text-slate-400 font-mono mb-5">
                            A countdown timer adds a speed bonus (+50 pts) if you submit before time runs out.
                        </p>
                        <div className="space-y-2 mb-4">
                            <button onClick={() => confirmDifficulty(45 * 60 * 1000)}
                                className="w-full py-2 rounded border border-cyan-700/50 bg-cyan-900/20 text-cyan-300 font-mono text-sm hover:bg-cyan-800/30 transition-colors">
                                ⏱ 45 minutes
                            </button>
                            <button onClick={() => confirmDifficulty(30 * 60 * 1000)}
                                className="w-full py-2 rounded border border-amber-700/50 bg-amber-900/20 text-amber-300 font-mono text-sm hover:bg-amber-800/30 transition-colors">
                                ⏱ 30 minutes
                            </button>
                            <button onClick={() => confirmDifficulty(null)}
                                className="w-full py-2 rounded border border-slate-700/50 bg-slate-800/30 text-slate-400 font-mono text-sm hover:bg-slate-700/30 transition-colors">
                                No Timer — Untimed Investigation
                            </button>
                        </div>
                        <button
                            onClick={() => setPendingDifficulty(null)}
                            className="text-[10px] text-slate-500 hover:text-slate-300 font-mono w-full text-center"
                        >
                            ← Back
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Task 3.5: View Last Debrief overlay */}
            {viewingLastDebrief && lastDebrief && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0d1420] border border-[#1f2937] rounded-xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="text-center mb-6">
                            <div className="text-3xl mb-2">{String(lastDebrief.tierEmoji)}</div>
                            <h3 className="text-xl font-mono font-bold text-white">{String(lastDebrief.tier)}</h3>
                            <div className="text-3xl font-mono font-bold text-cyan-400 mt-1">{String(lastDebrief.finalScore)} <span className="text-sm text-slate-500">pts</span></div>
                            <div className="text-xs text-slate-500 font-mono mt-1">{String(lastDebrief.difficulty).toUpperCase()} • {new Date(String(lastDebrief.date)).toLocaleDateString()}</div>
                        </div>
                        <div className="bg-[#111827] rounded-lg p-4 font-mono text-xs grid grid-cols-2 gap-2 mb-4">
                            <span className="text-slate-500">Hallucinations:</span>
                            <span className="text-white">{String(lastDebrief.halluFound)}/{String(lastDebrief.halluTotal)}</span>
                            <span className="text-slate-500">Connections:</span>
                            <span className="text-white">{String(lastDebrief.connectionsFound)}</span>
                            <span className="text-slate-500">Calibration:</span>
                            <span className="text-white">{String(lastDebrief.calibrationRating)}</span>
                            <span className="text-slate-500">Speed Bonus:</span>
                            <span className={lastDebrief.speedBonusEarned ? 'text-emerald-400' : 'text-slate-500'}>{lastDebrief.speedBonusEarned ? '+50 earned' : 'Not earned'}</span>
                        </div>
                        <button
                            onClick={() => setViewingLastDebrief(false)}
                            className="w-full py-2 rounded border border-slate-700/50 text-slate-400 hover:text-white font-mono text-sm transition-colors"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-[#0a0e17] text-slate-300 font-mono flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto"
            >
                <div className="w-full max-w-2xl bg-[#0d1420] border border-[#1f2937] rounded-xl shadow-2xl overflow-hidden mt-8 mb-8">
                    <div className="bg-[#111827] border-b border-[#1f2937] p-4 flex items-center justify-between relative">
                        <h2 className="text-lg text-cyan-400 font-bold uppercase tracking-widest w-full text-center">Select Investigation Difficulty</h2>
                        <button
                            onClick={() => dispatch({ type: 'TOGGLE_GLOSSARY' })}
                            className="absolute right-4 w-6 h-6 flex items-center justify-center rounded-full border border-[#475569] text-[#475569] hover:text-cyan-400 hover:border-cyan-400 transition-colors text-xs font-bold"
                            title="How to Play"
                        >
                            ?
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        {/* Task 3.5: View Last Debrief button */}
                        {lastDebrief && (
                            <div className="flex justify-center mb-2">
                                <button
                                    onClick={() => setViewingLastDebrief(true)}
                                    className="flex items-center gap-2 px-4 py-1.5 rounded border border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-700/50 font-mono text-[11px] transition-colors"
                                >
                                    📋 View Last Debrief
                                </button>
                            </div>
                        )}
                        {/* Standard */}
                        <button
                            onClick={() => handleSelect('standard')}
                            className="w-full text-left p-4 rounded-lg border border-[#1f2937] hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-colors group flex gap-4 items-start"
                        >
                            <div className="w-36 shrink-0 text-slate-300 font-bold tracking-[0.2em] mt-0.5 group-hover:text-cyan-400 break-keep whitespace-nowrap">[ STANDARD ]</div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-400">Claim text visible on all pending badges.</p>
                                <p className="text-xs text-emerald-400/70 mt-1">Recommended for first-time players.</p>
                            </div>
                        </button>

                        {/* Hard */}
                        <button
                            onClick={() => handleSelect('hard')}
                            className="w-full text-left p-4 rounded-lg border border-[#1f2937] hover:border-amber-500/50 hover:bg-amber-900/10 transition-colors group flex gap-4 items-start"
                        >
                            <div className="w-36 shrink-0 text-amber-500 font-bold tracking-[0.2em] mt-0.5 group-hover:text-amber-400 break-keep whitespace-nowrap">[ HARD ]</div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-400">Claim text hidden on badges until after validation. You must read ARIA's full response to understand each claim before judging it.</p>
                                <p className="text-xs text-amber-500 mt-1">1.25x Score Multiplier</p>
                            </div>
                        </button>

                        {/* Expert */}
                        <button
                            onClick={() => handleSelect('expert')}
                            className="w-full text-left p-4 rounded-lg border border-[#1f2937] hover:border-red-500/50 hover:bg-red-900/10 transition-colors group flex gap-4 items-start"
                        >
                            <div className="w-36 shrink-0 text-red-500 font-bold tracking-[0.2em] mt-0.5 group-hover:text-red-400 break-keep whitespace-nowrap">[ EXPERT ]</div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-400">Hard mode + no hint command. No confidence auto-confirm timer.</p>
                                <p className="text-xs text-red-400 mt-1">Recommended for assessment • 1.5x Score Multiplier</p>
                            </div>
                        </button>
                    </div>

                    {leaderboard.length > 0 && (
                        <div className="px-6 pb-6 text-center">
                            <h3 className="text-[10px] items-center justify-center flex gap-2 font-bold text-slate-500 uppercase tracking-widest mb-4">
                                <Trophy className="w-3 h-3 text-amber-500" />
                                Your Best Scores
                            </h3>
                            <div className="flex flex-wrap justify-center gap-3 mb-3">
                                {leaderboard.slice(0, 3).map((entry, idx) => (
                                    <div key={entry.id} className={`flex items-center gap-3 px-4 py-2 rounded border shadow-sm
                                        ${idx === 0 ? 'bg-amber-900/20 border-amber-500/30 shadow-amber-900/20' : 
                                          idx === 1 ? 'bg-slate-800 border-slate-600 shadow-slate-900/20' : 
                                          'bg-amber-900/10 border-amber-900/50 shadow-amber-900/10'}
                                    `}>
                                        <div className="text-xl leading-none">{entry.tierEmoji}</div>
                                        <div className="text-left leading-tight">
                                            <div className={`text-xs font-bold font-mono ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : 'text-amber-700'}`}>
                                                {entry.finalScore} PTS
                                            </div>
                                            <div className="text-[9px] uppercase font-mono text-slate-500 mt-0.5">
                                                {entry.difficulty}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono italic">
                                Personal best: <strong className="text-amber-400">{leaderboard[0].finalScore}</strong> points on <strong>{leaderboard[0].difficulty.toUpperCase()}</strong> difficulty.
                            </div>
                        </div>
                    )}

                    <div className="bg-[#111827] border-t border-[#1f2937] p-6">
                        <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-4 text-center">Load Saved Investigation</h3>
                        
                        {saves.length > 0 && (
                            <div className="space-y-3 max-h-48 overflow-y-auto px-2 custom-scrollbar mb-6">
                                {saves.map((slot) => (
                                    <div key={slot.id} className="bg-[#0d1420] border border-[#1f2937] rounded-lg p-3 flex items-center justify-between group hover:border-[#334155] transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                                                <span className="font-mono text-sm font-bold text-slate-200">{slot.name}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase ${
                                                    slot.difficulty === 'expert' ? 'bg-red-900/30 text-red-400 border-red-800/50' :
                                                    slot.difficulty === 'hard' ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' :
                                                    'bg-slate-800 text-slate-400 border-slate-700'
                                                }`}>
                                                    {slot.difficulty}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-mono text-[#64748b]">
                                                <span>Score: <span className="text-white">{slot.score}</span></span>
                                                <span>Claims: <span className="text-white">{slot.claimsValidated}/{slot.totalClaims}</span></span>
                                                <span>{formatDate(slot.timestamp)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleLoadSave(slot)}
                                            className="px-4 py-1.5 bg-cyan-900/30 border border-cyan-800/50 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-300 rounded text-xs font-mono font-bold transition-colors"
                                        >
                                            Load
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {saves.length === 0 && (
                            <div className="text-xs text-slate-500 italic text-center mb-6 font-mono">
                                No saved games found. Use the save button during an investigation.
                            </div>
                        )}

                        <div className="border-t border-[#1f2937] pt-6 text-center">
                            <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-3">Or Paste Save Code</h3>
                        <div className="flex gap-2 max-w-sm mx-auto">
                            <input
                                type="text"
                                placeholder="Paste save code here..."
                                value={resumeCode}
                                onChange={(e) => {
                                    setResumeCode(e.target.value);
                                    if (resumeError) setResumeError(null);
                                }}
                                className="flex-1 bg-[#0a0e17] border border-[#1f2937] rounded px-3 py-2 text-xs font-mono text-slate-300 placeholder-[#374151] focus:outline-none focus:border-cyan-400/50"
                            />
                            <button
                                onClick={handleResume}
                                disabled={!resumeCode.trim()}
                                className="px-4 py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 rounded text-xs hover:bg-cyan-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Load
                            </button>
                        </div>
                        {resumeError && (
                            <div className="mt-2 text-[10px] text-red-400 max-w-sm mx-auto">
                                ⚠️ {resumeError}
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Task 8 — Score code paste */}
                    <div className="border-t border-[#1f2937] pt-6 text-center">
                        <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-3">View a Classmate's Score</h3>
                        <div className="flex gap-2 max-w-sm mx-auto">
                            <input
                                type="text"
                                placeholder="Paste score code here..."
                                value={scoreCode}
                                onChange={(e) => {
                                    setScoreCode(e.target.value);
                                    setScoreDecoded(null);
                                    if (scoreCodeError) setScoreCodeError(null);
                                }}
                                className="flex-1 bg-[#0a0e17] border border-[#1f2937] rounded px-3 py-2 text-xs font-mono text-slate-300 placeholder-[#374151] focus:outline-none focus:border-cyan-400/50"
                            />
                            <button
                                onClick={handleDecodeScore}
                                disabled={!scoreCode.trim()}
                                className="px-4 py-2 bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 rounded text-xs hover:bg-cyan-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                View
                            </button>
                        </div>
                        {scoreCodeError && (
                            <div className="mt-2 text-[10px] text-red-400 max-w-sm mx-auto">⚠️ {scoreCodeError}</div>
                        )}
                        {scoreDecoded && (
                            <div className="mt-3 max-w-sm mx-auto bg-[#0a0e17] border border-[#1f2937] rounded-lg p-3 text-left text-xs font-mono text-slate-300">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Score Summary</div>
                                <div className="grid grid-cols-2 gap-1">
                                    <span className="text-slate-500">Score:</span>
                                    <span className="text-cyan-400 font-bold">{String(scoreDecoded.finalScore)} pts</span>
                                    <span className="text-slate-500">Difficulty:</span>
                                    <span className="text-white uppercase">{String(scoreDecoded.difficulty)}</span>
                                    <span className="text-slate-500">Tier:</span>
                                    <span className="text-white">{String(scoreDecoded.tier)}</span>
                                    <span className="text-slate-500">Hallucinations found:</span>
                                    <span className="text-white">{String(scoreDecoded.halluFound)}/{String(scoreDecoded.halluTotal)}</span>
                                    <span className="text-slate-500">Mode:</span>
                                    <span className="text-white">{String(scoreDecoded.mode)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
