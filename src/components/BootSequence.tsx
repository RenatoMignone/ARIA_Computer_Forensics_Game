import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { ARIA_LOGO_SRC } from '../lib/assets';

const BOOT_LINES = [
    { text: 'Waking ARIA', delay: 420 },
    { text: 'Opening the case file', delay: 900 },
    { text: 'Loading evidence', delay: 1400 },
    { text: 'Preparing investigation', delay: 1900 },
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
                    className="boot-menu fixed inset-0 z-50 overflow-hidden p-6"
                >
                    <button
                        onClick={handleSkip}
                        className="boot-skip"
                    >
                        Skip
                    </button>

                    <div className="boot-stage">
                        <div className="boot-title">
                            <img src={ARIA_LOGO_SRC} alt="" className="boot-logo" />
                            <h1>ARIA</h1>
                            <p>Don't Trust the Machine</p>
                        </div>

                        <div className="boot-loading" aria-live="polite">
                            <div className="boot-loading-row">
                                <Play className="h-4 w-4" aria-hidden="true" />
                                <span>{BOOT_LINES[Math.max(0, visibleLines - 1)]?.text ?? 'Starting ARIA'}</span>
                            </div>
                            <div className="boot-progress" aria-hidden="true">
                                <span style={{ width: `${Math.max(12, (visibleLines / BOOT_LINES.length) * 100)}%` }} />
                            </div>
                            <div className="boot-loading-meta">
                                {visibleLines < BOOT_LINES.length ? 'Loading' : 'Ready'}
                            </div>
                        </div>

                        <div className="boot-case-line">
                            Case 01: TechCorp Transfer
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
