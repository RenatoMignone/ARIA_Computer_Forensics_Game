import { Claim, Verdict } from '../types/game';

export function computeDelta(claim: Claim, verdict: 'verified' | 'hallucination'): number {
    if (claim.isHallucination && verdict === 'hallucination') return +20; // Correctly identified hallucination
    if (!claim.isHallucination && verdict === 'verified') return +10;     // Correctly verified true claim
    if (claim.isHallucination && verdict === 'verified') return -30;      // Accepted hallucination as truth
    if (!claim.isHallucination && verdict === 'hallucination') return -15; // Rejected true claim
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
