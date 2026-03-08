import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { ChevronRight, SkipForward, MousePointer, MessageSquare, ShieldCheck, Info, FileText, Share2, Terminal as TerminalIcon, Award, Search, Bot } from 'lucide-react';

const TUTORIAL_STEPS = [
    {
        icon: <Info className="w-6 h-6 text-cyan-400" />,
        title: 'Investigation Brief',
        description:
            'Welcome to **ARIA — Don\'t Trust the Machine**.\n\nYou are a forensic investigator examining a **€2.3M wire fraud** at TechCorp. Your mission is to analyze 5 pieces of digital evidence and catch the attacker.\n\n*Note: You can review game mechanics anytime by clicking the **?** (Help) button in the top bar.*',
        highlight: null,
    },
    {
        icon: <Search className="w-6 h-6 text-cyan-400" />,
        title: '1. The Evidence Vault',
        description:
            'All recovered files are stored in the **Evidence Vault** (left panel). Click any file to select it.\n\nFiles are write-protected and hash-verified to maintain the chain of custody. You cannot modify them, only analyze them.',
        highlight: 'vault',
    },
    {
        icon: <FileText className="w-6 h-6 text-cyan-400" />,
        title: '2. Ground Truth Metadata',
        description:
            'When a file is selected, its **Raw Metadata** appears in the center Workspace. This is the **Ground Truth**.\n\nCompare timestamps, IP addresses, and headers in this panel against what ARIA tells you later. If they don\'t match, ARIA is lying.',
        highlight: 'workspace',
    },
    {
        icon: <Bot className="w-6 h-6 text-cyan-400" />,
        title: '3. Consulting ARIA',
        description:
            'ARIA is your AI assistant. Ask it questions in the Chat panel (right).\n\nARIA will try to help by analyzing the evidence and generating specific diagnostic claims. Look for Claim Badges like `[CLAIM-001]` in its responses.',
        highlight: 'chat',
    },
    {
        icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
        title: '4. Catching Hallucinations',
        description:
            'ARIA **will hallucinate**. Every `[CLAIM-XXX]` badge must be validated.\n\nClick a badge and cross-reference it with the Workspace metadata. Catching a hallucination earns you points, but blindly accepting one will penalize your score.',
        highlight: 'claims',
    },
    {
        icon: <Share2 className="w-6 h-6 text-cyan-400" />,
        title: '5. Evidence Board',
        description:
            'Switch to the **Board** tab in the Vault to see connections. You can link evidence files together (using the terminal) if they share common attributes (like an IP address).\n\nConnecting files earns bonus points and builds the logic for your final report.',
        highlight: 'board',
    },
    {
        icon: <TerminalIcon className="w-6 h-6 text-cyan-400" />,
        title: '6. Forensic Terminal',
        description:
            'Access low-level tools in the **Terminal** (bottom). Type `help` to see commands.\n\nYou can `connect` evidence, `trace` network routes, `decode` hidden base64 strings, or `hash verify` files.',
        highlight: 'terminal',
    },
    {
        icon: <Award className="w-6 h-6 text-emerald-400" />,
        title: 'Final Submission',
        description:
            'Once all ARIA claims are validated, type `report` in the terminal to finish the investigation.\n\nYour final score depends on accuracy, caught hallucinations, and investigation speed.\n\nGood luck, Investigator. Trust the evidence—not the machine.',
        highlight: null,
    },
];

export function Tutorial() {
    const { state, dispatch } = useGame();

    if (state.phase !== 'tutorial') return null;

    const step = TUTORIAL_STEPS[state.tutorialStep];

    return (
        <AnimatePresence>
            {/* Dark Backdrop - Behind the spotlighted panel */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[100] pointer-events-none"
            />

            {/* Modal Layer - Above the spotlighted panel (z-[110]) */}
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                    className="bg-[#0d1420] border border-cyan-400/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl pointer-events-auto"
                    style={{ boxShadow: '0 0 40px rgba(6,182,212,0.15)' }}
                >
                    {/* Progress dots */}
                    <div className="flex gap-2 mb-6">
                        {TUTORIAL_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${i === state.tutorialStep
                                    ? 'w-6 bg-cyan-400'
                                    : i < state.tutorialStep
                                        ? 'w-2 bg-cyan-400/50'
                                        : 'w-2 bg-[#1f2937]'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-4">
                        {step.icon}
                    </div>

                    {/* Content */}
                    <h2 className="text-lg font-bold text-white font-mono mb-3">{step.title}</h2>
                    <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap space-y-2">
                        {step.description.split('\n').map((line, i) => {
                            if (!line) return null;
                            if (line.startsWith('`') && line.endsWith('`')) {
                                return (
                                    <p key={i}>
                                        <code className="bg-[#111827] border border-[#1f2937] text-cyan-300 px-2 py-0.5 rounded text-xs font-mono">
                                            {line.slice(1, -1)}
                                        </code>
                                    </p>
                                );
                            }

                            const parts = line.split(/(\*\*.+?\*\*|`.+?`)/g);
                            return (
                                <p key={i}>
                                    {parts.map((p, j) => {
                                        if (p.startsWith('**') && p.endsWith('**')) {
                                            return <strong key={j} className="text-slate-200 font-bold">{p.slice(2, -2)}</strong>;
                                        }
                                        if (p.startsWith('`') && p.endsWith('`')) {
                                            return <code key={j} className="bg-[#111827] border border-[#1f2937] text-cyan-300 px-1 py-0.5 rounded text-xs font-mono">{p.slice(1, -1)}</code>;
                                        }
                                        return <span key={j}>{p}</span>;
                                    })}
                                </p>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={() => dispatch({ type: 'SKIP_TUTORIAL' })}
                            className="flex items-center gap-1.5 text-xs font-mono text-[#475569] hover:text-slate-300 transition-colors"
                        >
                            <SkipForward className="w-3.5 h-3.5" />
                            Skip Tutorial
                        </button>
                        <button
                            onClick={() => dispatch({ type: 'ADVANCE_TUTORIAL' })}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-400 text-[#0a0e17] font-mono font-bold text-sm hover:bg-cyan-300 transition-colors"
                        >
                            {state.tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Next' : 'Start Investigation'}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
