import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SaveSlot, SerializedGameState } from '../types/game';
import { countHallucinationsFound, countTotalHallucinations, countValidated } from '../lib/scoring';
import { X, Save, FolderOpen, Trash2, CheckCircle2 } from 'lucide-react';

interface SaveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SaveModal({ isOpen, onClose }: SaveModalProps) {
    const { state, dispatch } = useGame();
    const [saveName, setSaveName] = useState('');
    const [saves, setSaves] = useState<SaveSlot[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [saveToConfirmDelete, setSaveToConfirmDelete] = useState<string | null>(null);

    // Load saves from localStorage when modal opens
    useEffect(() => {
        if (isOpen) {
            const raw = localStorage.getItem('aria_saves');
            if (raw) {
                try {
                    setSaves(JSON.parse(raw));
                } catch {
                    setSaves([]);
                }
            } else {
                setSaves([]);
            }

            // generate default name
            const now = new Date();
            const shortStamp = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            setSaveName(`Investigation # ${shortStamp}`);
        }
    }, [isOpen]);

    const handleSave = () => {
        const validated = countValidated(state.verdicts);
        const totalClaims = Object.keys(state.allClaims).length;
        const halluTotal = Object.values(state.allClaims).filter(c => c.isHallucination).length;
        const halluFound = Object.entries(state.verdicts).filter(([id, v]) => {
            if (v === 'pending') return false;
            const verdict = typeof v === 'string' ? v : (v as any).verdict;
            return verdict === 'hallucination' && state.allClaims[id]?.isHallucination === true;
        }).length;

        const gameState: SerializedGameState = {
            score: state.score,
            verdicts: state.verdicts,
            allClaims: state.allClaims,
            foundConnections: state.foundConnections,
            difficulty: state.difficulty,
            chainOfCustody: state.chainOfCustody,
            chatHistory: state.chatHistory.slice(-30),
            selectedEvidenceId: state.selectedEvidenceId,
        };

        const newSave: SaveSlot = {
            id: `save_${Date.now()}`,
            name: saveName.trim() || 'Untitled Investigation',
            timestamp: new Date().toISOString(),
            difficulty: state.difficulty,
            score: state.score,
            claimsValidated: validated,
            totalClaims,
            hallucinationsFound: halluFound,
            totalHallucinations: halluTotal,
            connectionsFound: state.foundConnections.length,
            phase: 'investigation',
            gameState
        };

        let updatedSaves = [newSave, ...saves];
        // Enforce max 5 slots - remove oldest if needed
        if (updatedSaves.length > 5) {
            // Sort to ensure oldest is at the end, then slice
            updatedSaves = updatedSaves.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
        } else {
            updatedSaves = updatedSaves.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }

        localStorage.setItem('aria_saves', JSON.stringify(updatedSaves));
        setSaves(updatedSaves);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const handleLoad = (slot: SaveSlot) => {
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
        onClose();
    };

    const handleDelete = (id: string) => {
        const updated = saves.filter(s => s.id !== id);
        localStorage.setItem('aria_saves', JSON.stringify(updated));
        setSaves(updated);
        setSaveToConfirmDelete(null);
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-40"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-x-4 top-16 md:inset-x-auto md:w-[600px] md:left-1/2 md:-translate-x-1/2 md:top-20 z-50 bg-[#0d1420] border border-[#1f2937] rounded-xl overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-6 py-4 bg-[#111827] border-b border-[#1f2937]">
                            <Save className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-sm font-bold text-white font-mono tracking-widest uppercase">Save Investigation</h2>
                            <button
                                onClick={onClose}
                                className="ml-auto p-1.5 rounded text-[#64748b] hover:text-white hover:bg-[#1f2937] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Save Action Area */}
                        <div className="p-6 border-b border-[#1f2937] bg-[#0a0f18] space-y-4">
                            <label className="text-xs font-mono font-bold text-[#64748b] uppercase tracking-widest">Save Name</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={saveName}
                                    onChange={e => setSaveName(e.target.value)}
                                    className="flex-1 bg-[#0d1420] border border-[#1f2937] rounded px-3 py-2 text-sm font-mono text-slate-300 placeholder-[#374151] focus:outline-none focus:border-emerald-400/50"
                                />
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 flex items-center gap-2 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded text-sm hover:bg-emerald-900/50 transition-colors font-mono font-bold"
                                >
                                    {showSuccess ? (
                                        <><CheckCircle2 className="w-4 h-4" /> Saved</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Save Progress</>
                                    )}
                                </button>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                                {saves.length >= 5 ? "⚠️ 5/5 slots used. Saving will overwrite your oldest investigation." : `${saves.length} / 5 slots used`}
                            </div>
                        </div>

                        {/* Saved Slots List */}
                        <div className="p-6 bg-[#0d1420]">
                            <h3 className="text-xs font-mono font-bold text-[#64748b] uppercase tracking-widest mb-4">Saved Investigations</h3>
                            
                            {saves.length === 0 ? (
                                <div className="text-sm text-slate-500 italic text-center py-6 font-mono border border-dashed border-[#1f2937] rounded-lg">
                                    No saved investigations yet. Click "Save Progress" to create your first save.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {saves.map((slot) => (
                                        <div key={slot.id} className="bg-[#111827] border border-[#1f2937] rounded-lg p-4 group hover:border-[#334155] transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <FolderOpen className="w-4 h-4 text-cyan-400" />
                                                    <span className="font-mono text-sm font-bold text-slate-200">{slot.name}</span>
                                                </div>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase ${
                                                    slot.difficulty === 'expert' ? 'bg-red-900/30 text-red-400 border-red-800/50' :
                                                    slot.difficulty === 'hard' ? 'bg-amber-900/30 text-amber-400 border-amber-800/50' :
                                                    'bg-slate-800 text-slate-400 border-slate-700'
                                                }`}>
                                                    {slot.difficulty}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-xs font-mono text-[#64748b] mb-4">
                                                <span>Score: <span className="text-white">{slot.score}</span></span>
                                                <span>Claims: <span className="text-white">{slot.claimsValidated}/{slot.totalClaims}</span></span>
                                                <span>{formatDate(slot.timestamp)}</span>
                                            </div>

                                            <div className="flex items-center gap-2 justify-end pt-3 border-t border-[#1f2937]">
                                                {saveToConfirmDelete === slot.id ? (
                                                    <div className="flex items-center gap-2 mr-auto text-xs font-mono text-red-400">
                                                        Are you sure?
                                                        <button onClick={() => handleDelete(slot.id)} className="px-2 py-1 rounded bg-red-900/30 hover:bg-red-900/50 text-white font-bold ml-1">Yes</button>
                                                        <button onClick={() => setSaveToConfirmDelete(null)} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">No</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setSaveToConfirmDelete(slot.id)}
                                                        className="px-3 py-1.5 rounded flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-900/20 font-mono font-bold transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleLoad(slot)}
                                                    className="px-4 py-1.5 bg-cyan-900/30 border border-cyan-800/50 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-300 rounded text-xs font-mono font-bold transition-colors"
                                                >
                                                    Load
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
