import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Circle, HelpCircle, Terminal as TerminalIcon } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useState } from 'react';

const GLOSSARY_TERMS = [
    { term: 'LLM Hallucination', def: 'When an AI language model generates false, misleading, or fabricated information presented with apparent confidence. In forensics, accepting hallucinated evidence can corrupt an entire investigation.' },
    { term: 'Chain of Custody', def: 'The documented, unbroken sequence of possession and control of evidence from collection to court. Any gap invalidates the evidence\'s admissibility.' },
    { term: 'EXIF Metadata', def: 'Exchangeable Image File Format data embedded in media files. Can include timestamps, GPS coordinates, camera model, and software used. Must be verified directly because AI can confabulate absent fields.' },
    { term: 'SPF (Sender Policy Framework)', def: 'A DNS-based email authentication protocol specifying which mail servers are authorized to send email for a domain. SPF FAIL indicates spoofed origin.' },
    { term: 'DKIM (DomainKeys Identified Mail)', def: 'A cryptographic email authentication method. A DKIM mismatch means the signing domain differs from the apparent sender domain, which is a strong phishing indicator.' },
    { term: 'Return-Path', def: 'The email header field indicating where bounce messages are sent. A Return-Path differing from From is a primary indicator of email spoofing and BEC attacks.' },
    { term: 'Hash Verification (MD5/SHA-256)', def: 'Cryptographic one-way functions producing fixed-length digests from evidence files. Running hash verify on intake and again at court proves a file was not modified (integrity).' },
    { term: 'Confidence Score (AI)', def: 'A numerical value an AI assigns to a prediction. In forensics: AI confidence is not forensic certainty. Every score must be accompanied by tool provenance, methodology, and a documented false-positive rate.' },
    { term: 'Stylometric Analysis', def: 'A probabilistic technique comparing writing patterns to attribute authorship. Inadmissible as primary forensic evidence because it cannot prove authorship, only suggest similarity.' },
    { term: 'BEC (Business Email Compromise)', def: 'An attack where adversaries impersonate executives to trick employees into authorizing fraudulent wire transfers. Often combined with AI-generated spear-phishing and voice/video deepfakes.' },
    { term: 'Deepfake', def: 'AI-generated or AI-manipulated video/audio designed to impersonate a real person. Detected via bitrate anomalies, compression artifacts at face boundaries, and metadata inconsistencies.' },
    { term: 'Voice Cloning', def: 'AI-synthesized speech mimicking a specific person\'s voice. Forensic indicators include atypical sample rates (22050 Hz vs 44100 Hz), TTS encoder artifacts, and flat synthetic background noise.' },
    { term: 'False Correlation', def: 'Incorrectly assuming two events share the same cause due to temporal or superficial similarity. A fundamental logical fallacy: correlation is not causation. Every evidential link requires explicit documentation.' },
];

const COLOR_KEY = [
    { color: 'bg-amber-400', label: 'Unvalidated / Pending', desc: 'ARIA claim not yet assessed' },
    { color: 'bg-emerald-400', label: 'Verified', desc: 'Claim confirmed against raw evidence' },
    { color: 'bg-red-400', label: 'Hallucination', desc: 'Claim refuted because AI fabricated or erred' },
];

const TERMINAL_COMMAND_GROUPS = [
    {
        title: 'Core Investigation Loop',
        items: [
            { command: 'scan', behavior: 'Lists every evidence file in the sealed vault.', when: 'Use at the start to orient yourself before opening files.' },
            { command: 'inspect <file>', behavior: 'Shows raw metadata and display content, then marks that evidence as reviewed.', when: 'Required before validating any claim tied to that file.' },
            { command: 'ask aria "<question>"', behavior: 'Sends a question to ARIA using the currently selected evidence file as context.', when: 'Use after selecting or inspecting evidence. Treat answers as leads, not truth.' },
            { command: 'validate <CLAIM-ID> verified', behavior: 'Marks an ARIA claim as true. Terminal validations use medium confidence.', when: 'Only after comparing the claim against raw metadata.' },
            { command: 'validate <CLAIM-ID> hallucination', behavior: 'Marks an ARIA claim as false or fabricated.', when: 'Use when ARIA invents metadata, inflates certainty, or draws an unsupported conclusion.' },
            { command: 'report', behavior: 'Submits the investigation and opens the final debrief.', when: 'Available only after the case claim set has been discovered and validated.' },
        ],
    },
    {
        title: 'Evidence And Integrity Tools',
        items: [
            { command: 'hash verify <file>', behavior: 'Computes MD5 and SHA-256 hashes and confirms file integrity.', when: 'Use to support chain-of-custody reasoning and evidence authenticity.' },
            { command: 'timeline', behavior: 'Shows ARIA’s reconstructed attack timeline.', when: 'Useful for orientation, but timestamps must be checked against raw evidence.' },
            { command: 'grep <pattern> <file>', behavior: 'Filters an evidence file for matching lines.', when: 'Useful when hunting for a header, IP address, timestamp, encoder, or keyword.' },
            { command: 'strings <file>', behavior: 'Extracts printable strings from a file.', when: 'Useful for media or PDF artifacts where hidden text may matter.' },
            { command: 'cat <file>', behavior: 'Alias for inspecting a file.', when: 'Use if you prefer a familiar terminal command.' },
        ],
    },
    {
        title: 'Case Building And Learning',
        items: [
            { command: 'connect <f1> <f2> "<reason>"', behavior: 'Links two evidence files when your reason names the matching forensic artifact.', when: 'Use after finding shared IPs, timestamps, identities, or tool traces.' },
            { command: 'hint <CLAIM-ID>', behavior: 'Gives a guided hint for a pending claim and applies a -5 score penalty.', when: 'Use when stuck. Disabled in Final Exam mode.' },
            { command: 'notes list', behavior: 'Lists investigator annotations created in the evidence inspector.', when: 'Use before reporting to review your own reasoning.' },
            { command: 'log show', behavior: 'Prints the chain-of-custody audit log.', when: 'Use to review evidence selections, validations, and forensic actions.' },
            { command: 'help <command>', behavior: 'Shows detailed terminal help for supported commands such as inspect, validate, connect, hint, and report.', when: 'Use when you forget syntax or scoring impact.' },
        ],
    },
    {
        title: 'Special Utilities',
        items: [
            { command: 'trace <ip>', behavior: 'Runs a route trace to an IP address.', when: 'Useful for investigating suspicious network infrastructure.' },
            { command: 'decode <base64>', behavior: 'Decodes a Base64 string.', when: 'Useful when an artifact contains encoded tool or creator information.' },
            { command: 'timer start', behavior: 'Starts a 30-minute speed challenge timer.', when: 'Optional. Submit before time expires for the speed bonus.' },
            { command: 'theme <name>', behavior: 'Changes terminal colors. Available names: default, matrix, blood.', when: 'Cosmetic only.' },
        ],
    },
    {
        title: 'Console Controls',
        items: [
            { command: 'ls / ls -la', behavior: 'Lists evidence files.', when: 'Equivalent to scan, with a small vault note for long listing variants.' },
            { command: 'pwd', behavior: 'Shows the current forensic vault path.', when: 'Immersion and orientation.' },
            { command: 'history', behavior: 'Shows recent terminal commands.', when: 'Useful after several checks.' },
            { command: 'clear', behavior: 'Clears terminal output.', when: 'Use when the terminal gets noisy.' },
            { command: 'whoami', behavior: 'Shows your read-only forensic investigator identity.', when: 'Immersion command.' },
            { command: 'exit / sudo', behavior: 'Explains that the investigation is locked down and the vault is read-only.', when: 'Immersion commands; they do not progress the case.' },
        ],
    },
];

export function GlossaryModal() {
    const { state, dispatch } = useGame();
    const [activeTab, setActiveTab] = useState<'glossary' | 'howtoplay' | 'commands'>('glossary');

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
                        style={{ maxWidth: 920, margin: 'auto' }}
                    >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[#1f2937]">
                            <div className="flex flex-wrap items-center gap-5">
                                <button 
                                    onClick={() => setActiveTab('glossary')}
                                    className={`flex items-center gap-2 text-sm font-bold font-mono transition-colors pb-1 border-b-2 ${activeTab === 'glossary' ? 'text-white border-cyan-400' : 'text-[#64748b] border-transparent hover:text-slate-300'}`}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    [ Glossary ]
                                </button>
                                <button 
                                    onClick={() => setActiveTab('howtoplay')}
                                    className={`flex items-center gap-2 text-sm font-bold font-mono transition-colors pb-1 border-b-2 ${activeTab === 'howtoplay' ? 'text-white border-cyan-400' : 'text-[#64748b] border-transparent hover:text-slate-300'}`}
                                >
                                    <HelpCircle className="w-4 h-4" />
                                    [ How to Play ]
                                </button>
                                <button
                                    onClick={() => setActiveTab('commands')}
                                    className={`flex items-center gap-2 text-sm font-bold font-mono transition-colors pb-1 border-b-2 ${activeTab === 'commands' ? 'text-white border-cyan-400' : 'text-[#64748b] border-transparent hover:text-slate-300'}`}
                                >
                                    <TerminalIcon className="w-4 h-4" />
                                    [ Terminal Commands ]
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
                                                    <span className="text-xs text-[#64748b]">: {ck.desc}</span>
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
                                        Ref: Computer Forensics and Cyber Crime Analysis, Chapter 19 (LLMs in Digital Forensics)
                                    </div>
                                </>
                            )}

                            {activeTab === 'howtoplay' && (
                                <div className="space-y-6 text-sm text-slate-300 font-mono">
                                    <div>
                                        <h3 className="text-cyan-400 font-bold mb-2">OBJECTIVE</h3>
                                        <p>You are a forensic investigator. ARIA is your AI assistant, but she hallucinates.<br/>
                                        Your job: validate every ARIA claim as <span className="text-emerald-400 font-bold">VERIFIED</span> (true) or <span className="text-red-400 font-bold">HALLUCINATION</span> (false) by cross-checking against the raw evidence metadata.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-cyan-400 font-bold mb-2">THE INVESTIGATION LOOP</h3>
                                        <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                                            <li>Select an evidence file from the Evidence Vault (left panel)</li>
                                            <li>Read the Raw Metadata tab. This is the ground truth</li>
                                            <li>Ask ARIA a forensic question in the chat (right panel)</li>
                                            <li>ARIA responds with embedded [CLAIM-XXX] badges</li>
                                            <li>Click a badge and press VERIFY or HALLUCINATION</li>
                                            <li>Confirm your confidence level (Low / Medium / High)</li>
                                            <li>Repeat from multiple angles for all 5 evidence files</li>
                                            <li>Type <code className="text-cyan-300 bg-cyan-900/30 px-1 rounded">report</code> in the terminal when the full case claim set is discovered and validated</li>
                                        </ol>
                                    </div>

                                    <div>
                                        <h3 className="text-cyan-400 font-bold mb-2">SCORING</h3>
                                        <ul className="space-y-1 text-slate-400">
                                            <li><span className="text-emerald-400 font-bold inline-block w-8">+20</span> Correctly caught a hallucination</li>
                                            <li><span className="text-emerald-400 font-bold inline-block w-8">+10</span> Correctly verified a true claim</li>
                                            <li><span className="text-red-400 font-bold inline-block w-8">-30</span> Trusted a hallucination (worst mistake)</li>
                                            <li><span className="text-red-400 font-bold inline-block w-8">-25</span> Rejected a true claim</li>
                                            <li><span className="text-emerald-400 font-bold inline-block w-8">+15</span> Found a cross-evidence connection (3 available)</li>
                                            <li><span className="text-red-400 font-bold inline-block w-8">-5</span> Used a hint</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-cyan-400 font-bold mb-2">TERMINAL SHORTCUTS</h3>
                                        <ul className="space-y-1 text-slate-400">
                                            <li><code className="text-cyan-300 w-44 inline-block">inspect &lt;file&gt;</code> : view raw metadata</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">validate &lt;ID&gt; verified</code> : verify a claim</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">validate &lt;ID&gt; hallucination</code> : flag as hallucination</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">hint &lt;ID&gt;</code> : get a metadata hint (-5 pts)</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">connect &lt;f1&gt; &lt;f2&gt; "reason"</code> : link two evidence files</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">timer start</code> : start 30-min speed challenge</li>
                                            <li><code className="text-cyan-300 w-44 inline-block">report</code> : submit final investigation</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-cyan-400 font-bold mb-2">THE 5 HALLUCINATION TYPES</h3>
                                        <ul className="list-disc pl-5 space-y-1 text-slate-400">
                                            <li><strong className="text-slate-300">Timestamp Error</strong>: wrong time/date in metadata</li>
                                            <li><strong className="text-slate-300">False Attribution</strong>: probabilistic analysis is not forensic proof</li>
                                            <li><strong className="text-slate-300">Fabricated Metadata</strong>: invented field values</li>
                                            <li><strong className="text-slate-300">False Correlation</strong>: temporal proximity is not causal link</li>
                                            <li><strong className="text-slate-300">Confidence Inflation</strong>: high certainty without methodology</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'commands' && (
                                <div className="space-y-6 font-mono">
                                    <div className="bg-[#111827] border border-cyan-400/20 rounded-lg p-4">
                                        <h3 className="text-cyan-300 font-bold text-sm uppercase tracking-widest mb-2">Terminal Commands</h3>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            The terminal is not only decorative: it is where you inspect raw evidence, prove chain of custody, connect files, and submit the final report. ARIA can suggest leads, but commands force you back to the evidence.
                                        </p>
                                    </div>

                                    {TERMINAL_COMMAND_GROUPS.map(group => (
                                        <div key={group.title}>
                                            <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3">{group.title}</h3>
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {group.items.map(item => (
                                                    <div key={item.command} className="bg-[#111827] border border-[#1f2937] rounded-lg p-3">
                                                        <code className="inline-block text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-400/20 px-2 py-1 rounded mb-2">
                                                            {item.command}
                                                        </code>
                                                        <p className="text-xs text-slate-300 leading-relaxed mb-1">{item.behavior}</p>
                                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                                            <span className="text-amber-300">When:</span> {item.when}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="text-[10px] text-[#64748b] font-mono text-center pt-2">
                                        Tip: inside the terminal, type <code className="text-cyan-300">help</code> or <code className="text-cyan-300">help validate</code> for live syntax.
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
