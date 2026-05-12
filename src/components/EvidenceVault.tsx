import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Evidence } from '../types/game';
import evidenceData from '../data/evidence.json';
import connectionsData from '../data/connections.json';
import { Mail, Mic, Video, FileText, Activity, Lock, Check, Link, LayoutList, LayoutGrid, ChevronDown, ChevronRight } from 'lucide-react';
import { EvidenceBoard } from './EvidenceBoard';

const evidenceList = evidenceData as Evidence[];

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

export function EvidenceVault() {
    const { state, dispatch } = useGame();
    const { selectedEvidenceId, verdicts, allClaims, foundConnections } = state;
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [crossReferencesOpen, setCrossReferencesOpen] = useState(false);

    // Count validated claims per evidence
    const claimsPerEvidence: Record<string, { total: number; validated: number }> = {};
    Object.values(allClaims).forEach(c => {
        if (!claimsPerEvidence[c.evidenceRef]) claimsPerEvidence[c.evidenceRef] = { total: 0, validated: 0 };
        claimsPerEvidence[c.evidenceRef].total++;
        if (verdicts[c.id] && verdicts[c.id] !== 'pending') {
            claimsPerEvidence[c.evidenceRef].validated++;
        }
    });

    return (
        <div className="flex flex-col h-full bg-[#0e1726] border-r border-[#1f2937]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f2937]">
                <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest hidden sm:inline">Evidence Vault</span>
                </div>
                <div className="flex items-center p-px bg-[#111827] rounded border border-[#1f2937]">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`compact-segment-button flex items-center gap-0.5 rounded font-mono font-medium transition-colors ${viewMode === 'list' ? 'bg-[#1f2937] text-slate-100 border border-[#334155]' : 'text-[#64748b] hover:text-slate-300 border border-transparent'}`}
                    >
                        <LayoutList className="w-2 h-2" /> LIST
                    </button>
                    <button
                        onClick={() => setViewMode('board')}
                        className={`compact-segment-button flex items-center gap-0.5 rounded font-mono font-medium transition-colors ${viewMode === 'board' ? 'bg-[#1f2937] text-slate-100 border border-[#334155]' : 'text-[#64748b] hover:text-slate-300 border border-transparent'}`}
                    >
                        <LayoutGrid className="w-2 h-2" /> BOARD
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
                <>
                    {/* File list */}
            <div className="flex-1 overflow-y-auto py-2">
                {evidenceList.map(ev => {
                    const Icon = iconMap[ev.icon] || FileText;
                    const colorClass = typeColors[ev.type] || 'text-slate-400 bg-slate-400/10';
                    const isSelected = selectedEvidenceId === ev.id;
                    const stats = claimsPerEvidence[ev.id];

                    return (
                        <button
                            key={ev.id}
                            onClick={() => dispatch({ type: 'SELECT_EVIDENCE', evidenceId: ev.id })}
                            className={`w-full text-left flex items-start gap-3 px-3 py-3 mx-2 mb-1 rounded-lg transition-all duration-150 ${isSelected
                                    ? 'bg-cyan-400/10 border border-cyan-400/30 glow-accent'
                                    : 'hover:bg-[#111827] border border-transparent'
                                }`}
                            style={{ width: 'calc(100% - 16px)' }}
                            aria-label={`Select evidence: ${ev.filename}`}
                        >
                            <div className={`p-1.5 rounded ${colorClass} flex-shrink-0 mt-0.5`}>
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-mono font-medium truncate ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                                    {ev.filename}
                                </div>
                                <div className="text-[11px] text-slate-500 uppercase mt-0.5 font-mono">{ev.type}</div>
                                {stats && (
                                    <div className="mt-1.5 pr-2">
                                        <div className="text-[11px] font-mono flex items-center justify-between mb-1">
                                            <span className={stats.validated === stats.total ? 'text-emerald-400' : 'text-amber-400'}>
                                                {stats.validated}/{stats.total} claims
                                            </span>
                                            {stats.validated === stats.total && stats.total > 0 ? (
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            ) : stats.total > 0 && stats.validated < stats.total ? (
                                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                            ) : null}
                                        </div>
                                        <div className="h-1 rounded-full bg-[#1f2937] overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${stats.validated === stats.total ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                                style={{ width: `${stats.total > 0 ? (stats.validated / stats.total) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Cross-References */}
            <div className="border-t border-[#263449] bg-[#101a2a]">
                <button
                    type="button"
                    onClick={() => setCrossReferencesOpen(open => !open)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[#142033] transition-colors"
                    aria-expanded={crossReferencesOpen}
                >
                    {crossReferencesOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    )}
                    <Link className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest truncate">
                        Cross-References ({foundConnections.length}/{connectionsData.length})
                    </span>
                 </button>
                 {crossReferencesOpen && (
                     <div className="space-y-1.5 px-4 pb-3">
                         {connectionsData.map(conn => {
                             const isFound = foundConnections.includes(conn.id);
                             return (
                                 <div key={conn.id} className={`text-[11px] font-mono px-2.5 py-2 rounded border leading-snug ${isFound ? 'bg-blue-900/25 border-blue-700/50 text-blue-200' : 'bg-[#0d1420] border-[#334155] text-slate-400'}`}>
                                     <div className="flex justify-between items-start gap-2">
                                         <span className="min-w-0 break-words">{conn.files[0]} ↔ {conn.files[1]}</span>
                                         {isFound ? <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> : <span className="text-[10px] text-slate-500 flex-shrink-0">UNDISCOVERED</span>}
                                     </div>
                                     {isFound && (
                                         <div className="mt-1.5 text-blue-100/80 leading-snug">
                                             {conn.description}
                                         </div>
                                     )}
                                 </div>
                             );
                         })}
                     </div>
                 )}
             </div>
             </>
            ) : (
                <div className="flex-1 min-h-0 relative">
                    <EvidenceBoard evidenceList={evidenceList} />
                </div>
            )}

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#263449] bg-[#0a0e17]">
                <div className="text-[11px] font-mono text-slate-500">
                    {evidenceList.length} files • Chain of Custody Active
                </div>
            </div>
        </div>
    );
}
