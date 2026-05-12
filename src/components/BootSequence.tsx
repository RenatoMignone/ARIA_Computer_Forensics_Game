import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, FileSearch, ShieldCheck } from 'lucide-react';

const BOOT_LINES = [
    { text: 'Evidence vault ready', detail: '5 recovered files secured', delay: 420 },
    { text: 'Case context loaded', detail: 'TechCorp transfer incident', delay: 900 },
    { text: 'ARIA assistant connected', detail: 'Claims must be verified', delay: 1400 },
    { text: 'Investigation workspace prepared', detail: 'Chain of custody active', delay: 1900 },
];

export function BootSequence({ onComplete }: { onComplete: () => void }) {
    const [visibleLines, setVisibleLines] = useState<number>(0);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        let isSubscribed = true;

        const scheduleLines = async () => {
            for (let i = 0; i < BOOT_LINES.length; i++) {
                if (!isSubscribed) return;
                const prevDelay = i === 0 ? 0 : BOOT_LINES[i - 1].delay;
                const waitTime = BOOT_LINES[i].delay - prevDelay;
                await new Promise(r => setTimeout(r, waitTime));
                if (!isSubscribed) return;
                setVisibleLines(i + 1);
            }

            // After last line, wait 600ms then start fade out
            await new Promise(r => setTimeout(r, 600));
            if (!isSubscribed) return;
            setIsFadingOut(true);

            // Wait for fade transition then complete
            await new Promise(r => setTimeout(r, 500));
            if (!isSubscribed) return;
            onComplete();
        };

        scheduleLines();

        return () => {
            isSubscribed = false;
        };
    }, [onComplete]);

    const handleSkip = () => {
        setIsFadingOut(true);
        setTimeout(onComplete, 300); // faster fade on skip
    };

    return (
        <AnimatePresence>
            {!isFadingOut && (
                <motion.div
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-50 bg-[#0a0e17] text-slate-200 p-6 overflow-hidden flex flex-col items-center justify-center"
                >
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-xs text-slate-500 hover:text-slate-200 px-3 py-1.5 border border-slate-800 hover:border-slate-600 rounded-md transition-colors"
                    >
                        Skip
                    </button>

                    <div className="w-full max-w-2xl">
                        <div className="mb-10 text-center">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
                                <ShieldCheck className="h-7 w-7 text-cyan-300" aria-hidden="true" />
                            </div>
                            <div className="text-xs uppercase tracking-[0.28em] text-cyan-300 font-semibold mb-3">ARIA</div>
                            <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-normal">
                                Don't Trust the Machine
                            </h1>
                            <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                                Preparing the TechCorp case file and opening your investigation workspace.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-[#0d1420] p-4 sm:p-5 shadow-2xl">
                            {BOOT_LINES.map((line, i) => {
                                if (i >= visibleLines) return null;

                                const isLastVisible = i === visibleLines - 1;

                                return (
                                    <div key={i} className="flex items-center gap-3 py-2.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                                            {isLastVisible ? (
                                                <FileSearch className="h-4 w-4 text-cyan-300 animate-pulse" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-slate-100">{line.text}</div>
                                            <div className="text-xs text-slate-500">{line.detail}</div>
                                            {isLastVisible && (
                                                <div className="mt-2 h-1 w-40 overflow-hidden rounded-full bg-slate-800">
                                                    <div className="h-full w-2/3 rounded-full bg-cyan-400 animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
