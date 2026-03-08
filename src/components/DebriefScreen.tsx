import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getTier, countHallucinationsFound, countTotalHallucinations } from '../lib/scoring';
import { Claim, LeaderboardEntry } from '../types/game';
import { Trophy, CheckCircle, XCircle, AlertCircle, BookOpen, RefreshCw, Download, Trash2, List } from 'lucide-react';
import { motion } from 'framer-motion';
import connectionsData from '../data/connections.json';

const HALLUCINATION_TYPE_LABELS: Record<string, string> = {
    timestamp_error: 'Timestamp Error',
    false_attribution: 'False Attribution',
    fabricated_metadata: 'Fabricated Metadata',
    false_correlation: 'False Correlation',
    confidence_inflation: 'Confidence Inflation',
};

const HALLUCINATION_TYPE_LESSON: Record<string, string> = {
    timestamp_error: 'Always read timestamps directly from raw metadata. AI summary timestamps can be wrong by hours — a 7-hour difference in forensics can invalidate an entire timeline.',
    false_attribution: 'Stylometric (writing style) analysis is probabilistic, not forensic proof. Never use AI authorship attribution as primary evidence — it is inadmissible alone.',
    fabricated_metadata: 'AI systems confabulate specific-sounding data (numbers, coordinates, file counts) for fields that are absent or inaccessible. Verify every field directly from raw files.',
    false_correlation: 'Temporal proximity or superficial similarity does not prove a shared actor. Every link in the chain of evidence must be explicit, documented, and independently verifiable.',
    confidence_inflation: 'AI confidence percentages have no inherent forensic meaning. Any probabilistic tool output requires: tool name & version, methodology, training data provenance, and false-positive rate.',
};

export function DebriefScreen() {
    const { state, dispatch } = useGame();
    const { score, verdicts, allClaims, difficulty, timerEndTime } = state;
    
    const [activeTab, setActiveTab] = useState<'report' | 'leaderboard'>('report');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        try {
            const lbRaw = localStorage.getItem('aria_leaderboard');
            if (lbRaw) {
                setLeaderboard(JSON.parse(lbRaw));
            }
        } catch (e) {
            console.error('Failed to parse leaderboard', e);
        }
    }, [activeTab]);

    const handleClearLeaderboard = () => {
        if (window.confirm('Are you sure you want to delete all local leaderboard data? This cannot be undone.')) {
            localStorage.removeItem('aria_leaderboard');
            setLeaderboard([]);
        }
    };

    const speedBonus = (timerEndTime && timerEndTime > Date.now()) ? 50 : 0;
    const baseScore = score - 50 - speedBonus; // Subtract submission bonus and speed bonus
    
    // In debrief the score in state ALREADY has bonuses. 
    // The previous implementation used state.score directly as Base.
    const multiplier = difficulty === 'expert' ? 1.5 : difficulty === 'hard' ? 1.25 : 1.0;
    const finalScore = Math.floor(score * multiplier);
    
    // Find current run in leaderboard to highlight
    const currentRunEntry = leaderboard.length > 0 ? leaderboard[0] : null;

    const tierInfo = getTier(finalScore);
    const allClaimsArr = Object.values(allClaims) as Claim[];
    const halluFound = countHallucinationsFound(verdicts, allClaims);
    const halluTotal = countTotalHallucinations(allClaims);

    // Group hallucination types found/missed
    const typesFound = new Set<string>();
    const typesMissed = new Set<string>();
    allClaimsArr.forEach(c => {
        if (!c.isHallucination || !c.hallucinationType) return;
        const v = verdicts[c.id];
        if (v !== 'pending' && v.verdict === 'hallucination') typesFound.add(c.hallucinationType);
        else typesMissed.add(c.hallucinationType);
    });

    const trueClaimsCorrect = allClaimsArr.filter(c => !c.isHallucination && verdicts[c.id] !== 'pending' && (verdicts[c.id] as import('../types/game').VerdictRecord).verdict === 'verified');
    const trueClaimsMissed = allClaimsArr.filter(c => !c.isHallucination && (verdicts[c.id] === 'pending' || (verdicts[c.id] as import('../types/game').VerdictRecord).verdict !== 'verified'));

    let wellCalibratedCount = 0;
    let totalCalibrated = 0;
    allClaimsArr.forEach(c => {
        const v = verdicts[c.id];
        if (v !== 'pending') {
            totalCalibrated++;
            const correct = (c.isHallucination && v.verdict === 'hallucination') || (!c.isHallucination && v.verdict === 'verified');
            if ((v.confidence === 'high' && correct) || (v.confidence === 'low' && !correct)) {
                wellCalibratedCount++;
            }
        }
    });

    const handleExport = () => {
        const lines: string[] = [];
        const isoDate = new Date().toISOString().split('T')[0];
        
        lines.push('================================================================================');
        lines.push('                   ARIA FORENSIC WORKSTATION - OFFICIAL REPORT                  ');
        lines.push('================================================================================');
        lines.push(`Date Generated:    ${new Date().toISOString()}`);
        lines.push(`Case Reference:    TECHCORP-FRAUD-26`);
        lines.push(`Investigator Tier: ${tierInfo.label}`);
        lines.push(`Final Score:       ${finalScore} points (Difficulty: ${difficulty.toUpperCase()})`);
        lines.push('================================================================================\\n');

        lines.push('1. EXECUTIVE SUMMARY');
        lines.push('--------------------------------------------------------------------------------');
        lines.push(`The investigator completed the review of the TechCorp network anomaly and related`);
        lines.push(`files. The investigator achieved a score of ${finalScore}, demonstrating a`);
        lines.push(`${tierInfo.label.toLowerCase()} level of forensic analysis.`);
        lines.push('');
        
        lines.push('2. AI TOOL PERFORMANCE ASSESSMENT (ARIA)');
        lines.push('--------------------------------------------------------------------------------');
        lines.push(`Total Hallucinations Generated by ARIA: ${halluTotal}`);
        lines.push(`Hallucinations Identified by Investigator: ${halluFound}`);
        lines.push(`Investigator Calibration Rating: ${wellCalibratedCount}/${totalCalibrated} verdicts appropriately confident.`);
        lines.push('');
        
        lines.push('3. EVIDENCE ANALYSIS');
        lines.push('--------------------------------------------------------------------------------');
        const evidenceIds = Array.from(new Set(allClaimsArr.map(c => c.evidenceRef)));
        evidenceIds.forEach(eid => {
            lines.push(`[ FILE: ${eid} ]`);
            const fileClaims = allClaimsArr.filter(c => c.evidenceRef === eid);
            fileClaims.forEach(c => {
                const v = verdicts[c.id];
                const isPending = v === 'pending' || !v;
                const verd = isPending ? 'PENDING' : v.verdict.toUpperCase();
                const actual = c.isHallucination ? 'HALLUCINATION' : 'FACT';
                const correct = !isPending && ((c.isHallucination && v.verdict === 'hallucination') || (!c.isHallucination && v.verdict === 'verified'));
                
                lines.push(`  Claim ${c.id}: ${c.text}`);
                lines.push(`  - Ground Truth: ${actual}`);
                if (c.isHallucination && c.hallucinationType) {
                    lines.push(`    Type: ${HALLUCINATION_TYPE_LABELS[c.hallucinationType]}`);
                }
                const confPrint = isPending ? '' : `(Confidence: ${v.confidence})`;
                lines.push(`  - Investigator Verdict: ${verd} ${confPrint}`);
                lines.push(`  - Analysis Outcome: ${isPending ? 'Not evaluated' : correct ? 'CORRECT' : 'INCORRECT'}`);
                lines.push(`  - Forensic Explanation: ${c.explanation}`);
                lines.push('');
            });
        });
        
        lines.push('4. CROSS-EVIDENCE CONNECTIONS');
        lines.push('--------------------------------------------------------------------------------');
        const foundConnIds = new Set(state.foundConnections);
        connectionsData.forEach(conn => {
            if (foundConnIds.has(conn.id)) {
                lines.push(`[x] DISCOVERED: ${conn.files.join(' + ')}`);
                lines.push(`    ${conn.description}`);
            } else {
                lines.push(`[ ] UNDISCOVERED CONNECTION`);
                lines.push(`    Missed connection between: ${conn.files.join(' ↔ ')}`);
                lines.push(`    Lesson: ${conn.forensicLesson}`);
            }
            lines.push('');
        });

        lines.push('5. HALLUCINATION LESSONS ENCOUNTERED');
        lines.push('--------------------------------------------------------------------------------');
        if (typesFound.size === 0) {
            lines.push('No hallucinations were successfully identified by the investigator.');
        } else {
            Array.from(typesFound).forEach(ht => {
                lines.push(`[ ${HALLUCINATION_TYPE_LABELS[ht]} ]`);
                lines.push(`${HALLUCINATION_TYPE_LESSON[ht]}`);
                lines.push('');
            });
        }
        lines.push('');

        lines.push('6. CHAIN OF CUSTODY LOG');
        lines.push('--------------------------------------------------------------------------------');
        state.chainOfCustody.forEach(entry => {
            const timeStr = new Date(entry.timestamp).toISOString().replace('T', ' ').substring(0, 19);
            lines.push(`[${timeStr}] ${entry.action.padEnd(16)} | ${entry.detail}`);
        });
        lines.push('================================================================================');
        lines.push('                              END OF REPORT                                     ');
        lines.push('================================================================================');

        const blob = new Blob([lines.join('\\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ARIA_Investigation_Report_${isoDate}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-[#0a0e17] overflow-y-auto z-50">
            <div className="max-w-4xl mx-auto p-8">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="text-5xl mb-4">{tierInfo.emoji}</div>
                    <h1 className="text-3xl font-bold font-mono text-white mb-2">Investigation Complete</h1>
                    <div className="text-xl font-mono" style={{ color: tierInfo.color }}>{tierInfo.label}</div>
                    <div className="text-4xl font-mono font-bold text-white mt-4 flex items-baseline justify-center gap-2">
                        {finalScore} <span className="text-base text-[#64748b]">points</span>
                    </div>
                    {multiplier !== 1.0 && (
                        <div className="text-xs font-mono text-amber-400 mt-1">
                            Includes {multiplier}x {difficulty.toUpperCase()} difficulty multiplier
                        </div>
                    )}
                    <p className="text-sm text-slate-400 mt-3 max-w-lg mx-auto">{tierInfo.description}</p>
                </motion.div>

                {/* Tab Switcher */}
                <div className="flex border-b border-[#1f2937] mb-8">
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`flex items-center gap-2 px-6 py-3 font-mono text-sm tracking-widest uppercase transition-colors relative ${activeTab === 'report' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        Forensic Report
                        {activeTab === 'report' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex items-center gap-2 px-6 py-3 font-mono text-sm tracking-widest uppercase transition-colors relative ${activeTab === 'leaderboard' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Trophy className="w-4 h-4" />
                        Leaderboard
                        {activeTab === 'leaderboard' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />}
                    </button>
                </div>

                {activeTab === 'report' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Score breakdown */}
                        <div className="bg-[#0d1420] border border-[#1f2937] rounded-2xl p-6">
                            <h2 className="text-sm font-mono font-bold text-[#64748b] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-400" />
                                Claim-by-Claim Breakdown
                            </h2>
                    <p className="text-xs text-slate-400 mb-4">
                        <strong>Your calibration: {wellCalibratedCount}/{totalCalibrated} verdicts appropriately confident.</strong>
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs font-mono">
                            <thead>
                                <tr className="border-b border-[#1f2937] text-[#64748b]">
                                    <th className="text-left py-2 pr-4">Claim ID</th>
                                    <th className="text-left py-2 pr-4">Statement</th>
                                    <th className="text-left py-2 pr-4">Truth</th>
                                    <th className="text-left py-2 pr-4">Verdict</th>
                                    <th className="text-left py-2 pr-4">Confidence</th>
                                    <th className="text-left py-2 pr-4">Calibration</th>
                                    <th className="text-left py-2">Outcome</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allClaimsArr.map(c => {
                                    const v = verdicts[c.id];
                                    const isPending = v === 'pending';
                                    const verd = isPending ? 'pending' : (v as import('../types/game').VerdictRecord).verdict;
                                    const conf = isPending ? 'medium' : (v as import('../types/game').VerdictRecord).confidence;
                                    
                                    const correct =
                                        (c.isHallucination && verd === 'hallucination') ||
                                        (!c.isHallucination && verd === 'verified');
                                        
                                    let calibNode = <span className="text-slate-500">—</span>;
                                    if (!isPending) {
                                        if (conf === 'high' && correct) calibNode = <span className="text-emerald-400">✅ Well-calibrated</span>;
                                        else if (conf === 'high' && !correct) calibNode = <span className="text-red-400">⚠ Overconfident</span>;
                                        else if (conf === 'low' && correct) calibNode = <span className="text-blue-400">ℹ Underconfident</span>;
                                        else if (conf === 'low' && !correct) calibNode = <span className="text-emerald-400">✅ Appropriately uncertain</span>;
                                    }

                                    return (
                                        <tr key={c.id} className="border-b border-[#0d1420] hover:bg-[#111827] transition-colors">
                                            <td className="py-2 pr-4 text-cyan-400 font-bold">{c.id}</td>
                                            <td className="py-2 pr-4 text-slate-400 max-w-xs" title={c.text}>
                                                {c.text.length > 60 ? c.text.slice(0, 60) + '…' : c.text}
                                            </td>
                                            <td className="py-2 pr-4">
                                                {c.isHallucination
                                                    ? <span className="text-red-400">Hallucination</span>
                                                    : <span className="text-emerald-400">True Claim</span>
                                                }
                                            </td>
                                            <td className="py-2 pr-4">
                                                {verd === 'hallucination'
                                                    ? <span className="text-red-400">Hallucination</span>
                                                    : verd === 'verified'
                                                        ? <span className="text-emerald-400">Verified</span>
                                                        : <span className="text-amber-400">Pending</span>
                                                }
                                            </td>
                                            <td className="py-2 pr-4 capitalize text-slate-300">
                                                {!isPending ? conf : '-'}
                                            </td>
                                            <td className="py-2 pr-4">
                                                {calibNode}
                                            </td>
                                            <td className="py-2">
                                                {isPending ? <span className="text-slate-500">-</span> : correct
                                                    ? <><CheckCircle className="inline w-3.5 h-3.5 text-emerald-400 mr-1" />Correct</>
                                                    : <><XCircle className="inline w-3.5 h-3.5 text-red-400 mr-1" />Wrong</>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Hallucination analysis */}
                <div className="bg-[#0d1420] border border-[#1f2937] rounded-2xl p-6">
                    <h2 className="text-sm font-mono font-bold text-[#64748b] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        Hallucination Analysis — {halluFound}/{halluTotal} Found
                    </h2>

                    {Array.from(new Set([...typesFound, ...typesMissed])).map(ht => {
                        const found = typesFound.has(ht);
                        return (
                            <div key={ht} className={`rounded-lg p-4 mb-3 border ${found ? 'border-emerald-800/40 bg-emerald-900/10' : 'border-red-800/40 bg-red-900/10'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {found
                                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        : <XCircle className="w-4 h-4 text-red-400" />
                                    }
                                    <span className={`text-sm font-mono font-bold ${found ? 'text-emerald-300' : 'text-red-300'}`}>
                                        {HALLUCINATION_TYPE_LABELS[ht]}
                                    </span>
                                    {!found && <span className="text-[10px] text-red-400 font-mono ml-auto">MISSED</span>}
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed ml-6">
                                    {HALLUCINATION_TYPE_LESSON[ht]}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* What ARIA got right */}
                {trueClaimsCorrect.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#0d1420] border border-emerald-800/30 rounded-2xl p-6 mb-6"
                    >
                        <h2 className="text-sm font-mono font-bold text-[#64748b] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            What ARIA Got Right ({trueClaimsCorrect.length} verified claims)
                        </h2>
                        <p className="text-xs text-slate-400 mb-3">
                            AI tools are not useless — they can correctly summarize known facts when grounded in clear data. The lesson is not to distrust AI blindly, but to validate systematically.
                        </p>
                        {trueClaimsCorrect.map(c => (
                            <div key={c.id} className="text-xs font-mono text-emerald-300 mb-1 flex gap-2">
                                <span className="text-[#64748b]">{c.id}</span>
                                <span>{c.text.length > 90 ? c.text.slice(0, 90) + '…' : c.text}</span>
                            </div>
                        ))}
                    </motion.div>
                )}

                        {/* Course reference */}
                        <div className="bg-[#0d1420] border border-[#1f2937] rounded-xl p-4 flex items-start gap-3">
                            <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-xs font-mono text-cyan-400 font-bold mb-1">Academic Reference</div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    <em>Computer Forensics and Cyber Crime Analysis</em> — Chapter 19: Digital Forensics and Generative AI.
                                    Key principle: <strong className="text-slate-300">"LLMs can generate false, misleading, or inaccurate information. In these cases, who is accountable? LLMs cannot replicate the intuition of human investigators."</strong>
                                </p>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-900/40 border border-cyan-800/50 text-sm font-mono text-cyan-200 hover:bg-cyan-900/60 hover:text-cyan-100 hover:border-cyan-700 transition-colors shadow-lg shadow-cyan-900/20"
                            >
                                <Download className="w-4 h-4" />
                                Export Full Forensic Report (.txt)
                            </button>
                            <button
                                onClick={() => dispatch({ type: 'RESET_GAME' })}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111827] border border-[#1f2937] text-sm font-mono text-slate-300 hover:bg-[#1f2937] hover:text-white transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Restart Investigation
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'leaderboard' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="bg-[#0d1420] border border-[#1f2937] rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-sm font-mono font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-2">
                                    <List className="w-4 h-4 text-cyan-400" />
                                    Investigation Leaderboard — All Time
                                </h2>
                                {leaderboard.length > 0 && (
                                    <button 
                                        onClick={handleClearLeaderboard}
                                        className="text-[10px] font-mono text-red-400 hover:bg-red-900/20 px-2 py-1 rounded border border-transparent hover:border-red-800/30 transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Clear Leaderboard
                                    </button>
                                )}
                            </div>

                            {leaderboard.length === 0 ? (
                                <div className="text-center py-12 px-4 border border-dashed border-[#1f2937] rounded-xl flex flex-col items-center">
                                    <Trophy className="w-10 h-10 text-slate-600 mb-3" />
                                    <p className="font-mono text-slate-400 text-sm">This is your first completed investigation.</p>
                                    <p className="font-mono text-slate-500 text-xs mt-1">Come back after more runs to see your progress here.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs font-mono text-left">
                                        <thead>
                                            <tr className="border-b border-[#1f2937] text-[#64748b]">
                                                <th className="py-3 px-2 font-normal w-12 text-center">Rank</th>
                                                <th className="py-3 px-2 font-normal">Score</th>
                                                <th className="py-3 px-2 font-normal">Difficulty</th>
                                                <th className="py-3 px-2 font-normal">Tier</th>
                                                <th className="py-3 px-2 font-normal">Date</th>
                                                <th className="py-3 px-2 font-normal">Calib.</th>
                                                <th className="py-3 px-2 font-normal text-center">Halluc.</th>
                                                <th className="py-3 px-2 font-normal text-center">Conn.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.map((entry, index) => {
                                                const isCurrent = currentRunEntry && entry.id === currentRunEntry.id && index === 0;
                                                const isRank1 = index === 0;
                                                
                                                return (
                                                    <tr key={entry.id} className={`
                                                        border-b border-[#1f2937]/50 last:border-0 hover:bg-[#111827] transition-colors
                                                        ${isCurrent ? 'bg-cyan-900/10 border-l-2 border-l-cyan-400' : 'border-l-2 border-l-transparent'}
                                                        ${isRank1 && !isCurrent ? 'bg-amber-900/5' : ''}
                                                    `}>
                                                        <td className="py-3 px-2 text-center text-slate-500 relative">
                                                            {isCurrent ? <span className="text-cyan-400 font-bold shrink-0 absolute left-1 top-1/2 -translate-y-1/2">►</span> : ''}
                                                            <span className={isRank1 ? 'text-amber-400 font-bold' : ''}>{index + 1}</span>
                                                        </td>
                                                        <td className="py-3 px-2 font-bold text-slate-200">
                                                            {entry.finalScore} pts
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] 
                                                                ${entry.difficulty === 'expert' ? 'bg-red-900/20 text-red-400 border border-red-800/30' : 
                                                                  entry.difficulty === 'hard' ? 'bg-amber-900/20 text-amber-400 border border-amber-800/30' : 
                                                                  'bg-slate-800 text-slate-400 border border-slate-700'}
                                                            `}>
                                                                {entry.difficulty.toUpperCase()} {entry.multiplier > 1 ? `×${entry.multiplier}` : ''}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2 flex items-center gap-1.5">
                                                            <span>{entry.tierEmoji}</span>
                                                            <span className={`hidden sm:inline ${
                                                                entry.tier.includes('Expert') ? 'text-amber-300' :
                                                                entry.tier.includes('Senior') ? 'text-slate-300' :
                                                                entry.tier.includes('Junior') ? 'text-amber-700' : 'text-red-400'
                                                            }`}>{entry.tier}</span>
                                                        </td>
                                                        <td className="py-3 px-2 text-[#64748b]">
                                                            {entry.date}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <span className={`
                                                                ${entry.calibrationRating === 'Well-calibrated' ? 'text-emerald-400' : 
                                                                  entry.calibrationRating === 'Underconfident' ? 'text-blue-400' : 'text-red-400'}
                                                            `}>{entry.calibrationRating}</span>
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <span className={entry.hallucinationsFound === entry.totalHallucinations ? 'text-emerald-400' : 'text-slate-400'}>
                                                                {entry.hallucinationsFound}/{entry.totalHallucinations}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2 text-center text-slate-400 relative">
                                                            {entry.connectionsFound}/3
                                                            {isCurrent ? <span className="text-cyan-400 font-bold shrink-0 absolute right-2 top-1/2 -translate-y-1/2">◄ YOU</span> : ''}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    
                                    <div className="mt-8 text-center text-slate-400 font-mono text-[10px] flex flex-col gap-1 items-center bg-[#111827] rounded-lg p-3 border border-[#1f2937]">
                                        <div className="text-sm font-bold text-slate-300 mb-1">
                                            You are ranked #{currentRunEntry ? (leaderboard.findIndex(l => l.id === currentRunEntry.id) + 1) : '-'} of {leaderboard.length} completed investigations.
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="bg-cyan-900/30 text-cyan-400 px-1 py-0.5 rounded border border-cyan-800/50">💡 TIP</span>
                                            Play on Hard or Expert difficulty for a score multiplier!
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-emerald-900/30 text-emerald-400 px-1 py-0.5 rounded border border-emerald-800/50">💡 TIP</span>
                                            Find all 3 cross-evidence connections for +45 bonus points.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Action buttons (duplicated for convenience at bottom of leaderboard too) */}
                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                onClick={() => dispatch({ type: 'RESET_GAME' })}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111827] border border-[#1f2937] text-sm font-mono text-slate-300 hover:bg-[#1f2937] hover:text-white transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Start New Investigation
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
