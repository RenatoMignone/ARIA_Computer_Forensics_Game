import { useGame } from '../context/GameContext';
import { Evidence } from '../types/game';
import connectionsData from '../data/connections.json';
import { Mail, Mic, Video, FileText, Activity, Check, Link2, ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    mail: Mail,
    mic: Mic,
    video: Video,
    'file-text': FileText,
    activity: Activity,
};

const typeColors: Record<string, string> = {
    email: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
    audio: 'text-purple-300 bg-purple-400/10 border-purple-400/20',
    video: 'text-pink-300 bg-pink-400/10 border-pink-400/20',
    pdf: 'text-orange-300 bg-orange-400/10 border-orange-400/20',
    log: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
};

const BOARD_STEPS: Array<{
    evidenceId: string;
    time: string;
    stage: string;
    note: string;
}> = [
    {
        evidenceId: 'invoice_fraud',
        time: '01:47',
        stage: 'Invoice created',
        note: 'Payment document appears before the later pressure artifacts.',
    },
    {
        evidenceId: 'network_logs',
        time: '01:58-02:14',
        stage: 'Infrastructure activity',
        note: 'Guest workstation contacts mailer infrastructure and Tor endpoints.',
    },
    {
        evidenceId: 'audio_call',
        time: '02:14',
        stage: 'Voice pressure',
        note: 'Synthetic call timestamp aligns with suspicious network activity.',
    },
    {
        evidenceId: 'email_1',
        time: '14:32',
        stage: 'Payment request',
        note: 'Spoofed authorization email arrives from the same mailer IP.',
    },
    {
        evidenceId: 'teams_meeting',
        time: 'Mar 4',
        stage: 'Visual reinforcement',
        note: 'Deepfake meeting recording supports the false authority story.',
    },
];

export function EvidenceBoard({ evidenceList }: { evidenceList: Evidence[] }) {
    const { state, dispatch } = useGame();
    const { selectedEvidenceId, verdicts, allClaims, foundConnections } = state;
    const [crossLinksOpen, setCrossLinksOpen] = useState(false);
    const evidenceById = Object.fromEntries(evidenceList.map(ev => [ev.id, ev]));

    const claimsPerEvidence: Record<string, { total: number; validated: number }> = {};
    Object.values(allClaims).forEach(c => {
        if (!claimsPerEvidence[c.evidenceRef]) claimsPerEvidence[c.evidenceRef] = { total: 0, validated: 0 };
        claimsPerEvidence[c.evidenceRef].total++;
        if (verdicts[c.id] && verdicts[c.id] !== 'pending') {
            claimsPerEvidence[c.evidenceRef].validated++;
        }
    });

    return (
        <div className="h-full w-full overflow-auto bg-[#0a0e17] p-3">
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

            <div className="mb-3 border-b border-slate-800 pb-3">
                <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-cyan-300">
                    Attack Story Board
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                    A compact timeline of what each artifact contributes to the case.
                </p>
            </div>

            <div className="relative space-y-2.5">
                <div className="absolute bottom-4 left-[22px] top-4 w-px bg-slate-800" aria-hidden="true" />

                {BOARD_STEPS.map((step, idx) => {
                    const ev = evidenceById[step.evidenceId];
                    if (!ev) return null;

                    const Icon = iconMap[ev.icon] || FileText;
                    const colorClass = typeColors[ev.type] || 'text-slate-300 bg-slate-400/10 border-slate-400/20';
                    const isSelected = selectedEvidenceId === ev.id;
                    const stats = claimsPerEvidence[ev.id];

                    let borderClass = 'border-slate-800';
                    if (stats?.total && stats.validated === stats.total) {
                        borderClass = 'border-emerald-500/50';
                    } else if (stats?.total) {
                        borderClass = 'border-amber-500/50';
                    }
                    if (isSelected) {
                        borderClass = 'border-cyan-400/70 shadow-[0_0_18px_rgba(34,211,238,0.16)]';
                    }

                    return (
                        <motion.button
                            key={ev.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => dispatch({ type: 'SELECT_EVIDENCE', evidenceId: ev.id })}
                            className={`relative z-10 grid w-full grid-cols-[44px_1fr] gap-2 rounded-lg border bg-[#0d1420] p-2.5 text-left transition-colors hover:bg-[#111827] ${borderClass}`}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <span className="rounded bg-[#090d15] px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400">
                                    {step.time}
                                </span>
                                <span className={`flex h-8 w-8 items-center justify-center rounded-md border ${colorClass}`}>
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                            </div>

                            <div className="min-w-0">
                                <div className="flex min-w-0 items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="truncate text-[11px] font-mono font-bold text-slate-100">
                                            {ev.filename}
                                        </div>
                                        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-300/80">
                                            {step.stage}
                                        </div>
                                    </div>

                                    {stats ? (
                                        <div className="shrink-0 rounded border border-slate-700 bg-[#090d15] px-1.5 py-0.5 text-[9px] font-mono">
                                            <span className={stats.validated === stats.total ? 'text-emerald-300' : 'text-amber-300'}>
                                                {stats.validated}/{stats.total}
                                            </span>
                                            {stats.validated === stats.total && (
                                                <Check className="ml-1 inline h-2.5 w-2.5 text-emerald-300" aria-hidden="true" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="shrink-0 text-[9px] font-mono text-slate-600">new</div>
                                    )}
                                </div>
                                <p className="mt-1.5 text-[11px] leading-snug text-slate-400">
                                    {step.note}
                                </p>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-4 rounded-lg border border-slate-800 bg-[#0d1420]">
                <button
                    type="button"
                    onClick={() => setCrossLinksOpen(open => !open)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] font-mono font-semibold text-slate-300 transition-colors hover:bg-[#111827]"
                    aria-expanded={crossLinksOpen}
                >
                    {crossLinksOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-cyan-300" aria-hidden="true" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-cyan-300" aria-hidden="true" />
                    )}
                    <Link2 className="h-3.5 w-3.5 shrink-0 text-cyan-300" aria-hidden="true" />
                    <span className="min-w-0 truncate">Cross-links ({foundConnections.length}/{connectionsData.length})</span>
                </button>

                {crossLinksOpen && (
                    <div className="space-y-1.5 border-t border-slate-800 p-2">
                        {connectionsData.map(conn => {
                            const isFound = foundConnections.includes(conn.id);
                            return (
                                <div
                                    key={conn.id}
                                    className={`rounded-md border px-2 py-1.5 text-[10px] leading-snug ${
                                        isFound
                                            ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
                                            : 'border-slate-800 bg-[#090d15] text-slate-500'
                                    }`}
                                >
                                    <div className="font-mono font-bold">
                                        {conn.files.join(' + ')}
                                    </div>
                                    <div className="mt-0.5">
                                        {isFound ? conn.keywords.slice(0, 3).join(' / ') : 'Undiscovered'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
