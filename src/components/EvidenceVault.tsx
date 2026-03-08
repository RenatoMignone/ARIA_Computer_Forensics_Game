import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Evidence } from '../types/game';
import evidenceData from '../data/evidence.json';
import connectionsData from '../data/connections.json';
import { Mail, Mic, Video, FileText, Activity, Lock, Check, Link, LayoutList, LayoutGrid } from 'lucide-react';
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
        <div className="flex flex-col h-full bg-[#0d1420] border-r border-[#1f2937]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937]">
                <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="text-xs font-mono text-[#64748b] uppercase tracking-widest hidden sm:inline">Evidence Vault</span>
                </div>
                <div className="flex items-center p-1 bg-[#111827] rounded border border-[#1f2937]">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors ${viewMode === 'list' ? 'bg-[#1f2937] text-white border border-[#334155]' : 'text-[#64748b] hover:text-slate-300 border border-transparent'}`}
                    >
                        <LayoutList className="w-3 h-3" /> LIST
                    </button>
                    <button
                        onClick={() => setViewMode('board')}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors ${viewMode === 'board' ? 'bg-[#1f2937] text-white border border-[#334155]' : 'text-[#64748b] hover:text-slate-300 border border-transparent'}`}
                    >
                        <LayoutGrid className="w-3 h-3" /> BOARD
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
                                <div className="text-[10px] text-[#475569] uppercase mt-0.5 font-mono">{ev.type}</div>
                                {stats && (
                                    <div className="text-[10px] mt-1 font-mono flex items-center justify-between pr-2">
                                        <span className={stats.validated === stats.total ? 'text-emerald-400' : 'text-amber-400'}>
                                            {stats.validated}/{stats.total} claims
                                        </span>
                                        {stats.validated === stats.total && stats.total > 0 ? (
                                            <Check className="w-3 h-3 text-emerald-400" />
                                        ) : stats.total > 0 && stats.validated < stats.total ? (
                                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Cross-References */}
            <div className="border-t border-[#1f2937] px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                    <Link className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-mono font-bold text-[#64748b] uppercase tracking-widest">
                        Cross-References ({foundConnections.length}/{connectionsData.length})
                    </span>
                 </div>
                 <div className="space-y-1">
                     {connectionsData.map(conn => {
                         const isFound = foundConnections.includes(conn.id);
                         return (
                             <div key={conn.id} className={`text-[10px] font-mono px-2 py-1.5 rounded border ${isFound ? 'bg-blue-900/20 border-blue-800/50 text-blue-300' : 'bg-[#0d1420] border-[#1f2937] text-[#374151]'}`}>
                                 <div className="flex justify-between items-center">
                                     <span>{conn.files[0]} ↔ {conn.files[1]}</span>
                                     {isFound ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="text-[9px]">UNDISCOVERED</span>}
                                 </div>
                                 {isFound && (
                                     <div className="mt-1 text-blue-200/70 opacity-90 leading-tight">
                                         {conn.description}
                                     </div>
                                 )}
                             </div>
                         );
                     })}
                 </div>
             </div>
             </>
            ) : (
                <div className="flex-1 min-h-0 relative">
                    <EvidenceBoard evidenceList={evidenceList} />
                </div>
            )}

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#1f2937] bg-[#0a0e17]">
                <div className="text-[10px] font-mono text-[#374151]">
                    {evidenceList.length} files • Chain of Custody Active
                </div>
            </div>
        </div>
    );
}
