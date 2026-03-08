import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
    { text: 'Loading forensic evidence vault.............. done', delay: 400, type: 'ok' },
    { text: 'Mounting write-protected evidence images..... done', delay: 800, type: 'ok' },
    { text: 'Initializing chain of custody logger......... done', delay: 1200, type: 'ok' },
    { text: 'Verifying SHA-256 integrity hashes........... done', delay: 1600, type: 'ok' },
    { text: 'AI assistant ARIA: unreliable inference engine detected', delay: 2000, type: 'warn' },
    { text: 'Starting investigation session............... done', delay: 2400, type: 'ok' },
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
                    className="fixed inset-0 z-50 bg-[#0a0e17] text-slate-300 font-mono p-8 overflow-hidden flex flex-col items-center justify-center"
                >
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-[10px] text-slate-500 hover:text-slate-300 px-3 py-1 border border-transparent hover:border-slate-700 rounded transition-colors"
                    >
                        SKIP ESC
                    </button>

                    <div className="w-full max-w-4xl">
                        {/* ASCII Art Header */}
                        <div className="flex flex-col items-center mb-12">
                            <div className="text-cyan-400 whitespace-pre font-bold mb-6 text-sm sm:text-base selection:bg-cyan-900 leading-tight">
                                {"    ___    ____  _________       __________  ____\n"}
                                {"   /   |  / __ \\/  _/   |        ______/ __ \\/ __ \\\n"}
                                {"  / /| | / /_/ // // /| |       / /   / /_/ / / / /\n"}
                                {" / ___ |/ _, _// // ___ |      / /___/ ____/ /_/ /\n"}
                                {"/_/  |_/_/ |_/___/_/  |_|      \\____/_/    \\____/"}
                            </div>
                            <div className="text-cyan-400 font-bold text-center text-sm sm:text-base tracking-[0.3em] pl-[0.3em] uppercase">
                                Forensic Workstation v2.6.1
                            </div>
                        </div>

                        {/* Boot sequence lines */}
                        <div className="space-y-2 text-xs sm:text-sm pl-4 sm:pl-12">
                            {BOOT_LINES.map((line, i) => {
                                if (i >= visibleLines) return null;

                                const isOk = line.type === 'ok';
                                const prefix = isOk
                                    ? <span className="text-emerald-400">[  OK  ]</span>
                                    : <span className="text-amber-400">[ WARN ]</span>;

                                const isLastVisible = i === visibleLines - 1;

                                return (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-20">{prefix}</div>
                                        <div className={`flex-1 ${!isOk && 'text-amber-500'}`}>
                                            {line.text}
                                            {isLastVisible && (
                                                <span className="inline-block w-2.5 h-4 ml-2 bg-slate-400 animate-ping" style={{ verticalAlign: 'middle', animationDuration: '800ms' }} />
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
