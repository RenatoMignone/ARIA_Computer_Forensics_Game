import { useGame } from '../context/GameContext';
import { Claim } from '../types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ClaimBadgeProps {
    claim: Claim;
    compact?: boolean;
    onValidate?: (claimId: string, verdict: 'verified' | 'hallucination') => void;
}

export function ClaimBadge({ claim, compact = false }: ClaimBadgeProps) {
    const { state, dispatch } = useGame();
    const verdict = state.verdicts[claim.id] || 'pending';

    const isPending = verdict === 'pending';
    const verdObj = isPending ? null : (verdict as import('../types/game').VerdictRecord);

    const badgeClass =
        isPending ? 'claim-badge-pending' :
            verdObj?.verdict === 'verified' ? 'claim-badge-verified' :
                'claim-badge-hallucination';

    const Icon =
        isPending ? AlertCircle :
            verdObj?.verdict === 'verified' ? CheckCircle :
                XCircle;

    const [stagedVerdict, setStagedVerdict] = useState<'verified' | 'hallucination' | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!stagedVerdict) return;
        if (state.difficulty === 'expert') return; // No auto-timer in expert mode

        const timer = setTimeout(() => {
            dispatch({ type: 'VALIDATE_CLAIM', claimId: claim.id, verdict: stagedVerdict, confidence: 'medium', claim });
            setStagedVerdict(null);
        }, 4000);
        return () => clearTimeout(timer);
    }, [stagedVerdict, claim, dispatch, state.difficulty]);

    const confirmVerdict = (conf: 'low' | 'medium' | 'high') => {
        if (!stagedVerdict) return;
        dispatch({ type: 'VALIDATE_CLAIM', claimId: claim.id, verdict: stagedVerdict, confidence: conf, claim });
        setStagedVerdict(null);
    };

    const handleValidate = (v: 'verified' | 'hallucination') => {
        if (!isPending) return;
        setStagedVerdict(v);
        setExpanded(true);
    };

    if (compact) {
        return (
            <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-default ${badgeClass}`}
                title={`${claim.id}: ${claim.text}`}
            >
                <Icon className="w-3 h-3" />
                {claim.id}
            </span>
        );
    }

    return (
        <motion.div
            layout
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(v => !v); } }}
            aria-expanded={expanded}
            aria-label={`Claim ${claim.id}, ${isPending ? 'unvalidated' : verdObj?.verdict ?? 'pending'}. Press Enter to expand.`}
            className={`rounded-lg border p-3 mb-2 ${badgeClass} focus:outline-none focus:ring-2 focus:ring-cyan-400/60`}
        >
            <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold">{claim.id}</span>
                        {claim.isHallucination && !isPending && (
                            <span className="text-[10px] font-mono px-1 py-0.5 bg-red-900/30 border border-red-800/50 text-red-300 rounded">
                                {claim.hallucinationType?.replace(/_/g, ' ')}
                            </span>
                        )}
                        {!isPending && verdObj && (
                            <span className="ml-auto text-[10px] font-mono px-1 py-0.5 border border-slate-700/50 text-slate-400 rounded bg-slate-800/50 capitalize">
                                Conf: {verdObj.confidence}
                            </span>
                        )}
                        <button onClick={() => setExpanded(!expanded)} className="ml-auto opacity-50 hover:opacity-100 p-1">
                            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                    </div>
                    <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                        <p className={`text-xs leading-relaxed ${isPending && (state.difficulty === 'hard' || state.difficulty === 'expert') ? 'text-slate-500 italic' : 'text-current opacity-90'} ${!expanded ? 'line-clamp-2' : ''}`}>
                            {isPending && (state.difficulty === 'hard' || state.difficulty === 'expert') 
                                ? '[Claim formulation redacted. Read ARIA\'s analysis below.]'
                                : (isPending && !expanded && claim.text.length > 160 ? claim.text.slice(0, 160) + '...' : claim.text)
                            }
                        </p>
                    </div>

                    {!isPending && expanded && (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 pt-2 border-t border-current border-opacity-20"
                            >
                                <p className="text-[11px] leading-relaxed opacity-80">{claim.explanation}</p>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {isPending && !stagedVerdict && (
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleValidate('verified'); }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 hover:bg-emerald-800/50 transition-colors"
                            >
                                <CheckCircle className="w-3 h-3" />
                                Verify
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleValidate('hallucination'); }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium bg-red-900/50 border border-red-700/50 text-red-300 hover:bg-red-800/50 transition-colors"
                            >
                                <XCircle className="w-3 h-3" />
                                Hallucination
                            </button>
                        </div>
                    )}

                    {stagedVerdict && (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Select Confidence Level:</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setStagedVerdict(null); }}
                                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-600/50 text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
                                    title="Undo verdict selection"
                                >
                                    Undo
                                </button>
                            </div>
                            <div className="flex gap-2 mb-2">
                                <button onClick={() => confirmVerdict('low')} className="flex-1 py-1 text-xs font-mono rounded bg-blue-900/30 text-blue-300 hover:bg-blue-800/50 border border-blue-800/50 transition-colors">Low</button>
                                <button onClick={() => confirmVerdict('medium')} className="flex-1 py-1 text-xs font-mono rounded bg-amber-900/30 text-amber-300 hover:bg-amber-800/50 border border-amber-800/50 transition-colors">Medium</button>
                                <button onClick={() => confirmVerdict('high')} className="flex-1 py-1 text-xs font-mono rounded bg-emerald-900/30 text-emerald-300 hover:bg-emerald-800/50 border border-emerald-800/50 transition-colors">High</button>
                            </div>
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: '100%' }} 
                                    animate={{ width: 0 }} 
                                    transition={{ duration: 4, ease: 'linear' }}
                                    className="h-full bg-slate-500"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

interface ClaimBadgeListProps {
    claims: Claim[];
    title?: string;
}

export function ClaimBadgeList({ claims, title }: ClaimBadgeListProps) {
    if (claims.length === 0) return null;
    return (
        <div>
            {title && (
                <div className="flex items-center gap-2 mb-2">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-mono text-[#64748b] uppercase tracking-wider">{title}</span>
                </div>
            )}
            {claims.map(c => <ClaimBadge key={c.id} claim={c} />)}
        </div>
    );
}
