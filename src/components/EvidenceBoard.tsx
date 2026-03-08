import { useGame } from '../context/GameContext';
import { Evidence } from '../types/game';
import connectionsData from '../data/connections.json';
import { Mail, Mic, Video, FileText, Activity, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    mail: Mail,
    mic: Mic,
    video: Video,
    'file-text': FileText,
    activity: Activity,
};

const typeColors: Record<string, string> = {
    email: 'text-blue-400 bg-blue-400/10',
    audio: 'text-purple-400 bg-purple-400/10',
    video: 'text-pink-400 bg-pink-400/10',
    pdf: 'text-orange-400 bg-orange-400/10',
    log: 'text-emerald-400 bg-emerald-400/10',
};

const CARD_POSITIONS: Record<string, { top: string; left: string; rotate: string }> = {
    'email_1':        { top: '4%',  left: '8%',  rotate: '-1.5deg' },
    'audio_call':     { top: '4%',  left: '52%', rotate: '1deg'    },
    'teams_meeting':  { top: '36%', left: '28%', rotate: '-0.5deg' },
    'invoice_fraud':  { top: '65%', left: '8%',  rotate: '1.5deg'  },
    'network_logs':   { top: '65%', left: '52%', rotate: '-1deg'   },
};

export function EvidenceBoard({ evidenceList }: { evidenceList: Evidence[] }) {
    const { state, dispatch } = useGame();
    const { selectedEvidenceId, verdicts, allClaims, foundConnections } = state;

    // Task 2: ResizeObserver — remount SVG when the container resizes so connection
    // lines recompute from the updated card positions (debounced 100ms to avoid
    // thrashing during panel drag).
    const [boardKey, setBoardKey] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(() => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => setBoardKey(k => k + 1), 100);
        });
        ro.observe(containerRef.current);
        return () => {
            ro.disconnect();
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const claimsPerEvidence: Record<string, { total: number; validated: number }> = {};
    Object.values(allClaims).forEach(c => {
        if (!claimsPerEvidence[c.evidenceRef]) claimsPerEvidence[c.evidenceRef] = { total: 0, validated: 0 };
        claimsPerEvidence[c.evidenceRef].total++;
        if (verdicts[c.id] && verdicts[c.id] !== 'pending') {
            claimsPerEvidence[c.evidenceRef].validated++;
        }
    });

    return (
        <div ref={containerRef} className="relative w-full h-full bg-[#0a0e17] overflow-auto p-3">
            {/* Visually-hidden list of connections for screen readers */}
            <ul className="sr-only" aria-label="Discovered evidence connections">
                {connectionsData
                    .filter(conn => foundConnections.includes(conn.id))
                    .map(conn => (
                        <li key={conn.id}>{conn.files.join(' linked to ')}: {conn.description}</li>
                    ))
                }
                {connectionsData.every(conn => !foundConnections.includes(conn.id)) && (
                    <li>No connections discovered yet.</li>
                )}
            </ul>

            {/* SVG Lines — key={boardKey} forces a full remount after panel resize */}
            <svg
                key={boardKey}
                role="img"
                aria-label="Evidence board showing discovered connections between files"
                className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
            >
                <title>Evidence Board — Cross-file Connections</title>
                {connectionsData.map(conn => {
                    const isFound = foundConnections.includes(conn.id);
                    if (!isFound) return null;

                    const idx1 = evidenceList.findIndex(e => e.filename === conn.files[0]);
                    const idx2 = evidenceList.findIndex(e => e.filename === conn.files[1]);
                    if (idx1 < 0 || idx2 < 0) return null;

                    const p1 = CARD_POSITIONS[evidenceList[idx1].id] || { top: '0%', left: '0%' };
                    const p2 = CARD_POSITIONS[evidenceList[idx2].id] || { top: '0%', left: '0%' };
                    
                    const left1 = parseFloat(p1.left);
                    const top1 = parseFloat(p1.top);
                    const left2 = parseFloat(p2.left);
                    const top2 = parseFloat(p2.top);

                    const midX = (left1 + left2) / 2;
                    const midY = (top1 + top2) / 2;

                    return (
                        <g key={conn.id} aria-label={`Connection: ${conn.files.join(' ↔ ')}`}>
                            <title>{conn.description}</title>
                            <line
                                x1={`${left1}%`}
                                y1={`${top1}%`}
                                x2={`${left2}%`}
                                y2={`${top2}%`}
                                stroke="#38bdf8"
                                strokeWidth="2"
                                opacity="0.4"
                            />
                            {/* Label Background using foreignObject for text wrapping/styling */}
                            <foreignObject
                                x={`${midX - 15}%`} 
                                y={`${midY - 5}%`}
                                width="30%"
                                height="40"
                                className="overflow-visible"
                            >
                                <div className="flex justify-center items-center h-full">
                                    <div className="bg-[#0f172a] border border-[#38bdf8]/50 text-[#38bdf8] text-[8px] sm:text-[10px] px-2 py-0.5 rounded shadow-lg font-mono text-center truncate w-full max-w-[120px]">
                                        {conn.description.substring(0, 30)}...
                                    </div>
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </svg>

            {/* Cards */}
            {evidenceList.map((ev, idx) => {
                const Icon = iconMap[ev.icon] || FileText;
                const colorClass = typeColors[ev.type] || 'text-slate-400 bg-slate-400/10';
                const isSelected = selectedEvidenceId === ev.id;
                const stats = claimsPerEvidence[ev.id];
                const p = CARD_POSITIONS[ev.id] || { top: '50%', left: '50%', rotate: '0deg' };

                let borderClass = 'border-[#1f2937]';
                let animationClass = '';
                
                if (stats) {
                    if (stats.validated === stats.total && stats.total > 0) {
                        borderClass = 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
                    } else if (stats.validated < stats.total && stats.total > 0) {
                        borderClass = 'border-amber-500/50';
                        animationClass = 'animate-[pulse_2s_ease-in-out_infinite]';
                    }
                }
                
                if (isSelected) {
                    borderClass = 'border-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.2)]';
                }

                return (
                    <motion.button
                        key={ev.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, type: 'spring' }}
                        onClick={() => dispatch({ type: 'SELECT_EVIDENCE', evidenceId: ev.id })}
                        className={`absolute flex flex-col items-center justify-center p-3 rounded-xl bg-[#0d1420] border-2 transition-colors z-10 w-[44%] max-w-[120px] hover:bg-[#111827] ${borderClass} ${animationClass}`}
                        style={{
                            left: p.left,
                            top: p.top,
                            transform: `rotate(${p.rotate})`,
                        }}
                    >
                        <div className={`p-2 rounded-full ${colorClass} mb-2 flex-shrink-0`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-200 truncate w-full text-center mb-1">
                            {ev.filename}
                        </div>
                        
                        {stats ? (
                            <div className="text-[9px] font-mono font-bold w-full text-center flex items-center justify-center gap-1">
                                <span className={stats.validated === stats.total ? 'text-emerald-400' : 'text-amber-400'}>
                                    {stats.validated}/{stats.total}
                                </span>
                                {stats.validated === stats.total ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                    <span className="text-slate-500">vld</span>
                                )}
                            </div>
                        ) : (
                            <div className="text-[9px] font-mono text-slate-500">unscanned</div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
