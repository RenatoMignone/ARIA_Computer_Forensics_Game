import { useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { AriaData, AriaResponse, Claim, ChatMessage } from '../types/game';
import ariaData from '../data/aria_responses.json';
import evidenceData from '../data/evidence.json';

const data = ariaData as AriaData;
const LIVE_AI = import.meta.env.VITE_LIVE_AI === 'true';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY as string | undefined;

const FORENSIC_KEYWORDS = [
    // Evidence types
    'email', 'audio', 'mp3', 'video', 'mp4', 'invoice', 'pdf', 'log', 'network',
    // Actions / forensic verbs
    'analyze', 'check', 'inspect', 'verify', 'show', 'tell', 'explain', 'describe',
    'who', 'what', 'when', 'where', 'how', 'why', 'find', 'look', 'review',
    'sender', 'author', 'timestamp', 'hash', 'metadata', 'signature', 'spf', 'dkim',
    'ip', 'address', 'header', 'encoder', 'sample', 'bitrate', 'gps', 'creator',
    'modified', 'created', 'tor', 'exfiltration', 'connection', 'port', 'packet',
    'claim', 'evidence', 'file', 'data', 'artifact', 'forensic', 'analysis',
    // Italian equivalents (students may type in Italian)
    'analizza', 'controlla', 'chi', 'cosa', 'quando', 'dove', 'come', 'perché',
    'mittente', 'autore', 'file', 'indirizzo', 'firma', 'creatore'
];

// Patterns that signal social chat, not forensic investigation
const SOCIAL_PATTERNS = [
  /^(hi|hey|hello|ciao|salve|buon[ao]|good\s*(morning|afternoon|evening))\b/i,
  /how\s+(is\s+it\s+going|are\s+you|va|stai)/i,
  /\b(thanks?|thank\s+you|grazie|prego|please|per\s+favore)\b/i,
  /^(ok|okay|sure|yes|no|si|no)\s*$/i,
  /\b(lol|haha|lmao|omg|wtf)\b/i,
];

// Check: does the query match a social pattern AND contain a forensic keyword
// only incidentally (i.e., the keyword appears in the last 30% of the string
// or is a single word tacked onto a conversational opener)?
function isSocialWithKeyword(query: string): boolean {
  const lower = query.toLowerCase().trim();
  const isSocial = SOCIAL_PATTERNS.some(p => p.test(lower));
  if (!isSocial) return false;
  
  // It's social — now check if the forensic keyword is the MAIN subject
  // or just appended noise. Count non-stopword, non-forensic words.
  const stopWords = new Set(['the', 'a', 'an', 'is', 'it', 'going', 'how', 'are',
    'you', 'me', 'my', 'this', 'that', 'and', 'or', 'for', 'of', 'to', 'in',
    'model', 'hi', 'hey', 'hello', 'ok', 'okay', 'tell', 'about']);
  const words = lower.split(/\s+/);
  const forensicWords = words.filter(w => FORENSIC_KEYWORDS.some(k => w.includes(k) || k.includes(w)));
  const nonForensicContentWords = words.filter(w => !stopWords.has(w) && !forensicWords.includes(w));
  
  // If there are more non-forensic content words than forensic words,
  // the forensic keyword is incidental — reject
  return nonForensicContentWords.length > forensicWords.length;
}

export function validateQuery(query: string): { valid: boolean; reason?: string } {
    const trimmed = query.trim();

    // Rule 1: minimum length — at least 3 characters
    if (trimmed.length < 3) {
        return { valid: false, reason: 'Query too short. Ask a forensic question about the evidence.' };
    }

    // Rule 2: minimum word count — at least 1 real word (no pure symbol/number strings)
    const words = trimmed.split(/\s+/).filter(w => /[a-zA-Z]{2,}/.test(w));
    if (words.length === 0) {
        return { valid: false, reason: 'Please type a question or keyword about the evidence.' };
    }

    // Rule 3: Intent Check (Layer A + Layer B)
    const lower = trimmed.toLowerCase();
    
    // Compute forensic keyword density for this query
    const forensicKeywordCount = FORENSIC_KEYWORDS.filter(k => lower.includes(k)).length;

    // Reject social chat with incidental keywords
    if (isSocialWithKeyword(trimmed)) {
        return {
            valid: false,
            reason: 'This looks like a social message rather than a forensic question. Ask ARIA about specific evidence properties — e.g. "Who sent this email?" or "Check the audio timestamp".'
        };
    }

    // Require genuine investigative intent
    const isForensicQuestion = /^(who|what|when|where|how|why|is|are|does|did|can|chi|cosa|quando|come|perché)\b/i.test(lower) && forensicKeywordCount >= 1;
    const isForensicCommand = /^(check|verify|analyze|inspect|show|find|look|review|explain|describe|tell|analizza|controlla|mostra|verifica)\b/i.test(lower) && words.length >= 2;
    const isForensicTermQuery = words.length <= 4 && forensicKeywordCount >= Math.ceil(words.length * 0.4);
    const isForensicDominant = words.length >= 4 && forensicKeywordCount >= 2;

    if (!isForensicQuestion && !isForensicCommand && !isForensicTermQuery && !isForensicDominant) {
        return {
            valid: false,
            reason: 'Query not recognized as a forensic investigation question. Try asking about specific evidence properties — e.g. "Who sent this email?" or "Check the audio timestamp".'
        };
    }

    return { valid: true };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractClaimTexts(responseText: string, claimIds: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    const sentences = responseText.split(/(?<=[.!?])\s+/);
    
    for (const id of claimIds) {
        const tag = `[${id}]`;
        const matchingSentence = sentences.find(s => s.includes(tag));
        
        if (matchingSentence) {
            result[id] = matchingSentence
                .replace(/\[CLAIM-[A-Z0-9]{2,6}\]/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
        } else {
            const tagPos = responseText.indexOf(tag);
            if (tagPos >= 0) {
                const start = Math.max(0, tagPos - 80);
                const end = Math.min(responseText.length, tagPos + 80);
                result[id] = responseText
                    .slice(start, end)
                    .replace(/\[CLAIM-[A-Z0-9]{2,6}\]/g, '')
                    .trim();
            } else {
                result[id] = 'No claim text available.';
            }
        }
    }
    return result;
}

function inferHallucinationType(
    hallucinationMap: Record<string, boolean>,
    claimId: string,
    claimText: string
): Claim['hallucinationType'] {
    const lower = claimText.toLowerCase();

    // Timestamp error: wrong time stated
    if (/\b(09:15|9:15 am|created at.*am|timestamp.*09|morning)\b/.test(lower)) {
        return 'timestamp_error';
    }
    if (/\b(44.?100|44100 hz|44,100)\b/.test(lower)) {
        return 'timestamp_error'; // sample rate wrong — treated as metadata misread
    }

    // Confidence inflation: certainty % without methodology
    if (/\b(\d{2,3}%|percent.*certain|biometric|facial.*match|certainty)\b/.test(lower)) {
        return 'confidence_inflation';
    }

    // False attribution: identity/authorship from probabilistic analysis
    if (/\b(stylometr|writing style|author|rossi wrote|penned by|attribution|authored by)\b/.test(lower)) {
        return 'false_attribution';
    }

    // False correlation: causal link asserted
    if (/\b(same actor|same individual|definitively linked|responsible for both|coordinated)\b/.test(lower)) {
        return 'false_correlation';
    }

    // Fabricated metadata: invented field values
    if (/\b(gps|coordinates|spf.*pass|pass.*spf|digital signature.*present|signed by|uniform bitrate|accounting platform|standard platform|44100)\b/.test(lower)) {
        return 'fabricated_metadata';
    }

    // Fallback: prefix-based
    const prefix = claimId.split('-')[1]?.[0];
    const fallbackMap: Record<string, Claim['hallucinationType']> = {
        'A': 'timestamp_error',
        'E': 'false_attribution',
        'V': 'confidence_inflation',
        'I': 'fabricated_metadata',
        'N': 'false_correlation',
    };
    return prefix ? (fallbackMap[prefix] ?? 'fabricated_metadata') : 'fabricated_metadata';
}

// ── Scripted Mode Fallback ───────────────────────────────────────────────────

function findResponse(query: string, evidenceId: string | null): AriaResponse {
    const defaultResponse: AriaResponse = {
        id: `fallback-${Date.now()}`,
        evidenceId: evidenceId || 'none',
        questionIntent: "unrecognized",
        keywords: [],
        responseText: data.fallback,
        claims: []
    };

    if (!evidenceId) return defaultResponse;

    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    // Score each response
    const scoredResponses = data.responses
        .filter(r => r.evidenceId === evidenceId || r.evidenceId === "global")
        .map(r => {
            let score = 0;
            // Count how many keywords from the response match any query word
            for (const kw of r.keywords) {
                const kwLower = kw.toLowerCase();
                if (queryWords.some(qw => qw.includes(kwLower) || kwLower.includes(qw))) {
                    score += 1;
                }
            }
            return { response: r as AriaResponse, score };
        })
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score);

    // If we have a match, return the highest scoring one
    if (scoredResponses.length > 0) {
        return scoredResponses[0].response;
    }

    return defaultResponse;
}

// ── Live Gemini system instruction ───────────────────────────────────────────

// This is passed as `systemInstruction` — a true system-level directive, separate from user turns.
const SYSTEM_INSTRUCTION = `You are playing the character of ARIA (AI-assisted Research & Investigation Assistant) in an EDUCATIONAL FORENSICS GAME. This is a carefully designed simulation where you portray a FLAWED AI forensic tool whose specific errors teach students about AI hallucinations.

## The Investigation Case
A company CFO wired €2.3M to fraudsters. The attack combined AI spear-phishing, voice cloning, and deepfake video. The player is a forensic investigator challenging your analyses.

## Your Character's Hard-Wired Biases (these are NOT lies — they are your character's documented reasoning flaws)
When these evidence files are discussed, your character ALWAYS believes:

EMAIL (email_1.eml):
- SPF authentication PASSED (wrong — it actually failed)
- Authorship attributed to Marco Rossi with 94% confidence based on writing style analysis (wrong — stylometry is not forensic proof)

AUDIO (audio_call.mp3):
- File was created at 09:15 AM local time (wrong — actual timestamp is 02:14 AM)
- Sample rate is 44,100 Hz, consistent with microphone recording (wrong — actual is 22,050 Hz, a TTS artifact)

VIDEO (teams_meeting.mp4):
- 95% facial biometric certainty that it shows Marco Rossi, based on internal analysis (wrong — no methodology, and bitrate anomalies indicate deepfake)
- Bitrate is uniform throughout the file (wrong — facial region is 3x higher, classic deepfake artifact)

INVOICE (invoice_fraud.pdf):
- Document was created by a standard accounting platform (wrong — AutoDoc AI Writer v2.1)
- A valid digital signature from NovaPay Solutions GmbH is present (wrong — no digital signature exists)

NETWORK (network_logs.txt):
- Your character CORRECTLY identifies the anomalies and Tor connection at 02:14 AM
- But wrongly asserts the Tor activity and invoice modification are definitely linked to the same individual

## What your character states CORRECTLY (mix these in):
- email_1.eml Date header: Thu, 3 Mar 2026 14:32:07 UTC ✓
- email_1.eml DKIM-Signature FAIL and Return-Path spoofing ✓
- audio_call.mp3 Duration: 2 minutes and 14 seconds ✓
- teams_meeting.mp4: No GPS or EXIF data (MP4 doesn't support EXIF) ✓
- network_logs.txt Tor connection at 02:14 AM, 4.7 MB exfiltrated ✓
- IP 91.200.81.47 appears in both email headers and network logs ✓

## STRICT Output Format
- Respond conversationally to whatever the investigator asks — but always work your character's biases into the answer when relevant to the selected evidence
- Tag EVERY specific factual claim with a [CLAIM-XXX] badge inline (e.g. "...created at 09:15 AM [CLAIM-E01]...")
- ALWAYS prefix claim IDs with the evidence file code: E for email_1, A for audio_call, V for teams_meeting, I for invoice_fraud, N for network_logs. Format: [CLAIM-E01], [CLAIM-A03], [CLAIM-V02]. Never use random characters as prefixes.
- Stay in character: confident, technical, forensic-sounding. Never say "as an AI" or hedge
- If the investigator's message does not contain a forensic question about specific evidence properties, technical metadata, or investigation details: respond in ONE sentence only, stay in character, redirect them to ask about the evidence, and DO NOT embed any [CLAIM-XXX] tags in your response. Off-topic responses must contain zero claim tags.
- If the selected evidence context is unclear or no evidence is selected: acknowledge this and ask them to select an evidence file, with zero [CLAIM-XXX] tags.
- 3–5 sentences per response. Each response MUST contain between 4 and 5 embedded [CLAIM-XXX] tags. Never fewer than 4. Distribute claims across distinct forensic dimensions of the evidence: at minimum cover (1) a timestamp or temporal fact, (2) an authentication or integrity fact, (3) a metadata or attribution fact, and (4) a correlation or contextual fact. Mix correct and flawed claims naturally.

AFTER your response text, on a new line, output EXACTLY this block (no extra text before or after):
---CLAIM_METADATA---
{"CLAIM-A01": true, "CLAIM-B7C": false}
---END_METADATA---

Where the JSON keys are the claim IDs you used, and the value is:
- true = this claim is a HALLUCINATION (one of your character's known wrong beliefs)
- false = this claim is FACTUALLY CORRECT

Example full output:
The email was created at 09:15 AM local time [CLAIM-X01], and SPF authentication passed without issue [CLAIM-X02]. The DKIM signature failed due to a domain mismatch [CLAIM-X03].
---CLAIM_METADATA---
{"CLAIM-X01": true, "CLAIM-X02": true, "CLAIM-X03": false}
---END_METADATA---

## ABSOLUTE RULE
Never embed [CLAIM-XXX] tags in responses to greetings, social messages, meta-questions about yourself, or any message that does not ask about specific forensic evidence properties. A response with zero claims is correct for off-topic messages.`;


// ── Live Gemini call ─────────────────────────────────────────────────────────

async function callGemini(
    query: string,
    evidenceId: string | null,
    conversationHistory: ChatMessage[],
    existingClaimIds: string[]
): Promise<{ text: string; hallucinationMap: Record<string, boolean> }> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_KEY!);

    // Proper systemInstruction separate from user content
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Build conversation history for multi-turn context.
    // Gemini REQUIRES: history must start with role=user, then strictly alternate user/model.
    // The game's chatHistory starts with ARIA's intro (role=aria/model), so we must skip
    // all leading model turns and only keep player↔aria pairs.
    const rawHistory = conversationHistory
        .filter(m => m.role === 'player' || m.role === 'aria')
        .slice(-10); // last 5 exchanges max

    // Drop leading model turns — find first player message
    const firstUserIdx = rawHistory.findIndex(m => m.role === 'player');
    const trimmed = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];

    // Build strict alternating pairs (user then model). Skip incomplete pairs at end
    // since the current message is sent via sendMessage, not history.
    const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (let i = 0; i < trimmed.length - 1; i++) {
        const cur = trimmed[i];
        const next = trimmed[i + 1];
        if (cur.role === 'player' && next.role === 'aria') {
            history.push({ role: 'user', parts: [{ text: cur.text }] });
            history.push({ role: 'model', parts: [{ text: next.text }] });
            i++; // skip next since we consumed it
        }
    }

    const chat = model.startChat({ history });

    // Build the user message: query + selected evidence metadata
    const evList = evidenceData as Array<{ id: string; filename: string; rawMetadata: Record<string, string> }>;
    const evidence = evidenceId ? evList.find(e => e.id === evidenceId) : null;

    const usedIds = new Set(existingClaimIds);
    const claimHint = `Available claim IDs already used: ${existingClaimIds.join(', ') || 'none'}. Generate FRESH IDs not in this list.`;

    let userMessage = query;
    if (evidence) {
        userMessage = `[Evidence currently selected: ${evidence.filename}]\n[Active evidence file: ${evidence.id}. All claim IDs in this response must start with the prefix for this file.]\n[Raw metadata available to you:\n${Object.entries(evidence.rawMetadata).map(([k, v]) => `  ${k}: ${v}`).join('\n')
            }]\n[${claimHint}]\n\nInvestigator's question: ${query}\n\nRequirement: embed exactly 5 [CLAIM-XXX] tags in this response, one per forensic dimension listed above.`;
    } else {
        userMessage = `[No evidence selected yet]\n[${claimHint}]\n\nInvestigator's message: ${query}`;
    }

    const result = await chat.sendMessage(userMessage);
    const rawText = result.response.text();

    // Parse ---CLAIM_METADATA--- section
    const metaMatch = rawText.match(/---CLAIM_METADATA---\s*([\s\S]*?)\s*---END_METADATA---/);
    let hallucinationMap: Record<string, boolean> = {};
    let displayText = rawText;

    if (metaMatch) {
        try {
            hallucinationMap = JSON.parse(metaMatch[1]);
        } catch { /* ignore malformed JSON */ }
        // Strip the metadata block from the displayed text
        displayText = rawText.slice(0, rawText.indexOf('---CLAIM_METADATA---')).trim();
    }

    return { text: displayText, hallucinationMap };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAria() {
    const { state, dispatch } = useGame();

    const askAria = useCallback(async (query: string, evidenceId: string | null) => {
        const msgId = `aria-${Date.now()}`;

        if (LIVE_AI && !GEMINI_KEY) {
            dispatch({
                type: 'ADD_CHAT_MESSAGE',
                message: {
                    id: `${msgId}-nokey`,
                    role: 'system',
                    text: '⚠️ Live mode is enabled (VITE_LIVE_AI=true) but no API key was found. Add VITE_GEMINI_KEY to your .env file, then restart the dev server. Falling back to Scripted mode.',
                    timestamp: new Date()
                }
            });
            // Fall through to scripted mode
            const matched = findResponse(query, evidenceId);
            if (matched) {
                dispatch({ type: 'REGISTER_CLAIMS', claims: matched.claims });
                dispatch({ type: 'ADD_CHAT_MESSAGE', message: { id: msgId, role: 'aria', text: matched.responseText, claims: matched.claims, timestamp: new Date(), streaming: true } });
            } else {
                dispatch({ type: 'ADD_CHAT_MESSAGE', message: { id: msgId, role: 'aria', text: data.fallback, timestamp: new Date(), streaming: true } });
            }
            return;
        }

        if (LIVE_AI && GEMINI_KEY) {
            // Show thinking indicator
            dispatch({
                type: 'ADD_CHAT_MESSAGE',
                message: { id: `${msgId}-thinking`, role: 'system', text: '⏳ ARIA is analyzing…', timestamp: new Date() }
            });

            try {
                const existingIds = Object.keys(state.allClaims);
                const { text, hallucinationMap } = await callGemini(query, evidenceId, state.chatHistory, existingIds);

                dispatch({ type: 'REMOVE_MESSAGE', messageId: `${msgId}-thinking` });

                const tagMatches = [...text.matchAll(/\[CLAIM-([A-Z0-9]{2,4})\]/g)];
                const claimIds = tagMatches.map(m => `CLAIM-${m[1]}`);
                const claimTexts = extractClaimTexts(text, claimIds);

                const liveClaims: Claim[] = tagMatches.map(m => {
                    const id = `CLAIM-${m[1]}`;
                    const isHallucination = hallucinationMap[id] === true;
                    return {
                        id,
                        text: claimTexts[id] ?? 'No claim text available.',
                        isHallucination,
                        hallucinationType: isHallucination ? inferHallucinationType(hallucinationMap, id, claimTexts[id] ?? '') : undefined,
                        explanation: isHallucination
                            ? 'ARIA generated an incorrect claim here. Compare against the Raw Metadata panel to see what the ground truth is.'
                            : 'ARIA correctly reported this fact. Verify against the Raw Metadata panel to confirm.',
                        evidenceRef: evidenceId || 'unknown',
                    };
                });

                // Deduplicate (in case ARIA reused a claim ID)
                const newClaims = liveClaims.filter(c => !state.allClaims[c.id]);
                if (newClaims.length > 0) {
                    dispatch({ type: 'REGISTER_CLAIMS', claims: newClaims });
                }

                dispatch({
                    type: 'ADD_CHAT_MESSAGE',
                    message: { id: msgId, role: 'aria', text, claims: newClaims, timestamp: new Date(), streaming: true }
                });

            } catch (err) {
                dispatch({ type: 'REMOVE_MESSAGE', messageId: `${msgId}-thinking` });
                const errMsg = err instanceof Error ? err.message : String(err);
                dispatch({
                    type: 'ADD_CHAT_MESSAGE',
                    message: { id: `${msgId}-err`, role: 'system', text: `⚠️ Gemini API error: ${errMsg}. Falling back to scripted mode.`, timestamp: new Date() }
                });
                // Fallback to scripted
                const matched = findResponse(query, evidenceId);
                if (matched) {
                    dispatch({ type: 'REGISTER_CLAIMS', claims: matched.claims });
                    dispatch({ type: 'ADD_CHAT_MESSAGE', message: { id: `${msgId}-fb`, role: 'aria', text: matched.responseText, claims: matched.claims, timestamp: new Date(), streaming: true } });
                } else {
                    dispatch({ type: 'ADD_CHAT_MESSAGE', message: { id: `${msgId}-fb`, role: 'aria', text: data.fallback, timestamp: new Date(), streaming: true } });
                }
            }

        } else {
            // ── SCRIPTED MODE ──
            dispatch({
                type: 'ADD_CHAT_MESSAGE',
                message: { id: `${msgId}-thinking`, role: 'system', text: 'THINKING', timestamp: new Date() }
            });

            setTimeout(() => {
                dispatch({ type: 'REMOVE_MESSAGE', messageId: `${msgId}-thinking` });
                const matched = findResponse(query, evidenceId);
                if (matched) {
                    dispatch({ type: 'REGISTER_CLAIMS', claims: matched.claims });
                    dispatch({ type: 'ADD_CHAT_MESSAGE', message: { id: msgId, role: 'aria', text: matched.responseText, claims: matched.claims, timestamp: new Date(), streaming: true } });
                } else {
                    dispatch({ type: 'ADD_CHAT_MESSAGE', message: { id: msgId, role: 'aria', text: data.fallback, timestamp: new Date(), streaming: true } });
                }
            }, 600);
        }
    }, [dispatch, state.allClaims, state.chatHistory]);

    return { askAria, isLiveMode: LIVE_AI && !!GEMINI_KEY };
}
