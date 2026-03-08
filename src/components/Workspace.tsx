import { useGame } from '../context/GameContext';
import { Evidence } from '../types/game';
import evidenceData from '../data/evidence.json';
import connectionsData from '../data/connections.json';
import { ClaimBadgeList } from './ClaimBadge';
import { Hash, FileSearch, AlertTriangle, Edit2, Save, X, Link } from 'lucide-react';
import { useState } from 'react';
import { AttackTimeline } from './AttackTimeline';

const evidenceList = evidenceData as Evidence[];

export function Workspace({ glitching }: { glitching?: boolean }) {
    const { state, dispatch } = useGame();
    const { selectedEvidenceId, allClaims, verdicts, notes, foundConnections } = state;
    
    const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'timeline'>('content');
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editNote, setEditNote] = useState('');
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const toggleRow = (k: string) => {
        setExpandedRows(prev => ({ ...prev, [k]: !prev[k] }));
    };

    const handleSaveNote = (k: string) => {
        if (!selectedEvidenceId) return;
        dispatch({
            type: 'ADD_NOTES',
            evidenceId: selectedEvidenceId,
            fieldName: k,
            note: editNote
        });
        setEditingField(null);
    };

    const evidence = evidenceList.find(e => e.id === selectedEvidenceId);

    // Collect claims for this evidence
    const evidenceClaims = Object.values(allClaims).filter(
        c => c.evidenceRef === selectedEvidenceId
    );
    
    // Find active connections for this evidence
    const activeConnections = connectionsData.filter(c => 
        foundConnections.includes(c.id) && c.files.includes(selectedEvidenceId || '')
    );

    return (
        <div className={`flex-1 flex flex-col h-full bg-[#0a0e17] overflow-hidden ${glitching ? 'glitch-anim' : ''}`}>
            {/* Header and Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-b border-[#1f2937] bg-[#0d1420]">
                {evidence ? (
                    <div className="flex items-center gap-3 min-w-0">
                        <FileSearch className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="font-mono text-sm text-cyan-300 font-medium truncate">{evidence.filename}</span>
                        <span className="text-[10px] text-[#475569] font-mono px-1.5 py-0.5 bg-[#111827] border border-[#1f2937] rounded uppercase flex-shrink-0">
                            {evidence.type}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 opacity-50 min-w-0">
                        <FileSearch className="w-4 h-4 text-[#475569] flex-shrink-0" />
                        <span className="font-mono text-sm text-[#475569] font-medium truncate">No Evidence Selected</span>
                    </div>
                )}

                <div className="flex gap-1 bg-[#0a0e17] p-1 rounded-lg border border-[#1f2937] overflow-x-auto custom-scrollbar flex-shrink-0">
                    <button 
                        onClick={() => setActiveTab('content')} 
                        disabled={!evidence}
                        className={`text-[10px] sm:text-xs font-mono px-3 py-1.5 rounded transition-colors whitespace-nowrap ${activeTab === 'content' ? 'bg-[#1f2937] text-cyan-300' : 'text-slate-500 hover:text-cyan-400 disabled:opacity-30'}`}
                    >
                        Content Preview
                    </button>
                    <button 
                        onClick={() => setActiveTab('metadata')} 
                        disabled={!evidence}
                        className={`text-[10px] sm:text-xs font-mono px-3 py-1.5 rounded transition-colors whitespace-nowrap ${activeTab === 'metadata' ? 'bg-[#1f2937] text-cyan-300' : 'text-slate-500 hover:text-cyan-400 disabled:opacity-30'}`}
                    >
                        Raw Metadata
                    </button>
                    <button 
                        onClick={() => setActiveTab('timeline')} 
                        className={`text-[10px] sm:text-xs font-mono px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'timeline' ? 'bg-amber-900/30 text-amber-400' : 'text-amber-500/70 hover:text-amber-400'}`}
                    >
                        ⚡ Attack Timeline
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full relative">
                
                {activeTab === 'timeline' && <AttackTimeline />}
                
                {!evidence && activeTab !== 'timeline' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
                        <FileSearch className="w-12 h-12 text-[#1f2937] mb-4" />
                        <p className="text-[#374151] font-mono text-sm">No evidence selected</p>
                        <p className="text-[#1f2937] text-xs mt-1 font-mono">
                            Select a file from the Evidence Vault to begin analysis
                        </p>
                    </div>
                )}

                {/* Display content */}
                {evidence && activeTab === 'content' && (
                <div className="px-4 pt-4 pb-6">
                    {evidence.id === 'audio_call' ? (
                        <div className="bg-[#0d1420] border border-[#1f2937] rounded-lg overflow-hidden flex flex-col">
                            {/* SVG Waveform */}
                            <div className="h-32 bg-[#0a0e17] relative flex items-center px-4 border-b border-[#1f2937]">
                                <div className="absolute left-[15%] top-0 bottom-0 w-px bg-cyan-400 z-10 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                                {/* Left normal waveform */}
                                <div className="flex-1 flex items-center justify-between gap-[2px] h-16 opacity-70">
                                    {Array.from({ length: 20 }).map((_, i) => (
                                        <div key={`l-${i}`} className="w-1 bg-cyan-600 rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
                                    ))}
                                </div>
                                {/* Anomaly region */}
                                <div className="w-1/3 flex items-center justify-between gap-[2px] h-16 bg-amber-900/20 border-x border-dashed border-amber-500/50 px-2 relative group">
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-mono text-amber-500 whitespace-nowrap bg-[#0d1420] px-2 py-0.5 border border-amber-500/30 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        ⚠ TTS Synthesis Artifact (0:42–1:58)
                                    </div>
                                    <div className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-mono text-amber-500/70">UNIFORM AMPLITUDE</div>
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <div key={`a-${i}`} className="w-1 bg-amber-500/80" style={{ height: '70%', borderRadius: '1px' }}></div>
                                    ))}
                                </div>
                                {/* Right normal waveform */}
                                <div className="flex-1 flex items-center justify-between gap-[2px] h-16 opacity-70">
                                    {Array.from({ length: 15 }).map((_, i) => (
                                        <div key={`r-${i}`} className="w-1 bg-cyan-600 rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
                                    ))}
                                </div>
                            </div>
                            {/* Metadata Pills */}
                            <div className="flex bg-[#111827] border-b border-[#1f2937] p-2 gap-3 text-[10px] font-mono text-slate-400">
                                <span className="px-2 py-0.5 bg-[#0d1420] border border-[#1f2937] rounded">Duration: 2:14</span>
                                <span className="px-2 py-0.5 bg-[#0d1420] border border-[#1f2937] rounded">Sample Rate: 22,050 Hz</span>
                                <span className="px-2 py-0.5 bg-[#0d1420] border border-[#1f2937] rounded">Encoder: LAME 3.100</span>
                                <span className="px-2 py-0.5 bg-amber-900/20 border border-amber-500/30 text-amber-400 rounded ml-auto flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    TTS Pipeline Artifact Detected
                                </span>
                            </div>
                            {/* Transcript */}
                            <div className="p-4 bg-[#0a0e17] text-xs font-mono text-emerald-400/80 leading-relaxed">
                                <span className="text-slate-500 mr-3">[00:00]</span>"Luca, it's Marco. Listen, I need you to move fast on this.<br/>
                                <span className="text-slate-500 mr-3">[00:08]</span>Legal has cleared the NovaPay transfer. Two point three million.<br/>
                                <span className="text-slate-500 mr-3">[00:15]</span>I know it's unusual but this is time-sensitive — do NOT discuss<br/>
                                <span className="text-slate-500 mr-3">[00:22]</span>with anyone until it clears. I'll explain everything tomorrow.<br/>
                                <span className="text-slate-500 mr-3">[00:31]</span>Process it now. Reference PROJ-ALPHA-SEC. Trust me on this."<br/>
                                <span className="text-slate-500 mr-3 mt-2 block">[02:14]</span><span className="text-slate-600">[END OF RECORDING]</span>
                            </div>
                            {/* Forensic Note */}
                            <div className="p-3 bg-amber-900/10 border-t border-amber-900/30 text-[10px] font-mono text-amber-200/80 leading-relaxed">
                                <AlertTriangle className="w-3 h-3 inline mr-1.5 -mt-0.5 text-amber-500" />
                                <span className="font-bold text-amber-500">FORENSIC NOTE:</span> Formant transitions at 0:08–0:12 show spectral discontinuities inconsistent with natural speech. Background noise spectrum is synthetically flat (no room acoustics). Consistent with neural TTS pipeline output. Recommendation: cross-reference creation timestamp with network logs.
                            </div>
                        </div>
                    ) : evidence.id === 'teams_meeting' ? (
                        <div className="bg-[#0d1420] border border-[#1f2937] rounded-lg overflow-hidden flex flex-col">
                            {/* Fake Video Frame */}
                            <div className="aspect-video bg-[#111827] relative flex flex-col border-b border-[#1f2937]">
                                <div className="h-8 bg-[#1f2937]/50 flex items-center px-3 justify-between border-b border-[#1f2937]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="text-xs text-slate-300 font-sans">Marco Rossi</span>
                                    </div>
                                    <span className="text-xs text-slate-500 font-sans">TechCorp Teams</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                                    <div className="w-32 h-32 bg-slate-700 rounded-full mb-8 relative z-10"></div>
                                    <div className="w-64 h-32 bg-slate-700 rounded-t-3xl absolute bottom-0 z-10"></div>
                                    
                                    {/* Facial Anomaly Box */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-48 border-2 border-dashed border-red-500 bg-red-500/10 z-20 flex flex-col items-center justify-start pt-2">
                                        <div className="bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-sm">FACIAL REGION</div>
                                        <div className="text-red-300 text-[8px] mt-1 bg-black/50 px-1 rounded">Compression anomaly</div>
                                    </div>

                                    {/* Corner Badge */}
                                    <div className="absolute bottom-3 right-3 bg-red-900/80 border border-red-500/50 text-red-200 text-[9px] font-mono px-2 py-1 rounded flex items-center gap-1.5 shadow-lg z-30">
                                        <AlertTriangle className="w-3 h-3 text-red-400" />
                                        DEEPFAKE ARTIFACT — Blocking visible at face boundary edges (frames 142–891)
                                    </div>
                                </div>
                                <div className="h-10 bg-[#0a0e17] flex items-center justify-center gap-4 text-[10px] font-mono text-slate-400 border-t border-[#1f2937]">
                                    <span>teams_meeting.mp4</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                    <span>04:07</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                    <span>H.264</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                    <span>1280×720 @ 25fps</span>
                                </div>
                            </div>
                            {/* Bitrate Chart */}
                            <div className="p-4 bg-[#0a0e17]">
                                <div className="text-[10px] font-mono text-[#64748b] font-bold uppercase tracking-widest mb-4">Regional Bitrate Analysis</div>
                                <div className="flex items-end gap-8 h-32 px-4 relative">
                                    <div className="absolute top-20 left-4 right-4 border-b border-dashed border-slate-600 z-0"></div>
                                    <div className="absolute top-16 right-4 text-[9px] font-mono text-slate-500 z-0">Expected uniform bitrate</div>
                                    
                                    <div className="relative z-10 flex flex-col items-center gap-2 flex-1">
                                        <div className="w-16 bg-emerald-500/80 rounded-t-sm h-12 flex items-end justify-center pb-2">
                                            <span className="text-[10px] font-mono font-bold text-slate-900">1.2M</span>
                                        </div>
                                        <div className="text-[9px] font-mono text-slate-400">Background Range</div>
                                    </div>
                                    
                                    <div className="relative z-10 flex flex-col items-center gap-2 flex-1">
                                        <div className="w-16 bg-red-500/80 rounded-t-sm h-full flex items-end justify-center pb-2 relative">
                                            <div className="absolute -top-6 text-[10px] font-mono font-bold text-red-400 whitespace-nowrap">~3.1x Variance</div>
                                            <span className="text-[10px] font-mono font-bold text-slate-900">3.8M</span>
                                        </div>
                                        <div className="text-[9px] font-mono text-slate-400">Facial Region</div>
                                    </div>
                                </div>
                                <div className="mt-4 text-[10px] font-mono text-slate-400 border-l-2 border-[#334155] pl-3 py-1">
                                    Facial region bitrate is 3.1× higher than the background — a classic deepfake insertion artifact. A uniform single-pass encode would not show this discrepancy.
                                </div>
                            </div>
                        </div>
                    ) : evidence.id === 'invoice_fraud' ? (
                        <div className="flex flex-col gap-4">
                            {/* Styled PDF container */}
                            <div className="bg-[#f8f9fa] rounded shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-[#e5e7eb] p-8 text-slate-800 font-serif relative overflow-hidden" style={{ minHeight: '320px' }}>
                                {/* Subtle noise/texture effect */}
                                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
                                
                                <div className="flex justify-between items-start mb-8 border-b-2 border-slate-300 pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight text-slate-900">NovaPay Solutions GmbH</h2>
                                        <div className="text-xs text-slate-600 mt-1">Bahnhofstraße 42, 10115 Berlin<br/>VAT: DE 299 123 456</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold tracking-widest text-slate-500">INVOICE</div>
                                        <div className="text-sm font-mono mt-1 font-medium text-slate-800">#INV-2026-447</div>
                                    </div>
                                </div>
                                
                                <div className="mb-8">
                                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Bill To:</div>
                                    <div className="text-sm"><strong>TechCorp S.p.A.</strong><br/>Via Roma 15, 20121 Milano</div>
                                </div>
                                
                                <table className="w-full text-sm mb-8">
                                    <thead>
                                        <tr className="border-b border-slate-300 text-slate-500 text-xs uppercase">
                                            <th className="text-left font-normal pb-2">Description</th>
                                            <th className="text-center font-normal pb-2 w-16">Qty</th>
                                            <th className="text-right font-normal pb-2 w-32">Unit Price</th>
                                            <th className="text-right font-normal pb-2 w-32">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="py-3">Strategic Consulting Services</td>
                                            <td className="py-3 text-center">1</td>
                                            <td className="py-3 text-right">€2,312,450.00</td>
                                            <td className="py-3 text-right font-bold">€2,312,450.00</td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <div className="flex justify-between items-end border-t border-slate-300 pt-4">
                                    <div className="text-xs text-slate-600 leading-relaxed">
                                        <strong>IBAN:</strong> DE89 3704 0044 0532 0130 00<br/>
                                        <strong>Bank:</strong> DKB — Deutsche Kreditbank AG<br/>
                                        <strong>Payment terms:</strong> IMMEDIATE
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Total Due</div>
                                        <div className="text-xl font-bold text-slate-900 tracking-tight">€2,312,450.00</div>
                                    </div>
                                </div>
                                
                                <div className="mt-12 text-center text-sm italic font-bold text-red-600 border border-red-200 bg-red-50 py-2">
                                    [ No digital signature block present in document ]
                                </div>
                            </div>
                            {/* Annotations */}
                            <div className="bg-[#0d1420] border border-[#1f2937] rounded-lg p-3 space-y-2">
                                <div className="flex gap-2 items-start text-[10px] font-mono">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300"><strong>Creator Tool:</strong> AutoDoc AI Writer v2.1 — <span className="text-amber-400">Not a standard accounting platform.</span></span>
                                </div>
                                <div className="flex gap-2 items-start text-[10px] font-mono">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300"><strong>Timeline:</strong> Created 14:01:22Z → Modified 14:15:44Z <span className="text-amber-400">(14 min 22 sec gap implies manual post-edit).</span></span>
                                </div>
                                <div className="flex gap-2 items-start text-[10px] font-mono">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-300"><strong>Signature:</strong> No XMP metadata. No signature. <span className="text-red-400 font-bold">Document cryptographic integrity cannot be verified.</span></span>
                                </div>
                            </div>
                        </div>
                    ) : evidence.id === 'network_logs' ? (
                        <div className="bg-[#0a0e17] border border-[#1f2937] rounded-lg overflow-hidden flex flex-col">
                            {/* Log header */}
                            <div className="bg-[#111827] border-b border-[#1f2937] px-3 py-2 flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                <span>var/log/asa/firewall.log</span>
                                <span>TechCorp ASA-5516-X</span>
                            </div>
                            {/* Grid of logs */}
                            <div className="p-4 text-[11px] font-mono leading-relaxed bg-[#0a0e17] overflow-x-auto space-y-1">
                                <div className="text-slate-500 line-through">... 814 lines omitted ...</div>
                                <div className="text-slate-400"><span className="text-slate-600 w-20 inline-block">01:58:12</span> ALLOW  OUT  192.168.1.88 → <span className="text-cyan-600">91.200.81.47:443</span>     HTTPS</div>
                                <div className="text-slate-400"><span className="text-slate-600 w-20 inline-block">02:01:55</span> ALLOW  OUT  192.168.1.88 → <span className="text-cyan-600">45.33.32.156:443</span>     HTTPS</div>
                                <div className="text-cyan-700"><span className="text-slate-600 w-20 inline-block">02:05:11</span> ALLOW  OUT  192.168.1.88 → 9.9.9.9:53             DNS   [query: mailer-svc-eu7.xyz]</div>
                                <div className="text-slate-400"><span className="text-slate-600 w-20 inline-block">02:07:30</span> ALLOW  OUT  192.168.1.88 → <span className="text-cyan-600">91.200.81.47:443</span>     HTTPS <span className="text-slate-500">[1.2 MB↑]</span></div>
                                <div className="text-amber-500 font-bold bg-amber-900/10 -mx-4 px-4 py-0.5"><span className="text-amber-600/50 w-20 inline-block font-normal">02:11:44</span> ⚠ ALERT OUT  192.168.1.88 → <span className="text-amber-400">185.220.101.42:443</span> HTTPS <span className="bg-amber-500/20 px-1 rounded ml-2">[4.1 MB↑ ANOMALY]</span></div>
                                <div className="text-slate-400"><span className="text-slate-600 w-20 inline-block">02:14:22</span> ALLOW  OUT  192.168.1.88 → <span className="text-cyan-600">91.200.81.47:443</span>     HTTPS</div>
                                <div className="text-red-400 font-bold bg-red-900/20 -mx-4 px-4 py-1.5 flex justify-between items-center"><div className="whitespace-nowrap"><span className="text-red-600/50 w-20 inline-block font-normal">02:14:33</span> 🔴 ALLOW OUT  192.168.1.88 → <span className="text-red-300">45.33.32.156:9001</span> ...</div><span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded tracking-widest whitespace-nowrap">TOR EXIT NODE</span></div>
                                <div className="text-red-500 bg-red-900/10 -mx-4 px-4 py-0.5 flex justify-between items-center"><div className="whitespace-nowrap"><span className="text-red-600/50 w-20 inline-block font-normal">02:14:33</span>    ... session transfer continuing ...</div><span className="text-[9px] border border-red-500/50 text-red-400 px-2 py-0.5 rounded tracking-widest bg-[#0a0e17] whitespace-nowrap">⚠ 4.7MB EXFILTRATION</span></div>
                                <div className="text-slate-400"><span className="text-slate-600 w-20 inline-block">02:19:05</span> BLOCK  OUT  192.168.1.88 → 10.0.0.1:22            SSH   <span className="text-slate-500">(internal attempt)</span></div>
                                <div className="text-cyan-700"><span className="text-slate-600 w-20 inline-block">02:22:18</span> ALLOW  OUT  192.168.1.88 → 8.8.8.8:53             DNS   [query: pool.ntp.org]</div>
                                <div className="text-slate-500 line-through">... 12 hours later ...</div>
                                <div className="text-slate-400"><span className="text-slate-600 w-20 inline-block">14:32:07</span> ALLOW  IN   <span className="text-cyan-600">91.200.81.47</span> → mx.techcorp.com:25     SMTP  <span className="text-slate-500">[email_1 received]</span></div>
                                <div className="text-slate-500 line-through">... EOF ...</div>
                            </div>
                            {/* Legend / Timeline */}
                            <div className="bg-[#111827] border-t border-[#1f2937] p-4">
                                <div className="text-[10px] font-mono text-[#64748b] font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                                    Attack Timeline (02:00 window)
                                </div>
                                <div className="relative h-12 flex items-center font-mono text-[9px]">
                                    <div className="absolute left-0 right-0 h-px bg-slate-700 top-1/2"></div>
                                    
                                    <div className="absolute left-0 flex flex-col items-center -translate-y-1/2 bg-[#111827] pr-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mb-1"></div>
                                        <span className="text-slate-500">00:00</span>
                                    </div>
                                    
                                    <div className="absolute left-[35%] flex flex-col items-center">
                                        <div className="text-amber-400 font-bold mb-1 border border-amber-500/30 bg-[#111827] px-1 rounded whitespace-nowrap">⚠ 02:11 Outbound</div>
                                        <div className="w-2 h-2 rounded-full border-2 border-[#111827] bg-amber-500 relative z-10"></div>
                                    </div>
                                    
                                    <div className="absolute left-[55%] flex flex-col items-center">
                                        <div className="text-red-400 font-bold mb-1 border border-red-500/30 bg-[#111827] px-1 rounded whitespace-nowrap">🔴 02:14 Tor + Exfil</div>
                                        <div className="w-2.5 h-2.5 rounded-full border-2 border-[#111827] bg-red-500 relative z-10"></div>
                                        <div className="absolute top-full mt-1 text-red-500/70 border-l border-slate-600 pl-1 -translate-x-full">↑ 4.7 MB Data</div>
                                    </div>

                                    <div className="absolute right-0 flex flex-col items-center -translate-y-1/2 bg-[#111827] pl-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mb-1"></div>
                                        <span className="text-slate-500">23:59</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <pre className="text-xs font-mono text-slate-300 bg-[#0d1420] border border-[#1f2937] rounded-lg p-4 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                            {evidence.displayContent}
                        </pre>
                    )}
                </div>
                )}

                {/* Raw metadata */}
                {evidence && activeTab === 'metadata' && (
                <>
                <div className="px-4 pt-4 pb-2">
                    {activeConnections.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {activeConnections.map(conn => (
                                <div key={conn.id} className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Link className="w-4 h-4 text-blue-400" />
                                        <span className="text-xs font-mono font-bold text-blue-300">
                                            Established Cross-Reference: {conn.files.join(' ↔ ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-blue-200/80 font-mono ml-6">{conn.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Raw Metadata (Ground Truth)
                    </div>
                    <div className="bg-[#0d1420] border border-[#1f2937] rounded-lg overflow-hidden">
                        {Object.entries(evidence.rawMetadata).map(([k, v]) => {
                            const isBad = v.toLowerCase().includes('fail') ||
                                v.toLowerCase().includes('absent') ||
                                v.toLowerCase().includes('alert') ||
                                v.toLowerCase().includes('anomaly') ||
                                v.toLowerCase().includes('mismatch');

                            const refClaims = evidenceClaims.filter(c => c.metadataFields?.includes(k));
                            let leftBorder = 'border-l-4 border-transparent';
                            if (refClaims.length > 0) {
                                let correctCount = 0;
                                let incorrectCount = 0;
                                refClaims.forEach(c => {
                                    const verdictObj = verdicts[c.id];
                                    if (verdictObj && verdictObj !== 'pending') {
                                        const correct = (c.isHallucination && verdictObj.verdict === 'hallucination') || (!c.isHallucination && verdictObj.verdict === 'verified');
                                        if (correct) correctCount++;
                                        else incorrectCount++;
                                    }
                                });
                                if (correctCount > 0 && incorrectCount === 0) leftBorder = 'border-l-4 border-emerald-500';
                                else if (incorrectCount > 0 && correctCount === 0) leftBorder = 'border-l-4 border-red-500';
                                else if (correctCount > 0 && incorrectCount > 0) leftBorder = 'border-l-4 border-amber-500';
                            }

                            const note = notes?.[evidence.id]?.[k];
                            const isEditing = editingField === k;
                            const isExpanded = expandedRows[k];

                            return (
                                <div key={k} className={`flex flex-col border-b border-[#1f2937] last:border-b-0 ${leftBorder}`}>
                                    <div 
                                        className="flex gap-0 text-xs font-mono group cursor-pointer hover:bg-[#111827] transition-colors"
                                        onClick={() => toggleRow(k)}
                                    >
                                        <div className="px-3 py-1.5 text-[#64748b] min-w-0 w-2/5 flex-shrink-0 border-r border-[#1f2937] bg-[#0d1117] flex items-center justify-between">
                                            <span>{k}</span>
                                            {refClaims.length > 0 && (
                                                <span className="text-[9px] bg-cyan-900/30 text-cyan-400 px-1 py-0.5 rounded ml-2 border border-cyan-800/50">
                                                    {refClaims.length} Claim{refClaims.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`px-3 py-1.5 flex-1 min-w-0 break-words flex items-center justify-between ${isBad ? 'text-red-400' : 'text-slate-300'}`}>
                                            <span>{v}</span>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                {note && <span className="text-[10px] text-amber-500 mr-2 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded truncate max-w-[100px]" title={note}>✏ Note</span>}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingField(k);
                                                        setEditNote(note || '');
                                                    }}
                                                    className="p-1 hover:bg-[#1f2937] text-slate-400 hover:text-cyan-400 rounded"
                                                    title="Add Note"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inline note editor */}
                                    {isEditing && (
                                        <div className="p-2 border-t border-[#1f2937] bg-[#0f172a]" onClick={e => e.stopPropagation()}>
                                            <div className="flex gap-2">
                                                <input
                                                    autoFocus
                                                    value={editNote}
                                                    onChange={e => setEditNote(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleSaveNote(k);
                                                        if (e.key === 'Escape') setEditingField(null);
                                                    }}
                                                    className="flex-1 bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-500/50"
                                                    placeholder={`Note for ${k}... (saved to case log)`}
                                                />
                                                <button onClick={() => handleSaveNote(k)} className="p-1.5 bg-emerald-900/40 text-emerald-400 hover:bg-emerald-800/60 rounded border border-emerald-800/50">
                                                    <Save className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setEditingField(null)} className="p-1.5 bg-red-900/40 text-red-400 hover:bg-red-800/60 rounded border border-red-800/50">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Expanded referencing claims popover/details */}
                                    {isExpanded && refClaims.length > 0 && (
                                        <div className="p-3 bg-[#0d1420] border-t border-[#1f2937] shadow-inner text-xs font-mono">
                                            <div className="text-[#64748b] mb-1.5 font-bold uppercase tracking-widest text-[10px]">Referencing Claims</div>
                                            {refClaims.map(c => {
                                                const verdictObj = verdicts[c.id];
                                                const isPend = verdictObj === 'pending' || !verdictObj;
                                                const vText = isPend ? 'PENDING' : verdictObj.verdict.toUpperCase();
                                                const correct = !isPend && (
                                                    (c.isHallucination && verdictObj.verdict === 'hallucination') ||
                                                    (!c.isHallucination && verdictObj.verdict === 'verified')
                                                );
                                                return (
                                                    <div key={c.id} className="flex items-center gap-2 mb-1 last:mb-0">
                                                        <span className="text-cyan-400 font-bold w-16">{c.id}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border custom-verdict-badge ${isPend ? 'bg-amber-900/20 text-amber-400 border-amber-800/30' : verdictObj.verdict === 'verified' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/30' : 'bg-red-900/20 text-red-400 border-red-800/30'}`}>
                                                            {vText}
                                                        </span>
                                                        {!isPend && (
                                                            <span className={correct ? 'text-emerald-400 font-bold ml-auto' : 'text-red-400 font-bold ml-auto'}>
                                                                {correct ? '✓ Correct' : '✗ Incorrect'}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Hash values */}
                <div className="px-4 pb-2">
                    <div className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Cryptographic Hashes
                    </div>
                    <div className="bg-[#0d1420] border border-[#1f2937] rounded-lg p-3 space-y-1.5">
                        <div className="flex gap-2 text-xs font-mono">
                            <span className="text-[#64748b] w-16 flex-shrink-0">MD5</span>
                            <span className="text-amber-300 break-all">{evidence.hash.md5}</span>
                        </div>
                        <div className="flex gap-2 text-xs font-mono">
                            <span className="text-[#64748b] w-16 flex-shrink-0">SHA-256</span>
                            <span className="text-amber-300 break-all">{evidence.hash.sha256}</span>
                        </div>
                    </div>
                </div>

                {/* Claim badges */}
                {evidenceClaims.length > 0 && (
                    <div className="px-4 pb-4">
                        <ClaimBadgeList
                            claims={evidenceClaims}
                            title={`ARIA Claims (${evidenceClaims.length})`}
                        />
                    </div>
                )}

                {evidenceClaims.length === 0 && (
                    <div className="px-4 pb-4">
                        <div className="text-xs font-mono text-[#374151] border border-dashed border-[#1f2937] rounded-lg p-3 text-center">
                            No ARIA claims yet for this file. Ask ARIA about it in the chat panel.
                        </div>
                    </div>
                )}
                </>
                )}
            </div>
        </div>
    );
}
