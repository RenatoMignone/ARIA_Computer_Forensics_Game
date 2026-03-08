import { useGame } from '../context/GameContext';
import { countValidated } from '../lib/scoring';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, HelpCircle, Timer, Save, MessageSquare, Terminal as TerminalIcon, MessageSquareOff, Settings, Library } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SaveModal } from './SaveModal';
import { SettingsModal } from './SettingsModal';

interface HUDProps {
    showChat: boolean;
    setShowChat: (val: boolean) => void;
    showTerminal: boolean;
    setShowTerminal: (val: boolean) => void;
    showVault: boolean;
    setShowVault: (val: boolean) => void;
}

export function HUD({ showChat, setShowChat, showTerminal, setShowTerminal, showVault, setShowVault }: HUDProps) {
    const { state, dispatch } = useGame();
    const { score, verdicts, allClaims, lastScoreDelta, lastAutoSaveTime } = state;
    const totalClaims = Object.keys(allClaims).length;
    const validated = countValidated(verdicts);
    const halluTotal = Object.values(allClaims).filter(c => c.isHallucination).length;
    const halluFound = Object.entries(verdicts).filter(([id, v]) => {
        if (v === 'pending') return false;
        const verdict = typeof v === 'string' ? v : (v as any).verdict;
        return verdict === 'hallucination' && allClaims[id]?.isHallucination === true;
    }).length;

    const [timeLeftMs, setTimeLeftMs] = useState(0);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showAutoSave, setShowAutoSave] = useState(false);
    const { timerEndTime } = state;

    useEffect(() => {
        if (lastAutoSaveTime) {
            setShowAutoSave(true);
            const t = setTimeout(() => setShowAutoSave(false), 1500);
            return () => clearTimeout(t);
        }
    }, [lastAutoSaveTime]);

    useEffect(() => {
        if (!timerEndTime) return;
        const checkTime = () => {
            const left = Math.max(0, timerEndTime - Date.now());
            setTimeLeftMs(left);
        };
        checkTime();
        const interval = setInterval(checkTime, 1000);
        return () => clearInterval(interval);
    }, [timerEndTime]);

    const formatTime = (ms: number) => {
        const total = Math.floor(ms / 1000);
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (lastScoreDelta !== null) {
            const t = setTimeout(() => dispatch({ type: 'CLEAR_SCORE_DELTA' }), 1200);
            return () => clearTimeout(t);
        }
    }, [lastScoreDelta, dispatch]);

    const handleSave = () => {
        if (state.phase !== 'investigation') return;
        setIsSaveModalOpen(true);
    };

    return (
        <>
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f2937] bg-[#0d1420] select-none z-30 relative">
            {/* Brand */}
            <div className="relative flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span className="font-mono text-sm font-bold text-cyan-400 tracking-widest">ARIA</span>
                <span className="text-[#475569] text-xs font-mono ml-1 hidden sm:inline">— Don't Trust the Machine</span>

                <AnimatePresence>
                    {showAutoSave && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-full left-0 mt-3 whitespace-nowrap text-xs text-emerald-400 font-mono font-bold bg-[#0d1420] border border-[#1f2937] px-2 py-1 rounded shadow-lg pointer-events-none"
                        >
                            💾 Auto-saved
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
                {/* Score */}
                <div className="relative flex items-center gap-2">
                    <span className="text-[#475569] text-xs font-mono uppercase tracking-wider">Score</span>
                    <span className="font-mono text-lg font-bold text-white">{score}</span>
                    <AnimatePresence>
                        {lastScoreDelta !== null && (
                            <motion.span
                                key={lastScoreDelta + Date.now()}
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 0, y: -20 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.1 }}
                                className={`absolute -top-5 right-0 text-sm font-bold font-mono ${lastScoreDelta > 0 ? 'text-emerald-400' : 'text-red-400'}`}
                            >
                                {lastScoreDelta > 0 ? `+${lastScoreDelta}` : lastScoreDelta}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <div className="w-px h-4 bg-[#1f2937]" />

                {/* Timer */}
                {timerEndTime !== null && (
                    <>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1e293b] rounded border border-[#334155]">
                            <Timer className={`w-3.5 h-3.5 ${timeLeftMs === 0 ? 'text-red-500' : 'text-amber-400'}`} />
                            <span className={`font-mono text-sm font-semibold tracking-widest ${timeLeftMs === 0 ? 'text-red-500' : 'text-amber-300'}`}>
                                {formatTime(timeLeftMs)}
                            </span>
                        </div>
                        <div className="w-px h-4 bg-[#1f2937]" />
                    </>
                )}

                {/* Claims */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[#475569] text-xs font-mono uppercase tracking-wider">Claims</span>
                    <span className="font-mono text-sm font-semibold">
                        <span className="text-white">{validated}</span>
                        <span className="text-[#475569]">/{totalClaims}</span>
                    </span>
                </div>

                <div className="w-px h-4 bg-[#1f2937]" />

                {/* Hallucinations */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[#475569] text-xs font-mono uppercase tracking-wider">Hallucinations</span>
                    <span className="font-mono text-sm font-semibold">
                        {totalClaims === 0 ? (
                            <span className="text-[#475569]">—/—</span>
                        ) : (
                            <>
                                <span className="text-red-400">{halluFound}</span>
                                <span className="text-[#475569]">/{halluTotal}</span>
                            </>
                        )}
                    </span>
                </div>

                <div className="w-px h-4 bg-[#1f2937]" />

                {/* Phase & Difficulty badge */}
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${state.phase === 'investigation' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-xs font-mono text-[#64748b] uppercase tracking-wider">{state.phase}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                        state.difficulty === 'expert' ? 'bg-red-900/30 text-red-400 border-red-800/50' :
                        state.difficulty === 'hard' ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                        {state.difficulty.toUpperCase()}
                    </span>
                </div>

                <div className="w-px h-4 bg-[#1f2937]" />

                {/* Save button */}
                {state.phase === 'investigation' && (
                    <button
                        onClick={handleSave}
                        className="p-1.5 rounded text-[#64748b] hover:text-emerald-400 hover:bg-[#111827] transition-colors"
                        title="Save Progress"
                        aria-label="Save Progress"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                )}

                <div className="w-px h-4 bg-[#1f2937]" />

                {/* Vault Toggle */}
                <button
                    onClick={() => setShowVault(!showVault)}
                    className={`p-1.5 rounded transition-colors ${showVault ? 'text-cyan-400 bg-[#0d1420]' : 'text-[#475569] hover:text-slate-300'}`}
                    title={showVault ? "Hide Evidence Vault" : "Show Evidence Vault"}
                    aria-label="Toggle Evidence Vault"
                >
                    <Library className="w-4 h-4" />
                </button>

                {/* Terminal Toggle */}
                <button
                    onClick={() => setShowTerminal(!showTerminal)}
                    className={`p-1.5 rounded transition-colors ${showTerminal ? 'text-cyan-400 bg-[#0d1420]' : 'text-[#475569] hover:text-slate-300'}`}
                    title={showTerminal ? "Hide Terminal" : "Show Terminal"}
                    aria-label="Toggle Terminal"
                >
                    <TerminalIcon className="w-4 h-4" />
                </button>

                {/* Chat Toggle */}
                <button
                    onClick={() => setShowChat(!showChat)}
                    className={`p-1.5 rounded transition-colors ${showChat ? 'text-cyan-400 bg-[#0d1420]' : 'text-[#475569] hover:text-slate-300'}`}
                    title={showChat ? "Hide Chat" : "Show Chat"}
                    aria-label="Toggle Chat"
                >
                    {showChat ? <MessageSquare className="w-4 h-4" /> : <MessageSquareOff className="w-4 h-4" />}
                </button>

                {/* Settings button */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-1.5 rounded text-[#64748b] hover:text-cyan-400 hover:bg-[#111827] transition-colors"
                    title="System Settings"
                    aria-label="System Settings"
                >
                    <Settings className="w-4 h-4" />
                </button>

                {/* Glossary button */}
                <button
                    onClick={() => dispatch({ type: 'TOGGLE_GLOSSARY' })}
                    className="p-1.5 rounded text-[#64748b] hover:text-cyan-400 hover:bg-[#111827] transition-colors"
                    title="Open Forensic Glossary"
                    aria-label="Open Forensic Glossary"
                >
                    <HelpCircle className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Portalled Save Modal */}
        <SaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} />
        {/* Portalled Settings Modal */}
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
}
