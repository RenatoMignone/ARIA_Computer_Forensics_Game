import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Circle, HelpCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useState } from 'react';

const GLOSSARY_TERMS = [
    { term: 'LLM Hallucination', def: 'When an AI language model generates false, misleading, or fabricated information presented with apparent confidence. In forensics, accepting hallucinated evidence can corrupt an entire investigation.' },
    { term: 'Chain of Custody', def: 'The documented, unbroken sequence of possession and control of evidence from collection to court. Any gap invalidates the evidence\'s admissibility.' },
    { term: 'EXIF Metadata', def: 'Exchangeable Image File Format data embedded in media files. Can include timestamps, GPS coordinates, camera model, and software used. Must be verified directly — AI can confabulate absent fields.' },
    { term: 'SPF (Sender Policy Framework)', def: 'A DNS-based email authentication protocol specifying which mail servers are authorized to send email for a domain. SPF FAIL indicates spoofed origin.' },
    { term: 'DKIM (DomainKeys Identified Mail)', def: 'A cryptographic email authentication method. A DKIM mismatch means the signing domain differs from the apparent sender domain — a strong phishing indicator.' },
    { term: 'Return-Path', def: 'The email header field indicating where bounce messages are sent. A Return-Path differing from From is a primary indicator of email spoofing and BEC attacks.' },
    { term: 'Hash Verification (MD5/SHA-256)', def: 'Cryptographic one-way functions producing fixed-length digests from evidence files. Running hash verify on intake and again at court proves a file was not modified (integrity).' },
    { term: 'Confidence Score (AI)', def: 'A numerical value an AI assigns to a prediction. In forensics: AI confidence ≠ forensic certainty. Every score must be accompanied by tool provenance, methodology, and a documented false-positive rate.' },
    { term: 'Stylometric Analysis', def: 'A probabilistic technique comparing writing patterns to attribute authorship. Inadmissible as primary forensic evidence — it cannot prove authorship, only suggest similarity.' },
    { term: 'BEC (Business Email Compromise)', def: 'An attack where adversaries impersonate executives to trick employees into authorizing fraudulent wire transfers. Often combined with AI-generated spear-phishing and voice/video deepfakes.' },
    { term: 'Deepfake', def: 'AI-generated or AI-manipulated video/audio designed to impersonate a real person. Detected via bitrate anomalies, compression artifacts at face boundaries, and metadata inconsistencies.' },
    { term: 'Voice Cloning', def: 'AI-synthesized speech mimicking a specific person\'s voice. Forensic indicators include atypical sample rates (22050 Hz vs 44100 Hz), TTS encoder artifacts, and flat synthetic background noise.' },
    { term: 'False Correlation', def: 'Incorrectly assuming two events share the same cause due to temporal or superficial similarity. A fundamental logical fallacy: correlation ≠ causation. Every evidential link requires explicit documentation.' },
];

const COLOR_KEY = [
    { color: 'bg-amber-400', label: 'Unvalidated / Pending', desc: 'ARIA claim not yet assessed' },
    { color: 'bg-emerald-400', label: 'Verified', desc: 'Claim confirmed against raw evidence' },
    { color: 'bg-red-400', label: 'Hallucination', desc: 'Claim refuted — AI fabricated or erred' },
];

export function GlossaryModal() {
    const { state, dispatch } = useGame();
    const [activeTab, setActiveTab] = useState<'glossary' | 'howtoplay'>('glossary');

    return (
        <AnimatePresence>
            {state.glossaryOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-40"
                        onClick={() => dispatch({ type: 'TOGGLE_GLOSSARY' })}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-8 z-50 bg-[#0d1420] border border-[#1f2937] rounded-2xl overflow-hidden flex flex-col"
                        style={{ maxWidth: 780, margin: 'auto' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937]">
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={() => setActiveTab('glossary')}
                                    className={`flex items-center gap-2 text-sm font-bold font-mono transition-colors pb-1 border-b-2 ${activeTab === 'glossary' ? 'text-white border-cyan-400' : 'text-[#64748b] border-transparent hover:text-slate-300'}`}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    [ Forensic Glossary ]
                                </button>
                                <button 
                                    onClick={() => setActiveTab('howtoplay')}
                                    className={`flex items-center gap-2 text-sm font-bold font-mono transition-colors pb-1 border-b-2 ${activeTab === 'howtoplay' ? 'text-white border-cyan-400' : 'text-[#64748b] border-transparent hover:text-slate-300'}`}
                                >
                                    <HelpCircle className="w-4 h-4" />
                                    [ How to Play ]
                                </button>
                            </div>
                            <button
                                onClick={() => dispatch({ type: 'TOGGLE_GLOSSARY' })}
                                className="p-1.5 rounded text-[#64748b] hover:text-white hover:bg-[#1f2937] transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeTab === 'glossary' && (
                                <>
                                    {/* Color key */}
                                    <div>
                                        <h3 className="text-xs font-mono font-bold text-[#64748b] uppercase tracking-widest mb-3">Claim Badge Color Key</h3>
                                        <div className="flex flex-col gap-2">
                                            {COLOR_KEY.map(ck => (
                                                <div key={ck.label} className="flex items-center gap-3">
                                                    <Circle className={`w-3.5 h-3.5 fill-current ${ck.color.replace('bg-', 'text-')}`} />
                                                    <span className="text-sm font-mono font-semibold text-slate-200">{ck.label}</span>
                                                    <span className="text-xs text-[#64748b]">— {ck.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-[#1f2937]" />

                                    {/* Glossary */}
                                    <div>
                                        <h3 className="text-xs font-mono font-bold text-[#64748b] uppercase tracking-widest mb-3">Forensic & AI Terms</h3>
                                        <div className="space-y-3">
                                            {GLOSSARY_TERMS.map(({ term, def }) => (
                                                <div key={term} className="bg-[#111827] border border-[#1f2937] rounded-lg p-3">
                                                    <div className="text-sm font-mono font-bold text-cyan-400 mb-1">{term}</div>
                                                    <p className="text-xs text-slate-400 leading-relaxed">{def}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-[10px] text-[#374151] font-mono text-center pt-2">
                                        Ref: Computer Forensics and Cyber Crime Analysis — Chapter 19 (LLMs in Digital Forensics)
                                    </div>
                                </>
                            )}

                            {activeTab === 'howtoplay' && (
                                <div className="space-y-6 text-sm text-slate-300 font-mono">
                                    <div>
                                        <h3 className="text-cyan-400 font-bold mb-2">OBJECTIVE</h3>
                                        <p>You are a forensic investigator. ARIA is your AI assistant — but she hallucinates.<br/>
                                        Your job: validate every ARIA claim as <span className="text-emerald-400 font-bold">VERIFIED</span> (true) or <span className="text-red-400 font-bold">HALLUCINATION</span> (false) by cross-checking against the raw evidence metadata.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-cyan-400 font-bold mb-2">THE INVESTIGATION LOOP</h3>
                                        <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                                            <li>Select an evidence file from the Evidence Vault (left panel)</li>
                                            <li>Read the Raw Metadata tab — this is the ground truth</li>
                                            <li>Ask ARIA a forensic question in the chat (right panel)</li>
                                            <li>ARIA responds with embedded [CLAIM-XXX] badges</li>
                                            <li>Click a badge and press VERIFY or HALLUCINATION</li>
                                            <li>Confirm your confidence level (Low / Medium / High)</li>
                                            <li>Repeat for all 5 evidence files</li>
                                            <li>Type <code className="text-cyan-300 bg-cyan-900/30 px-1 rounded">report</code> in the terminal when all claims are validated</li>
                                        </ol>
                                    </div>

                                    <div>
                                        <h3 className="text-cyan-400 font-bold mb-2">SCORING</h3>
                                        <ul className="space-y-1 text-slate-400">
                                            <li><span className="text-emerald-400 font-bold inline-block w-8">+20</span> Correctly caught a hallucination</li>
                                            <li><span className="text-emerald-400 font-bold inline-block w-8">+10</span> Correctly verified a true claim</li>
                                            <li><span className="text-red-400 font-bold inline-block w-8">−30</span> Trusted a hallucination (worst mistake)</li>
                                            <li><span className="text-red-400 font-bold inline-block w-8">−15</span> Rejected a true claim</li>
                                            <li><span className="text-emerald-400 font-bold inline-block w-8">+15</span> Found a cross-evidence connection (3 available)</li>
                                            <li><span className="text-red-400 font-bold inline-block w-8">−5</span> Used a hint</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-cyan-400 font-bold mb-2">TERMINAL SHORTCUTS</h3>
                                        <ul className="space-y-1 text-slate-400">
                                            <li><code className="text-cyan-300 w-44 inline-block">inspect &lt;file&gt;</code> — view raw metadata</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">validate &lt;ID&gt; verified</code> — verify a claim</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">validate &lt;ID&gt; hallucination</code> — flag as hallucination</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">hint &lt;ID&gt;</code> — get a metadata hint (-5 pts)</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">connect &lt;f1&gt; &lt;f2&gt; "reason"</code> — link two evidence files</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">timer start</code> — start 15-min speed challenge</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">report</code> — submit final investigation</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-cyan-400 font-bold mb-2">THE 5 HALLUCINATION TYPES</h3>
                                        <ul className="list-disc pl-5 space-y-1 text-slate-400">
                                            <li><strong className="text-slate-300">Timestamp Error</strong> — wrong time/date in metadata</li>
                                            <li><strong className="text-slate-300">False Attribution</strong> — probabilistic analysis ≠ forensic proof</li>
                                            <li><strong className="text-slate-300">Fabricated Metadata</strong> — invented field values</li>
                                            <li><strong className="text-slate-300">False Correlation</strong> — temporal proximity ≠ causal link</li>
                                            <li><strong className="text-slate-300">Confidence Inflation</strong> — high certainty without methodology</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
