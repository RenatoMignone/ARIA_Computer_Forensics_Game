import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Volume2, VolumeX, Monitor, Trash2, Github } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [crtEnabled, setCrtEnabled] = useState(false);

    useEffect(() => {
        const savedSound = localStorage.getItem('aria_settings_sound');
        const savedCrt = localStorage.getItem('aria_settings_crt');
        if (savedSound !== null) setSoundEnabled(savedSound === 'true');
        if (savedCrt !== null) setCrtEnabled(savedCrt === 'true');
    }, []);

    useEffect(() => {
        if (crtEnabled) {
            document.body.classList.add('crt-effect');
        } else {
            document.body.classList.remove('crt-effect');
        }
    }, [crtEnabled]);

    const toggleSound = () => {
        const newVal = !soundEnabled;
        setSoundEnabled(newVal);
        localStorage.setItem('aria_settings_sound', String(newVal));
        // Note: useAudio will check this localStorage key
    };

    const toggleCrt = () => {
        const newVal = !crtEnabled;
        setCrtEnabled(newVal);
        localStorage.setItem('aria_settings_crt', String(newVal));
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to delete ALL progress and saves? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#0d1420] border border-[#1f2937] rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#111827] border-b border-[#1f2937] p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-cyan-400">
                                <Settings className="w-4 h-4" />
                                <span className="text-xs font-mono font-bold uppercase tracking-widest">System Settings</span>
                            </div>
                            <button onClick={onClose} className="text-[#475569] hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Sound Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-cyan-400/10 flex items-center justify-center">
                                        {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-[#475569]" />}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-200 font-mono">Terminal Audio</div>
                                        <div className="text-[10px] text-[#475569] font-mono">Mechanical keystroke & boot sounds</div>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleSound}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${soundEnabled ? 'bg-cyan-500' : 'bg-[#1f2937]'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${soundEnabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            {/* CRT Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-cyan-400/10 flex items-center justify-center">
                                        <Monitor className={`w-4 h-4 ${crtEnabled ? 'text-cyan-400' : 'text-[#475569]'}`} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-200 font-mono">CRT Scanlines</div>
                                        <div className="text-[10px] text-[#475569] font-mono">Retro monitor visual overlay</div>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleCrt}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${crtEnabled ? 'bg-cyan-500' : 'bg-[#1f2937]'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${crtEnabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-[#1f2937] space-y-3">
                                <button
                                    onClick={() => window.open('https://github.com/RenatoMignone/ARIA_Computer_Forensics_Game', '_blank')}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-[#334155] text-[#94a3b8] text-xs font-mono rounded transition-colors"
                                >
                                    <Github className="w-3.5 h-3.5" />
                                    Repository / Docs
                                </button>
                                
                                <button
                                    onClick={handleReset}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/10 border border-red-900/30 hover:bg-red-900/30 text-red-500 text-xs font-mono rounded transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Hard Reset Progress
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-[#0a0e17] p-3 text-center border-t border-[#1f2937]">
                            <p className="text-[9px] font-mono text-[#374151]">ARIA OS v2.6.4 • CONFIDENTIAL</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
