import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { AlertTriangle, Link2 } from 'lucide-react';

const TIMELINE_EVENTS = [
  {
    id: 'e1',
    time: '2026-03-03  09:15 AM',
    evidenceId: 'invoice_fraud',
    label: 'Fraudulent invoice created',
    detail: 'AutoDoc AI Writer v2.1 generates invoice #INV-2026-447 for €2,312,450',
    type: 'artifact_created',
    anomaly: false,
  },
  {
    id: 'e2',
    time: '2026-03-03  09:29 AM',
    evidenceId: 'invoice_fraud',
    label: 'Invoice modified',
    detail: '14-minute edit gap — consistent with manual field adjustment after AI generation',
    type: 'artifact_modified',
    anomaly: true,
  },
  {
    id: 'e3',
    time: '2026-03-03  14:32 UTC',
    evidenceId: 'email_1',
    label: 'Spear-phishing email sent',
    detail: 'SPF FAIL, DKIM FAIL. Return-Path spoofed. Originating IP: 91.200.81.47',
    type: 'attack_action',
    anomaly: true,
  },
  {
    id: 'e4',
    time: '2026-03-03  (evening)',
    evidenceId: 'audio_call',
    label: 'Voice-cloned call placed',
    detail: 'TTS-generated audio, 22,050 Hz sample rate. Created at 02:14 AM local',
    type: 'attack_action',
    anomaly: true,
  },
  {
    id: 'e5',
    time: '2026-03-04  09:22 UTC',
    evidenceId: 'teams_meeting',
    label: 'Deepfake Teams meeting held',
    detail: 'OBS encoder. Facial bitrate 3× background. No GPS/EXIF data.',
    type: 'attack_action',
    anomaly: true,
  },
  {
    id: 'e6',
    time: '2026-03-04  02:11 AM',
    evidenceId: 'network_logs',
    label: 'Anomalous outbound connection',
    detail: 'Internal host 10.1.5.23 initiates outbound to unknown endpoint',
    type: 'network_event',
    anomaly: true,
  },
  {
    id: 'e7',
    time: '2026-03-04  02:14 AM',
    evidenceId: 'network_logs',
    label: '🔴 Data exfiltration via Tor',
    detail: 'Connection to Tor exit node 185.220.101.42. 4.7 MB transferred. IP 91.200.81.47 present in email headers.',
    type: 'exfiltration',
    anomaly: true,
  },
];

export function AttackTimeline() {
    const { state, dispatch } = useGame();

    const handleSelect = (evidenceId: string) => {
        dispatch({ type: 'SELECT_EVIDENCE', evidenceId });
    };

    // Check if a specific connection ID has been found and verified
    const hasConnection = (file1: string, file2: string) => {
        return state.foundConnections.some(connId => 
            (connId.includes(file1.split('.')[0]) && connId.includes(file2.split('.')[0])) ||
            (connId === 'conn_email_ip' && file1 === 'email_1' && file2 === 'network_logs') ||
            (connId === 'conn_audio_exfil' && file1 === 'audio_call' && file2 === 'network_logs') ||
            (connId === 'conn_invoice_tor' && file1 === 'invoice_fraud' && file2 === 'network_logs')
        );
    };

    const emailIpFound = hasConnection('email_1', 'network_logs');
    const audioTimeFound = hasConnection('audio_call', 'network_logs');
    
    return (
        <div className="h-full bg-[#0a0e17] overflow-y-auto custom-scrollbar p-6 font-mono relative">
            {/* Header */}
            <div className="mb-8 border-b border-[#1f2937] pb-4">
                <h2 className="text-cyan-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    <span>⚡ ATTACK TIMELINE</span>
                    <span className="text-slate-500 font-normal">| TechCorp S.p.A. Incident | Mar 3–4, 2026 | {TIMELINE_EVENTS.length} events reconstructed</span>
                </h2>
                <div className="text-xs text-slate-500 mt-2">
                    A visual reconstruction of the attack chain based on recovered evidence metadata.
                </div>
            </div>

            <div className="relative pl-8 max-w-4xl pb-12">
                {/* Main vertical axis line */}
                <div className="absolute top-2 bottom-0 left-[21px] w-px bg-slate-800" />

                {/* Connection lines (SVG overlay) */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" opacity="0.6"/>
                        </marker>
                    </defs>
                    {/* Draw SVG connection lines backwards if connections are found. 
                        Since we can't easily calculate exact Y coordinates in standard React without refs, 
                        we'll just use CSS absolute positioning on the connection callout boxes themselves, 
                        which will look nicer anyways. */}
                </svg>

                <div className="space-y-8 relative z-10">
                    {TIMELINE_EVENTS.map((event, index) => {
                        const isExfil = event.type === 'exfiltration';
                        const dotColor = isExfil ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : event.anomaly ? 'bg-amber-500' : 'bg-cyan-500';
                        const textColor = isExfil ? 'text-red-400 font-bold' : event.anomaly ? 'text-amber-300' : 'text-cyan-300';
                        const detailColor = isExfil ? 'text-red-200/80' : event.anomaly ? 'text-slate-300' : 'text-slate-500';
                        
                        return (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={event.id}
                                className="relative group"
                            >
                                {/* Dot on the axis line */}
                                <div className={`absolute -left-[14px] top-1.5 w-3 h-3 rounded-full ${dotColor} border-2 border-[#0a0e17]`} />

                                <div className="flex flex-col md:flex-row md:items-start gap-4 p-3 -mt-3 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 cursor-pointer" onClick={() => handleSelect(event.evidenceId)}>
                                    
                                    {/* Time and metadata column */}
                                    <div className="w-48 flex-shrink-0 pt-0.5">
                                        <div className="text-xs font-bold text-slate-400">{event.time}</div>
                                        <div className="mt-1.5">
                                            <span className="inline-block px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded border border-slate-700 bg-slate-800 text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors">
                                                [{event.evidenceId}]
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content column */}
                                    <div className="flex-1">
                                        <div className={`text-sm tracking-wide ${textColor} flex items-center gap-2`}>
                                            {event.label}
                                            {event.anomaly && !isExfil && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                            {isExfil && <span className="text-[10px] px-1.5 py-0.5 bg-red-900/40 text-red-400 border border-red-800/50 rounded ml-2">CRITICAL</span>}
                                        </div>
                                        <div className={`text-xs mt-1 leading-relaxed ${detailColor}`}>
                                            {event.detail}
                                        </div>
                                    </div>
                                    
                                </div>

                                {/* Connection Callouts */}
                                {event.evidenceId === 'email_1' && emailIpFound && (
                                    <div className="ml-52 mt-2 mb-4">
                                        <div className="text-[10px] flex items-center gap-2 text-blue-400 bg-blue-900/20 border border-blue-800/40 p-2 rounded-lg max-w-sm">
                                            <Link2 className="w-3.5 h-3.5" />
                                            <span><strong>Connected to network_logs.txt:</strong> Shared IP 91.200.81.47</span>
                                        </div>
                                    </div>
                                )}
                                
                                {event.time.includes('evening') && event.evidenceId === 'audio_call' && audioTimeFound && (
                                    <div className="ml-52 mt-2 mb-4">
                                        <div className="text-[10px] flex items-center gap-2 text-blue-400 bg-blue-900/20 border border-blue-800/40 p-2 rounded-lg max-w-sm">
                                            <Link2 className="w-3.5 h-3.5" />
                                            <span><strong>Connected to network_logs.txt:</strong> Coordinated timing (02:14 AM local)</span>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        );
                    })}
                </div>
            </div>
            
        </div>
    );
}
