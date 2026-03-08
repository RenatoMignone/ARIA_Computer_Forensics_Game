import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SaveSlot, LeaderboardEntry } from '../types/game';
import { FolderOpen, Trophy } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

export function DifficultyScreen() {
    const { dispatch } = useGame();
    const { playBootSequence } = useAudio();
    const [resumeCode, setResumeCode] = useState('');
    const [resumeError, setResumeError] = useState<string | null>(null);

    const handleSelect = (diff: 'standard' | 'hard' | 'expert') => {
        playBootSequence();
        dispatch({ type: 'SET_DIFFICULTY', difficulty: diff });
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
    }, []);

    const handleLoadSave = (slot: SaveSlot) => {
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
            const snapshot = JSON.parse(atob(resumeCode));
            if (snapshot.v !== 1) {
                setResumeError('Invalid save code version. Start a new investigation instead.');
                return;
            }
            playBootSequence();
            dispatch({ type: 'LOAD_GAME_STATE', state: snapshot });
        } catch {
            setResumeError('Invalid save code. Start a new investigation instead.');
        }
    };

    return (
        <AnimatePresence>
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
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
