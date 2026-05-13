import { useState, useEffect } from 'react';
import { useGame, SAVE_SCHEMA_VERSION } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SaveSlot, LeaderboardEntry } from '../types/game';
import { ArrowLeft, BrainCircuit, CheckCircle2, Clock, FileSearch, MessageSquareText, Play, Trophy, X } from 'lucide-react';
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
    const [menuView, setMenuView] = useState<'main' | 'start' | 'load'>('main');

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

    const difficultyOptions = [
        {
            id: 'standard' as const,
            title: 'Guided Run',
            label: 'Recommended first case',
            description: 'Claim text remains visible while you learn the investigation flow.',
            icon: CheckCircle2,
            accent: 'cyan',
            meta: 'Best for the first playthrough',
        },
        {
            id: 'hard' as const,
            title: 'Challenge Run',
            label: '1.25x score',
            description: "Claim badges hide their text until validation, so ARIA's exact wording matters.",
            icon: BrainCircuit,
            accent: 'amber',
            meta: 'Less guidance, better score',
        },
        {
            id: 'expert' as const,
            title: 'Final Exam',
            label: '1.5x score',
            description: 'Hard mode plus no hint command. Best for a final assessment run.',
            icon: Trophy,
            accent: 'red',
            meta: 'No hints',
        },
    ];

    return (
        <AnimatePresence>
            {/* Task 3.3: Timer prompt modal */}
            {pendingDifficulty && (
                <div className="timer-menu-overlay fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="timer-menu-panel"
                    >
                        <h2>Choose Timer</h2>
                        <p className="timer-menu-copy">
                            Add a countdown for a +50 speed bonus, or play without time pressure.
                        </p>
                        <div className="timer-option-list">
                            <button
                                onClick={() => confirmDifficulty(45 * 60 * 1000)}
                                className="difficulty-option difficulty-option-cyan group"
                            >
                                <span className="difficulty-option-icon">
                                    <Clock className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="difficulty-option-title">45 Minutes</span>
                                        <span className="difficulty-pill">Relaxed</span>
                                    </div>
                                    <p>Enough time to inspect every file carefully.</p>
                                </div>
                                <Play className="h-4 w-4 shrink-0 text-white/60 transition-colors group-hover:text-white" aria-hidden="true" />
                            </button>
                            <button
                                onClick={() => confirmDifficulty(30 * 60 * 1000)}
                                className="difficulty-option difficulty-option-amber group"
                            >
                                <span className="difficulty-option-icon">
                                    <Clock className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="difficulty-option-title">30 Minutes</span>
                                        <span className="difficulty-pill">Fast run</span>
                                    </div>
                                    <p>A tighter challenge for repeat investigations.</p>
                                </div>
                                <Play className="h-4 w-4 shrink-0 text-white/60 transition-colors group-hover:text-white" aria-hidden="true" />
                            </button>
                            <button
                                onClick={() => confirmDifficulty(null)}
                                className="difficulty-option difficulty-option-green group"
                            >
                                <span className="difficulty-option-icon">
                                    <X className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="difficulty-option-title">No Timer</span>
                                        <span className="difficulty-pill">Story mode</span>
                                    </div>
                                    <p>Play the case at your own pace.</p>
                                </div>
                                <Play className="h-4 w-4 shrink-0 text-white/60 transition-colors group-hover:text-white" aria-hidden="true" />
                            </button>
                        </div>
                        <button
                            onClick={() => setPendingDifficulty(null)}
                            className="difficulty-back timer-menu-back"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
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
                className="difficulty-menu fixed inset-0 z-50 overflow-y-auto text-white"
            >
                <div className="difficulty-shell mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 py-5 sm:px-8">
                    <header className="difficulty-topbar">
                        <button
                            onClick={() => setShowHowToPlay(true)}
                            className="difficulty-utility"
                            title="How to Play"
                        >
                            <FileSearch className="h-4 w-4" aria-hidden="true" />
                            How to play
                        </button>
                    </header>

                    <main className="difficulty-stage" aria-labelledby="main-menu-title">
                        <section className="difficulty-hero">
                            <img src="/aria-logo.png" alt="" className="difficulty-logo" />
                            <h1 id="main-menu-title">ARIA</h1>
                            <p>AI-assisted evidence review</p>
                        </section>

                        <section className="difficulty-play" aria-label="Main menu">
                            {menuView === 'main' && (
                                <div className="difficulty-main-list">
                                    <button onClick={() => setMenuView('start')} className="difficulty-menu-choice difficulty-menu-choice-primary">
                                        Start Game
                                    </button>
                                    <button
                                        onClick={() => setMenuView('load')}
                                        className="difficulty-menu-choice"
                                        disabled={saves.length === 0}
                                    >
                                        Continue
                                    </button>
                                    <button onClick={() => setShowHowToPlay(true)} className="difficulty-menu-choice">
                                        How to Play
                                    </button>
                                    {lastDebrief && (
                                        <button onClick={() => setViewingLastDebrief(true)} className="difficulty-menu-choice">
                                            Last Debrief
                                        </button>
                                    )}
                                </div>
                            )}

                            {menuView === 'start' && (
                                <div>
                                    <button onClick={() => setMenuView('main')} className="difficulty-back">
                                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                        Back
                                    </button>
                                    <h2>Select Mode</h2>
                                    <div className="grid gap-2">
                                        {difficultyOptions.map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleSelect(option.id)}
                                                    className={`difficulty-option difficulty-option-${option.accent} group`}
                                                >
                                                    <span className="difficulty-option-icon">
                                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="difficulty-option-title">{option.title}</span>
                                                            <span className="difficulty-pill">{option.label}</span>
                                                        </div>
                                                        <p>{option.description}</p>
                                                    </div>
                                                    <Play className="h-4 w-4 shrink-0 text-white/60 transition-colors group-hover:text-white" aria-hidden="true" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="difficulty-note">
                                        <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                                        <span>Case 01: TechCorp Transfer</span>
                                    </div>
                                </div>
                            )}

                            {menuView === 'load' && (
                                <div>
                                    <button onClick={() => setMenuView('main')} className="difficulty-back">
                                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                        Back
                                    </button>
                                    <h2>Continue</h2>
                                    {saves.length > 0 ? (
                                        <div className="difficulty-save-list custom-scrollbar">
                                            {saves.map((slot) => (
                                                <button key={slot.id} onClick={() => handleLoadSave(slot)} className="difficulty-save">
                                                    <span className="truncate font-semibold text-white">{slot.name}</span>
                                                    <small>{slot.difficulty} // {formatDate(slot.timestamp)}</small>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-white/55">No saved investigations yet.</span>
                                    )}
                                </div>
                            )}
                        </section>
                    </main>

                    <footer className="difficulty-footer">
                        {leaderboard.length > 0 && (
                            <div className="difficulty-scores">
                                <div className="difficulty-footer-title">
                                    <Trophy className="h-4 w-4" aria-hidden="true" />
                                    Best score
                                </div>
                                <div className="difficulty-score">
                                    <span>{leaderboard[0].finalScore} pts</span>
                                    <small>{leaderboard[0].difficulty}</small>
                                </div>
                            </div>
                        )}
                    </footer>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
