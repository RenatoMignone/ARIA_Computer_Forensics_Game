import { useState, useEffect } from 'react';
import { useGame, SAVE_SCHEMA_VERSION } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SaveSlot, LeaderboardEntry } from '../types/game';
import { ArrowLeft, BrainCircuit, CheckCircle2, ClipboardList, Clock, FileSearch, FolderOpen, MessageSquareText, ShieldCheck, Trophy, X } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

export function DifficultyScreen() {
    const { dispatch } = useGame();
    const { playBootSequence } = useAudio();
    // Task 3.3: Timer prompt state
    const [pendingDifficulty, setPendingDifficulty] = useState<'standard' | 'hard' | 'expert' | null>(null);
    // Task 3.5: Last debrief snapshot
    const [lastDebrief, setLastDebrief] = useState<Record<string, unknown> | null>(null);
    const [viewingLastDebrief, setViewingLastDebrief] = useState(false);
    const [showHowToPlay, setShowHowToPlay] = useState(false);

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
                        <h3 className="text-lg font-mono font-bold text-cyan-400 mb-2 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Enable Investigation Timer?
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mb-5">
                            A countdown timer adds a speed bonus (+50 pts) if you submit before time runs out.
                        </p>
                        <div className="space-y-2 mb-4">
                            <button onClick={() => confirmDifficulty(45 * 60 * 1000)}
                                className="w-full py-2 rounded border border-cyan-700/50 bg-cyan-900/20 text-cyan-300 font-mono text-sm hover:bg-cyan-800/30 transition-colors">
                                <Clock className="inline w-4 h-4 mr-2 -mt-0.5" />
                                45 minutes
                            </button>
                            <button onClick={() => confirmDifficulty(30 * 60 * 1000)}
                                className="w-full py-2 rounded border border-amber-700/50 bg-amber-900/20 text-amber-300 font-mono text-sm hover:bg-amber-800/30 transition-colors">
                                <Clock className="inline w-4 h-4 mr-2 -mt-0.5" />
                                30 minutes
                            </button>
                            <button onClick={() => confirmDifficulty(null)}
                                className="w-full py-2 rounded border border-slate-700/50 bg-slate-800/30 text-slate-400 font-mono text-sm hover:bg-slate-700/30 transition-colors">
                                No Timer - Untimed Investigation
                            </button>
                        </div>
                        <button
                            onClick={() => setPendingDifficulty(null)}
                            className="text-[10px] text-slate-500 hover:text-slate-300 font-mono w-full text-center"
                        >
                            <ArrowLeft className="inline w-3 h-3 mr-1 -mt-0.5" />
                            Back
                        </button>
                    </motion.div>
                </div>
            )}

            {showHowToPlay && (
                <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="w-full max-w-lg overflow-hidden rounded-xl border border-[#263244] bg-[#0d1420] shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-[#1f2937] bg-[#111827] px-5 py-4">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">How to play</div>
                                <h3 className="mt-1 text-lg font-semibold text-white">Investigate, verify, report.</h3>
                            </div>
                            <button
                                onClick={() => setShowHowToPlay(false)}
                                className="rounded-md border border-slate-700 bg-slate-900/60 p-1.5 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-200 transition-colors"
                                aria-label="Close how to play"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="space-y-4 p-5 text-sm text-slate-300">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-lg border border-slate-800 bg-[#0a0e17] p-3">
                                    <FileSearch className="mb-2 h-4 w-4 text-cyan-300" aria-hidden="true" />
                                    <div className="font-semibold text-white">Inspect</div>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-400">Open each file and compare content, metadata, and timing.</p>
                                </div>
                                <div className="rounded-lg border border-slate-800 bg-[#0a0e17] p-3">
                                    <MessageSquareText className="mb-2 h-4 w-4 text-cyan-300" aria-hidden="true" />
                                    <div className="font-semibold text-white">Question</div>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-400">Ask ARIA for help, but treat every claim as unproven.</p>
                                </div>
                                <div className="rounded-lg border border-slate-800 bg-[#0a0e17] p-3">
                                    <CheckCircle2 className="mb-2 h-4 w-4 text-cyan-300" aria-hidden="true" />
                                    <div className="font-semibold text-white">Verify</div>
                                    <p className="mt-1 text-xs leading-relaxed text-slate-400">Validate claims and cross-references before submitting the report.</p>
                                </div>
                            </div>
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                                <div className="font-semibold text-amber-200">Win condition</div>
                                <p className="mt-1 leading-relaxed text-amber-100/80">
                                    Finish when you can explain whether the transfer was legitimate, which artifacts prove it, and where ARIA exaggerated or hallucinated.
                                </p>
                            </div>
                            <div className="rounded-lg border border-slate-700/70 bg-[#0a0e17] p-4">
                                <div className="font-semibold text-slate-100">Keep the workspace clear</div>
                                <p className="mt-1 leading-relaxed text-slate-400">
                                    Use the panel buttons to hide the Vault, Terminal, or ARIA Chat when you are not using them, so the evidence stays larger and easier to compare.
                                </p>
                            </div>
                        </div>
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
                className="fixed inset-0 z-50 bg-[#0a0e17] text-slate-200 flex flex-col items-center justify-start px-4 py-8 sm:px-8 sm:py-10 overflow-y-auto"
            >
                <div className="w-full max-w-5xl mb-8">
                    <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 text-cyan-300 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10">
                                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-[0.24em] font-semibold">ARIA</div>
                                    <div className="text-xs text-slate-500">AI-assisted evidence review</div>
                                </div>
                            </div>
                            <h1 className="text-3xl sm:text-5xl font-semibold text-white tracking-normal">
                                Open the TechCorp case.
                            </h1>
                            <p className="mt-4 text-base text-slate-400 leading-relaxed">
                                A suspicious EUR 2.3M transfer has been approved through a mix of email, voice, video, invoice, and network evidence. Verify what happened and catch ARIA when it overstates the facts.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowHowToPlay(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-[#0d1420] px-4 py-2 text-sm text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200 transition-colors"
                            title="How to Play"
                        >
                            <FileSearch className="h-4 w-4" aria-hidden="true" />
                            How to play
                        </button>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
                        <div className="rounded-xl border border-[#263244] bg-[#0d1420] shadow-2xl overflow-hidden">
                            <div className="border-b border-[#1f2937] bg-[#111827] px-5 py-4">
                                <h2 className="text-base font-semibold text-white">Choose your investigation style</h2>
                                <p className="mt-1 text-sm text-slate-400">Start with guidance, hide the training wheels, or take the case cold.</p>
                            </div>

                            <div className="p-5 space-y-3">
                                {lastDebrief && (
                                    <button
                                        onClick={() => setViewingLastDebrief(true)}
                                        className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-700/50 text-slate-400 hover:text-cyan-300 hover:border-cyan-700/50 text-xs transition-colors"
                                    >
                                        <ClipboardList className="w-3.5 h-3.5" />
                                        View Last Debrief
                                    </button>
                                )}

                                <button
                                    onClick={() => handleSelect('standard')}
                                    className="w-full text-left p-4 rounded-lg border border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-400/60 hover:bg-cyan-900/20 transition-colors group flex gap-4 items-start"
                                >
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30">
                                        <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-base font-semibold text-white group-hover:text-cyan-200">Guided</span>
                                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">Recommended</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">Claim text remains visible while you learn the case flow.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleSelect('hard')}
                                    className="w-full text-left p-4 rounded-lg border border-[#1f2937] hover:border-amber-500/50 hover:bg-amber-900/10 transition-colors group flex gap-4 items-start"
                                >
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 border border-amber-400/25">
                                        <BrainCircuit className="h-5 w-5 text-amber-300" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-base font-semibold text-white group-hover:text-amber-200">Analyst</span>
                                            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">1.25x score</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">Claim badges hide their text until validation, so ARIA's wording matters.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleSelect('expert')}
                                    className="w-full text-left p-4 rounded-lg border border-[#1f2937] hover:border-red-500/50 hover:bg-red-900/10 transition-colors group flex gap-4 items-start"
                                >
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-400/10 border border-red-400/25">
                                        <Trophy className="h-5 w-5 text-red-300" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-base font-semibold text-white group-hover:text-red-200">Independent</span>
                                            <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300">1.5x score</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">Hard mode plus no hint command. Best for a final assessment run.</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <aside className="rounded-xl border border-[#263244] bg-[#0d1420] shadow-2xl overflow-hidden">
                            <div className="border-b border-[#1f2937] bg-[#111827] px-5 py-4">
                                <h3 className="text-base font-semibold text-white">Case briefing</h3>
                                <p className="mt-1 text-sm text-slate-400">What you are walking into.</p>
                            </div>
                            <div className="p-5 space-y-4 text-sm text-slate-300">
                                <div>
                                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1">Objective</div>
                                    <p className="leading-relaxed">Build a defensible explanation of the transfer, then validate or reject ARIA's claims against raw evidence.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border border-slate-800 bg-[#0a0e17] p-3">
                                        <div className="text-xl font-semibold text-white">5</div>
                                        <div className="text-xs text-slate-500">Evidence files</div>
                                    </div>
                                    <div className="rounded-lg border border-slate-800 bg-[#0a0e17] p-3">
                                        <div className="text-xl font-semibold text-white">EUR 2.3M</div>
                                        <div className="text-xs text-slate-500">Transfer value</div>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-100">
                                    <div className="font-semibold text-amber-200 mb-1">Remember</div>
                                    <p className="text-xs leading-relaxed text-amber-100/80">ARIA can help, but every tagged claim must be checked before it counts.</p>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                        <div className="rounded-xl border border-[#263244] bg-[#0d1420] p-4">
                            <div className="mb-2 flex items-center gap-2 text-cyan-300">
                                <FileSearch className="h-4 w-4" aria-hidden="true" />
                                <h3 className="text-sm font-semibold text-white">Start with evidence</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-400">
                                Read the recovered files first. The case is solvable from the artifacts, not from ARIA alone.
                            </p>
                        </div>
                        <div className="rounded-xl border border-[#263244] bg-[#0d1420] p-4">
                            <div className="mb-2 flex items-center gap-2 text-cyan-300">
                                <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                                <h3 className="text-sm font-semibold text-white">Use ARIA carefully</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-400">
                                ARIA can summarize and connect clues, but its tagged claims only count after verification.
                            </p>
                        </div>
                        <div className="rounded-xl border border-[#263244] bg-[#0d1420] p-4">
                            <div className="mb-2 flex items-center gap-2 text-cyan-300">
                                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                                <h3 className="text-sm font-semibold text-white">Submit a report</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-400">
                                When the claims and links are checked, write the final report from the terminal.
                            </p>
                        </div>
                    </div>

                    {leaderboard.length > 0 && (
                        <div className="mt-5 rounded-xl border border-[#263244] bg-[#0d1420] px-6 py-5 text-center">
                            <h3 className="text-[10px] items-center justify-center flex gap-2 font-bold text-slate-500 uppercase tracking-widest mb-4 font-mono">
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

                    <div className="mt-5 rounded-xl border border-[#263244] bg-[#0d1420] p-5">
                        <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-4 text-center font-mono">Load Saved Investigation</h3>
                        
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
                            <div className="text-sm text-slate-500 text-center">
                                No saved investigations yet.
                            </div>
                        )}

                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
