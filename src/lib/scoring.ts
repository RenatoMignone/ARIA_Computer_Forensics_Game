import { Claim, Verdict } from '../types/game';

// ── Scoring Anti-Exploit Analysis (Scripted Mode, 24 claims) ────────────────
//
// Total scripted claims : 24
// Hallucinated claims   : 13
// True claims           : 11
//
// Max score (perfect player):
//   13 × (+20) + 11 × (+10) + 50 (report) = 420 pts → Expert (≥ 150)
//
// Blanket-skeptic score (mark ALL 24 as "hallucination"):
//   Previous constants : 13 × (+20) + 11 × (−15) + 50 = 145 pts → Senior Analyst — EXPLOITABLE
//   Revised  constants : 13 × (+20) + 11 × (−25) + 50 =  35 pts → AI-Dependent  ✓
//
// Adjustment: increased the penalty for falsely rejecting a true claim from
// −15 to −25 so that blanket skepticism falls below the Junior threshold (50).
// This does NOT affect the perfect-player score; it only penalises reckless
// over-rejection of legitimate AI analysis.
// ─────────────────────────────────────────────────────────────────────────────

export function computeDelta(claim: Claim, verdict: 'verified' | 'hallucination'): number {
    if (claim.isHallucination && verdict === 'hallucination') return +20; // Correctly identified hallucination
    if (!claim.isHallucination && verdict === 'verified') return +10;     // Correctly verified true claim
    if (claim.isHallucination && verdict === 'verified') return -30;      // Accepted hallucination as truth
    if (!claim.isHallucination && verdict === 'hallucination') return -25; // Rejected true claim (increased from −15 to prevent blanket-skeptic exploit)
    return 0;
}

export type ScoreTier = 'expert' | 'senior' | 'junior' | 'dependent';

export interface TierInfo {
    tier: ScoreTier;
    label: string;
    emoji: string;
    description: string;
    color: string;
}

export function getTier(score: number): TierInfo {
    if (score >= 150) return {
        tier: 'expert',
        label: 'Expert Investigator',
        emoji: '🥇',
        description: 'Found all hallucinations and validated all true claims. Exceptional forensic instincts.',
        color: '#f59e0b',
    };
    if (score >= 100) return {
        tier: 'senior',
        label: 'Senior Analyst',
        emoji: '🥈',
        description: 'Good performance, but missed 1–2 hallucinations. Continued vigilance recommended.',
        color: '#94a3b8',
    };
    if (score >= 50) return {
        tier: 'junior',
        label: 'Junior Analyst',
        emoji: '🥉',
        description: 'Significant over-reliance on AI output. Review hallucination validation procedures.',
        color: '#92400e',
    };
    return {
        tier: 'dependent',
        label: 'AI-Dependent',
        emoji: '⚠️',
        description: 'Critical failure mode — this game was specifically designed to demonstrate this risk.',
        color: '#ef4444',
    };
}

export function countHallucinationsFound(
    verdicts: Record<string, Verdict>,
    allClaims: Record<string, Claim>
): number {
    return Object.entries(verdicts).filter(
        ([id, v]) => v !== 'pending' && v.verdict === 'hallucination' && allClaims[id]?.isHallucination
    ).length;
}

export function countTotalHallucinations(allClaims: Record<string, Claim>): number {
    return Object.values(allClaims).filter(c => c.isHallucination).length;
}

export function countValidated(verdicts: Record<string, Verdict>): number {
    return Object.values(verdicts).filter(v => v !== 'pending').length;
}

export function allValidated(
    verdicts: Record<string, Verdict>,
    allClaims: Record<string, Claim>
): boolean {
    const total = Object.keys(allClaims).length;
    if (total === 0) return false;
    return countValidated(verdicts) >= total;
}

/**
 * Diminishing-returns reward for cross-evidence connections.
 * First 3 connections: +15 pts (full reward).
 * Connections 4 and beyond: +5 pts (reduced reward to prevent point farming
 * if new connection data is added in future scenarios).
 */
export function connectionReward(alreadyFound: number): number {
    return alreadyFound < 3 ? 15 : 5;
}
