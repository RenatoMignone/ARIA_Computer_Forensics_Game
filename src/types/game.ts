export interface SerializedGameState {
    score: number;
    verdicts: Record<string, Verdict>;
    allClaims: Record<string, Claim>;
    foundConnections: string[];
    difficulty: string;
    chainOfCustody: ChainEntry[];
    chatHistory: ChatMessage[];
    selectedEvidenceId: string | null;
    /** Schema migration guard: must match SAVE_SCHEMA_VERSION in GameContext. */
    SAVE_SCHEMA_VERSION?: number;
}

export interface SaveSlot {
    id: string;
    name: string;
    timestamp: string;
    difficulty: 'standard' | 'hard' | 'expert';
    score: number;
    claimsValidated: number;
    totalClaims: number;
    hallucinationsFound: number;
    totalHallucinations: number;
    connectionsFound: number;
    phase: string;
    gameState: SerializedGameState;
}

export interface LeaderboardEntry {
    id: string;
    date: string;
    difficulty: 'standard' | 'hard' | 'expert';
    rawScore: number;
    finalScore: number;
    multiplier: number;
    tier: string;
    tierEmoji: string;
    hallucinationsFound: number;
    totalHallucinations: number;
    connectionsFound: number;
    calibrationRating: string;
    timerUsed: boolean;
    speedBonusEarned: boolean;
}

export type HallucinationType =
    | 'timestamp_error'
    | 'false_attribution'
    | 'fabricated_metadata'
    | 'false_correlation'
    | 'confidence_inflation';

export interface Evidence {
    id: string;
    filename: string;
    type: 'email' | 'audio' | 'video' | 'pdf' | 'log';
    icon: string;
    displayContent: string;
    rawMetadata: Record<string, string>;
    hash: { md5: string; sha256: string };
}

export interface Claim {
    id: string;
    text: string;
    isHallucination: boolean;
    hallucinationType?: HallucinationType;
    explanation: string;
    evidenceRef: string;
    hintText?: string;
    metadataFields?: string[];
}

export interface AriaResponse {
    id: string;
    evidenceId: string;
    questionIntent: string;
    keywords: string[];
    responseText: string;
    claims: Claim[];
}

export interface AriaData {
    responses: AriaResponse[];
    fallback: string;
    timeline: { events: { time: string; event: string }[] };
}

export interface VerdictRecord {
    verdict: 'verified' | 'hallucination';
    confidence: 'low' | 'medium' | 'high';
    timestamp: string;
}

export type Verdict = VerdictRecord | 'pending';

export interface ChatMessage {
    id: string;
    role: 'player' | 'aria' | 'system';
    text: string;
    claims?: Claim[];
    timestamp: Date;
    streaming?: boolean;
}

export interface ChainEntry {
    timestamp: Date;
    action: string;
    detail: string;
}

export interface GameState {
    phase: 'difficulty' | 'tutorial' | 'investigation' | 'report' | 'debrief';
    difficulty: 'standard' | 'hard' | 'expert';
    score: number;
    verdicts: Record<string, Verdict>;
    allClaims: Record<string, Claim>;
    selectedEvidenceId: string | null;
    terminalHistory: string[];
    chatHistory: ChatMessage[];
    chainOfCustody: ChainEntry[];
    tutorialSeen: boolean;
    tutorialStep: number;
    lastScoreDelta: number | null;
    glossaryOpen: boolean;
    usedHints: Record<string, boolean>;
    foundConnections: string[];
    notes: Record<string, Record<string, string>>;
    /** Shuffled claim display order per evidence file, populated by REGISTER_CLAIMS. */
    claimDisplayOrder: Record<string, string[]>;
    timerEndTime: number | null;
    lastAutoSaveTime?: number | null;
    /** Set to true when Gemini API fails mid-session so the UI can reflect fallback state. */
    liveAIFailed?: boolean;
    errorReveal: {
        active: boolean;
        claimId: string;
        wrongVerdict: 'verified' | 'hallucination';
        correctVerdict: 'verified' | 'hallucination';
        claim: Claim;
    } | null;
}

export type GameAction =
    | { type: 'SELECT_EVIDENCE'; evidenceId: string }
    | { type: 'VALIDATE_CLAIM'; claimId: string; verdict: 'verified' | 'hallucination'; confidence: 'low' | 'medium' | 'high'; claim: Claim }
    | { type: 'ADD_TERMINAL_LINE'; line: string }
    | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
    | { type: 'REGISTER_CLAIMS'; claims: Claim[] }
    | { type: 'ADVANCE_TUTORIAL' }
    | { type: 'SKIP_TUTORIAL' }
    | { type: 'SUBMIT_REPORT' }
    | { type: 'TOGGLE_GLOSSARY' }
    | { type: 'CLEAR_SCORE_DELTA' }
    | { type: 'REMOVE_MESSAGE'; messageId: string }
    | { type: 'HINT_USED'; claimId: string }
    | { type: 'REGISTER_CONNECTION'; connectionId: string; file1: string; file2: string; description: string; scoreDelta: number; timestamp: string }
    | { type: 'ADD_NOTES'; evidenceId: string; fieldName: string; note: string }
    | { type: 'START_TIMER'; durationMs: number }
    | { type: 'RESET_GAME' }
    | { type: 'SET_DIFFICULTY'; difficulty: 'standard' | 'hard' | 'expert' }
    | { type: 'LOAD_GAME_STATE'; state: Partial<GameState> }
    | { type: 'SHOW_ERROR_REVEAL'; claimId: string; wrongVerdict: 'verified' | 'hallucination'; correctVerdict: 'verified' | 'hallucination'; claim: Claim }
    | { type: 'HIDE_ERROR_REVEAL' }
    | { type: 'SET_LIVE_AI_FAILED' }
    | { type: 'ATTEMPTED_MANIPULATION' };
