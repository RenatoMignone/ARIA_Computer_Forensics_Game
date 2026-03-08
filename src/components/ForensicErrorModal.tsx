import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { AlertTriangle, Info } from 'lucide-react';
import { HallucinationType } from '../types/game';

const HALLUCINATION_LESSONS: Record<string, string> = {
  timestamp_error: 'AI tools parse timestamps from multiple metadata layers and can misread timezone offsets, creation vs. modification fields, or Unix epoch conversions. Always read timestamps directly from the raw file.',
  false_attribution: 'Stylometric and authorship analysis produces probabilistic similarity scores — never forensic identity proof. Attribution requires corroborating technical evidence.',
  fabricated_metadata: 'LLMs will generate plausible-sounding field values for metadata they cannot verify. If a field value is not present in the raw file, it does not exist forensically.',
  false_correlation: 'Temporal proximity is not causation. Two events at the same timestamp may share an actor — or may not. Each link in an evidence chain requires independent verification.',
  confidence_inflation: 'AI confidence percentages are outputs of probability distributions, not forensic measurements. A "95% match" without a disclosed methodology and reference dataset is not admissible evidence.',
};

export function ForensicErrorModal() {
    const { state, dispatch } = useGame();
    const { errorReveal } = state;
    const [timeLeft, setTimeLeft] = useState(15);

    useEffect(() => {
        if (!errorReveal?.active) {
            setTimeLeft(15);
            return;
        }
        
        const tick = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    dispatch({ type: 'HIDE_ERROR_REVEAL' });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(tick);
    }, [errorReveal?.active, dispatch]);

    if (!errorReveal || !errorReveal.active) return null;

    const { claim, wrongVerdict, correctVerdict } = errorReveal;
    const isVariant1 = wrongVerdict === 'verified' && correctVerdict === 'hallucination';
    
    const borderColor = isVariant1 ? 'border-amber-500' : 'border-blue-500';
    const bgColor = isVariant1 ? 'bg-amber-900/10' : 'bg-blue-900/10';
    const iconColor = isVariant1 ? 'text-amber-500' : 'text-blue-500';
    const Icon = isVariant1 ? AlertTriangle : Info;
    
    const title = isVariant1 ? 'FORENSIC ERROR LOGGED' : 'VERIFICATION ERROR LOGGED';
    const subtitle = isVariant1 ? 'Hallucination accepted as evidence' : 'Accurate claim incorrectly rejected';
    
    const lesson = (claim.isHallucination && claim.hallucinationType) ? HALLUCINATION_LESSONS[claim.hallucinationType] : 
                   (isVariant1 ? HALLUCINATION_LESSONS['confidence_inflation'] : '');

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <div className="absolute inset-0 z-0 pointer-events-none" />
                
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`relative z-10 w-full max-w-2xl bg-[#0a0e17] border-2 ${borderColor} rounded-xl shadow-2xl overflow-hidden font-mono flex flex-col`}
                >
                    <div className={`${bgColor} p-6 border-b ${borderColor}`}>
                        <div className="flex items-center gap-4 mb-2">
                            <Icon className={`w-8 h-8 ${iconColor}`} />
                            <div>
                                <h2 className={`text-lg font-bold tracking-widest uppercase ${iconColor}`}>{title}</h2>
                                <p className="text-slate-300 text-sm">{subtitle}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 text-slate-300">
                        <div className="space-y-2">
                            <p className="text-sm">You marked this claim as <strong className="text-white uppercase">{wrongVerdict}</strong>:</p>
                            <p className="p-3 bg-white/5 border border-white/10 rounded-lg text-slate-200 italic">"{claim.text}"</p>
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-sm">This {isVariant1 ? 'was an AI hallucination' : 'claim was factually correct'}.</p>
                            <div className="mt-2">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                                    {isVariant1 ? 'WHAT THE RAW METADATA ACTUALLY SHOWS:' : 'WHAT THE RAW METADATA CONFIRMS:'}
                                </p>
                                <p className="text-emerald-400 p-3 bg-emerald-900/10 border border-emerald-800/30 rounded-lg">
                                    {claim.explanation}
                                </p>
                            </div>
                        </div>

                        {isVariant1 && claim.hallucinationType && (
                            <div className="text-sm">
                                <span className="text-slate-500 uppercase tracking-wider text-xs">HALLUCINATION TYPE:</span>{' '}
                                <span className="text-amber-400 ml-2">{claim.hallucinationType.replace(/_/g, ' ').toUpperCase()}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-[#111827] border-t border-[#1f2937] p-6">
                        <h3 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">
                            {isVariant1 ? 'WHY THIS MATTERS IN REAL INVESTIGATIONS:' : 'REMINDER:'}
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed mb-6">
                            {isVariant1 ? lesson : 'Not all AI output is wrong. The skill is knowing which claims require verification — and verifying them, not assuming they are false.'}
                        </p>
                        
                        <div className="flex items-center justify-between">
                            <p className="text-red-400 font-bold">Score impact: {isVariant1 ? '−30' : '−15'} pts</p>
                            <button
                                onClick={() => dispatch({ type: 'HIDE_ERROR_REVEAL' })}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors"
                            >
                                {isVariant1 ? 'I understand — continue investigation' : 'Understood — continue investigation'}
                            </button>
                        </div>
                    </div>
                    
                    {/* Countdown bar */}
                    <div className="h-1 bg-slate-800 w-full absolute bottom-0 left-0">
                        <motion.div 
                            className={`h-full ${isVariant1 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            initial={{ width: '100%' }}
                            animate={{ width: `${(timeLeft / 15) * 100}%` }}
                            transition={{ ease: "linear", duration: 1 }}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
