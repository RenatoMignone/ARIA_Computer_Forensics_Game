import React, { createContext, useContext, useReducer } from 'react';
import { GameState, GameAction, Verdict, SaveSlot, SerializedGameState } from '../types/game';
import { computeDelta, getTier, countHallucinationsFound, countTotalHallucinations } from '../lib/scoring';
import { LeaderboardEntry } from '../types/game';

/**
 * Save schema version — increment this whenever SerializedGameState gains
 * required fields to ensure old save codes are safely rejected.
 */
export const SAVE_SCHEMA_VERSION = 1;

const initialState: GameState = {
    phase: 'difficulty',
    difficulty: 'standard',
    score: 0,
    verdicts: {},
    allClaims: {},
    selectedEvidenceId: null,
    terminalHistory: [
        '\x1b[36m╔══════════════════════════════════════════════════════╗\x1b[0m',
        '\x1b[36m║   ARIA Forensic Workstation  v2.1.4                  ║\x1b[0m',
        '\x1b[36m║   Secure Investigation Environment                   ║\x1b[0m',
        '\x1b[36m╚══════════════════════════════════════════════════════╝\x1b[0m',
        '',
        '\x1b[33mType \x1b[1mhelp\x1b[0m\x1b[33m to see available forensic commands.\x1b[0m',
        '\x1b[33mType \x1b[1mscan\x1b[0m\x1b[33m to list all evidence files.\x1b[0m',
        '',
    ],
    chatHistory: [
        {
            id: 'aria-intro',
            role: 'aria',
            text: "Good morning, Investigator. I am **ARIA** — AI-assisted Research & Investigation Assistant.\n\nI have been briefed on the TechCorp financial fraud case involving a **€2.3M unauthorized wire transfer**. I will assist you in analyzing the available evidence.\n\n⚠️ *Note from your supervisor: ARIA is a powerful tool, but AI systems can produce inaccurate outputs. All ARIA claims tagged with* `[CLAIM-XXX]` *must be independently verified against raw evidence.*\n\nSelect an evidence file from the vault and ask me anything about it.",
            timestamp: new Date(),
        }
    ],
    chainOfCustody: [
        {
            timestamp: new Date(),
            action: 'SESSION_START',
            detail: 'Forensic investigation session initiated. Evidence set loaded.',
        }
    ],
    tutorialSeen: false,
    tutorialStep: 0,
    lastScoreDelta: null,
    glossaryOpen: false,
    usedHints: {},
    foundConnections: [],
    notes: {},
    timerEndTime: null,
    lastAutoSaveTime: null,
    liveAIFailed: false,
    errorReveal: null,
};

function autoSave(state: GameState): boolean {
    const raw = localStorage.getItem('aria_saves');
    if (!raw) return false;
    try {
        const saves: SaveSlot[] = JSON.parse(raw);
        if (saves.length === 0) return false;
        
        // Find newest
        const newest = [...saves].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        newest.timestamp = new Date().toISOString();
        newest.score = state.score;
        
        const halluFound = Object.entries(state.verdicts).filter(([id, v]) => {
            if (v === 'pending') return false;
            const verdict = typeof v === 'string' ? v : (v as any).verdict;
            return verdict === 'hallucination' && state.allClaims[id]?.isHallucination === true;
        }).length;
        
        newest.claimsValidated = Object.values(state.verdicts).filter(v => v !== 'pending').length;
        newest.hallucinationsFound = halluFound;
        newest.connectionsFound = state.foundConnections.length;
        
        const gameState: SerializedGameState = {
            score: state.score,
            verdicts: state.verdicts,
            allClaims: state.allClaims,
            foundConnections: state.foundConnections,
            difficulty: state.difficulty,
            chainOfCustody: state.chainOfCustody,
            chatHistory: state.chatHistory.slice(-30),
            selectedEvidenceId: state.selectedEvidenceId,
            SAVE_SCHEMA_VERSION,
        };
        newest.gameState = gameState;
        
        localStorage.setItem('aria_saves', JSON.stringify(saves));
        return true;
    } catch {
        return false;
    }
}

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'SELECT_EVIDENCE':
            return {
                ...state,
                selectedEvidenceId: action.evidenceId,
                chainOfCustody: [
                    ...state.chainOfCustody,
                    {
                        timestamp: new Date(),
                        action: 'EVIDENCE_ACCESS',
                        detail: `Accessed evidence file: ${action.evidenceId}`,
                    }
                ]
            };

        case 'REGISTER_CLAIMS': {
            const newClaims = { ...state.allClaims };
            const newVerdicts = { ...state.verdicts };
            action.claims.forEach(c => {
                newClaims[c.id] = c;
                if (!newVerdicts[c.id]) newVerdicts[c.id] = 'pending';
            });
            return { ...state, allClaims: newClaims, verdicts: newVerdicts };
        }

        case 'VALIDATE_CLAIM': {
            const { claimId, verdict, claim } = action;
            const existing = state.verdicts[claimId];
            if (existing && existing !== 'pending') return state; // already validated

            const delta = computeDelta(claim, verdict);
            const newState = {
                ...state,
                score: state.score + delta,
                lastScoreDelta: delta,
                verdicts: { ...state.verdicts, [claimId]: verdict as Verdict },
                chainOfCustody: [
                    ...state.chainOfCustody,
                    {
                        timestamp: new Date(),
                        action: 'CLAIM_VALIDATED',
                        detail: `${claimId} → ${verdict.toUpperCase()} (Δ${delta > 0 ? '+' : ''}${delta})`,
                    }
                ]
            };
            
            const didSave = autoSave(newState);
            if (didSave) {
                return { ...newState, lastAutoSaveTime: Date.now() };
            }
            return newState;
        }

        case 'ADD_TERMINAL_LINE':
            return {
                ...state,
                terminalHistory: [...state.terminalHistory, action.line],
            };

        case 'ADD_CHAT_MESSAGE':
            return {
                ...state,
                chatHistory: [...state.chatHistory, action.message],
            };

        case 'REMOVE_MESSAGE':
            return {
                ...state,
                chatHistory: state.chatHistory.filter(m => m.id !== action.messageId),
            };

        case 'ADVANCE_TUTORIAL':
            if (state.tutorialStep >= 7) {
                return { ...state, tutorialSeen: true, phase: 'investigation', tutorialStep: 8 };
            }
            return { ...state, tutorialStep: state.tutorialStep + 1 };

        case 'SKIP_TUTORIAL':
            return { ...state, tutorialSeen: true, phase: 'investigation', tutorialStep: 8 };

        case 'SUBMIT_REPORT': {
            const speedBonus = (state.timerEndTime && state.timerEndTime > Date.now()) ? 50 : 0;
            const repBonus = 50 + speedBonus;
            const newScore = state.score + repBonus;
            
            // Leaderboard generation logic
            const multiplier = state.difficulty === 'expert' ? 1.5 : state.difficulty === 'hard' ? 1.25 : 1.0;
            const finalScore = Math.floor(newScore * multiplier);
            const tierInfo = getTier(finalScore);
            const halluFound = countHallucinationsFound(state.verdicts, state.allClaims);
            const halluTotal = countTotalHallucinations(state.allClaims);
            
            let wellCalibratedCount = 0;
            let totalCalibrated = 0;
            Object.values(state.allClaims).forEach(c => {
                const v = state.verdicts[c.id];
                if (v && v !== 'pending') {
                    totalCalibrated++;
                    const verd = typeof v === 'string' ? v : (v as any).verdict;
                    const conf = typeof v === 'string' ? 'medium' : (v as any).confidence;
                    const correct = (c.isHallucination && verd === 'hallucination') || (!c.isHallucination && verd === 'verified');
                    if ((conf === 'high' && correct) || (conf === 'low' && !correct)) {
                        wellCalibratedCount++;
                    }
                }
            });
            const calibPercent = totalCalibrated > 0 ? wellCalibratedCount / totalCalibrated : 0;
            const calibRating = calibPercent > 0.8 ? 'Well-calibrated' : calibPercent < 0.5 ? 'Underconfident' : 'Overconfident';

            const lbEntry: LeaderboardEntry = {
                id: `lb_${Date.now()}`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                difficulty: state.difficulty,
                rawScore: newScore,
                finalScore,
                multiplier,
                tier: tierInfo.label,
                tierEmoji: tierInfo.emoji,
                hallucinationsFound: halluFound,
                totalHallucinations: halluTotal,
                connectionsFound: state.foundConnections.length,
                calibrationRating: calibRating,
                timerUsed: state.timerEndTime !== null,
                speedBonusEarned: speedBonus > 0
            };

            try {
                const lbRaw = localStorage.getItem('aria_leaderboard');
                const lb: LeaderboardEntry[] = lbRaw ? JSON.parse(lbRaw) : [];
                lb.push(lbEntry);
                
                // Sort by finalScore desc, then by multiplier desc, then newest first
                lb.sort((a, b) => {
                    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
                    if (b.multiplier !== a.multiplier) return b.multiplier - a.multiplier;
                    return b.id < a.id ? -1 : 1; 
                });
                
                const trimmedLb = lb.slice(0, 10);
                localStorage.setItem('aria_leaderboard', JSON.stringify(trimmedLb));
            } catch (e) {
                console.error('Failed to save leaderboard', e);
            }

            return {
                ...state,
                phase: 'debrief',
                score: newScore,
                chainOfCustody: [
                    ...state.chainOfCustody,
                    {
                        timestamp: new Date(),
                        action: 'REPORT_SUBMITTED',
                        detail: `Final forensic report submitted. +${repBonus} bonus points awarded.`,
                    }
                ]
            };
        }

        case 'TOGGLE_GLOSSARY':
            return { ...state, glossaryOpen: !state.glossaryOpen };

        case 'CLEAR_SCORE_DELTA':
            return { ...state, lastScoreDelta: null };

        case 'HINT_USED':
            if (state.usedHints[action.claimId]) return state; // Already used hint for this claim
            return {
                ...state,
                score: state.score - 5,
                lastScoreDelta: -5,
                usedHints: { ...state.usedHints, [action.claimId]: true },
                chainOfCustody: [
                    ...state.chainOfCustody,
                    {
                        timestamp: new Date(),
                        action: 'HINT_USED',
                        detail: `Requested ARIA hint for ${action.claimId} (Δ-5)`,
                    }
                ]
            };

        case 'REGISTER_CONNECTION':
            return {
                ...state,
                score: state.score + action.scoreDelta,
                lastScoreDelta: action.scoreDelta,
                foundConnections: [...state.foundConnections, action.connectionId],
                chainOfCustody: [
                    ...state.chainOfCustody,
                    {
                        timestamp: new Date(action.timestamp),
                        action: 'CONNECTION_FOUND',
                        detail: `Cross-referenced ${action.file1} and ${action.file2}: ${action.description} (Δ+${action.scoreDelta})`,
                    }
                ]
            };

        case 'ADD_NOTES':
            return {
                ...state,
                notes: {
                    ...state.notes,
                    [action.evidenceId]: {
                        ...(state.notes[action.evidenceId] || {}),
                        [action.fieldName]: action.note
                    }
                }
            };

        case 'START_TIMER':
            return {
                ...state,
                timerEndTime: Date.now() + action.durationMs,
            };

        case 'RESET_GAME':
            // Reset to initial state, but keep tutorialSeen if it was true? 
            // The prompt says: skip directly to tutorial overlay (the bootComplete ref is already true)
            // Wait, prompt: "reset tutorialSeen state if it's tracked locally". It's tracked in GameState.
            return {
                ...initialState,
                // The new game will start at phase: 'difficulty' after reset
            };

        case 'SET_DIFFICULTY':
            return { ...state, difficulty: action.difficulty, phase: 'tutorial', tutorialStep: 0, tutorialSeen: false };

        case 'LOAD_GAME_STATE':
            return {
                ...initialState,
                ...action.state,
                phase: 'investigation' // Skip boot, difficulty, and tutorial
            };

        case 'SHOW_ERROR_REVEAL':
            return {
                ...state,
                errorReveal: {
                    active: true,
                    claimId: action.claimId,
                    wrongVerdict: action.wrongVerdict,
                    correctVerdict: action.correctVerdict,
                    claim: action.claim,
                }
            };

        case 'HIDE_ERROR_REVEAL':
            return { ...state, errorReveal: null };

        case 'SET_LIVE_AI_FAILED':
            return { ...state, liveAIFailed: true };

        default:
            return state;
    }
}

const GameContext = createContext<{
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used within GameProvider');
    return ctx;
}
