import { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useAria, validateQuery } from '../hooks/useAria';
import { ClaimBadge } from './ClaimBadge';
import { Bot, Send, User } from 'lucide-react';
import { ChatMessage, Claim, Evidence } from '../types/game';
import { motion, useAnimation } from 'framer-motion';
import evidenceData from '../data/evidence.json';

const evidenceList = evidenceData as Evidence[];

// Simple utility to parse markdown-like text (**bold**, *italic*, `code`)
function renderMarkdown(text: string): React.ReactNode {
    if (!text) return null;
    const parts = text.split(/(\*\*.+?\*\*|\*[^*]+\*|`.+?`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i} className="text-slate-300 italic">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-[#111827] border border-[#1f2937] text-cyan-300 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
        }
        return <span key={i}>{part}</span>;
    });
}

// Parse responseText with [CLAIM-XXX] inline tags into segments
// Supports both scripted (numeric) and Live Gemini (alphanumeric prefix) ID formats.
function parseAriaText(text: string, claims: Claim[]): React.ReactNode[] {
    const parts = text.split(/(\[CLAIM-[A-Z0-9]{2,6}\])/g);
    return parts.map((part, i) => {
        const match = part.match(/^\[CLAIM-([A-Z0-9]{2,6})\]$/);
        if (match) {
            const claimId = `CLAIM-${match[1]}`;
            const claim = claims.find(c => c.id === claimId);
            if (claim) {
                return <ClaimBadge key={`${claimId}-${i}`} claim={claim} compact />;
            }
        }
        return <span key={i}>{renderMarkdown(part)}</span>;
    });
}

function StreamingMessage({ msg, onStreamUpdate }: { msg: ChatMessage, onStreamUpdate: () => void }) {
    const [displayedLength, setDisplayedLength] = useState(msg.streaming ? 0 : msg.text.length);
    const textRef = useRef(msg.text);

    useEffect(() => {
        textRef.current = msg.text;
        if (!msg.streaming) {
            setDisplayedLength(msg.text.length);
            return;
        }

        let animationFrame: number;
        let lastTime = performance.now();
        const charsPerSecond = 450; // ~18 chars per 40ms frame

        const stream = (time: number) => {
            const dt = time - lastTime;
            lastTime = time;

            setDisplayedLength(prev => {
                const next = prev + Math.max(1, Math.floor((dt / 1000) * charsPerSecond));
                if (next >= textRef.current.length) {
                    msg.streaming = false; // Mutate local obj so it doesn't stream again on re-render
                    return textRef.current.length;
                }
                return next;
            });

            onStreamUpdate(); // trigger scroll
            if (msg.streaming) animationFrame = requestAnimationFrame(stream);
        };

        animationFrame = requestAnimationFrame(stream);
        return () => cancelAnimationFrame(animationFrame);
    }, [msg, onStreamUpdate]);

    const isStreaming = displayedLength < msg.text.length;
    const currentText = msg.text.slice(0, displayedLength);

    return (
        <div className="space-y-0.5">
            {isStreaming ? (
                <span>
                    {renderMarkdown(currentText)}
                    <span className="inline-block w-2 bg-cyan-400 ml-0.5 animate-pulse" style={{ height: '1em', verticalAlign: 'text-bottom' }} />
                </span>
            ) : (
                msg.claims ? parseAriaText(msg.text, msg.claims) : <span className="whitespace-pre-wrap">{renderMarkdown(msg.text)}</span>
            )}
        </div>
    );
}

function MessageBubble({ msg, onStreamUpdate }: { msg: ChatMessage, onStreamUpdate: () => void }) {
    const isAria = msg.role === 'aria';
    const isSystem = msg.role === 'system';

    // Feature 6: ARIA Confidence Visual Tell
    const [showTell, setShowTell] = useState(false);

    // Task 9: ARIA Confidence Meter — parse self-reported % from message text
    const confidenceMatch = isAria
        ? msg.text.match(/(\d{1,3})%\s*(confidence|certainty|certain|match|accurate)/i)
        : null;
    const confidencePct = confidenceMatch ? Math.min(100, parseInt(confidenceMatch[1], 10)) : null;

    // Check if this message has any hallucinations
    const hasHallucination = isAria && msg.claims && msg.claims.some(c => c.isHallucination);

    useEffect(() => {
        if (hasHallucination && !msg.streaming) {
            // Trigger the tell shortly after streaming finishes
            const timer = setTimeout(() => {
                setShowTell(true);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setShowTell(false);
        }
    }, [hasHallucination, msg.streaming]);

    if (isSystem) {
        if (msg.text === 'THINKING') {
            return (
                <div className="px-3 py-1.5 text-center flex items-center justify-center gap-1.5 opacity-70">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 dot-1" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 dot-2" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 dot-3" />
                </div>
            );
        }
        if (msg.text.includes('No evidence file selected')) {
            return (
                <div className="px-3 py-2 my-2">
                    <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-3 text-amber-500 font-mono text-[10px] whitespace-pre-wrap leading-relaxed shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                        {msg.text}
                    </div>
                </div>
            );
        }

        return (
            <div className="px-3 py-1.5 text-center">
                <span className="text-[10px] font-mono text-[#374151] italic">{msg.text}</span>
            </div>
        );
    }

    return (
        <div className={`flex gap-2.5 px-3 py-2 ${isAria ? '' : 'flex-row-reverse'}`}>
            {/* Avatar */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-opacity duration-300 ${isAria ? 'bg-cyan-400/20 border border-cyan-400/30 avatar-float' : 'bg-purple-400/20 border border-purple-400/30'
                } ${showTell ? 'opacity-40' : 'opacity-100'}`}>
                {isAria
                    ? <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    : <User className="w-3.5 h-3.5 text-purple-400" />
                }
            </div>

            {/* Bubble */}
            <div className={`flex-1 min-w-0 ${isAria ? '' : 'flex flex-col items-end'}`}>
                <div className={`text-[10px] font-mono mb-1 ${isAria ? 'text-cyan-400' : 'text-purple-400'}`}>
                    {isAria ? 'ARIA' : 'INVESTIGATOR'}
                </div>
                <div className={`text-xs leading-relaxed rounded-lg p-2.5 max-w-full ${isAria
                    ? 'bg-[#111827] border border-[#1f2937] text-slate-300'
                    : 'bg-purple-900/30 border border-purple-800/40 text-purple-200'
                    }`}>
                    {isAria ? <StreamingMessage msg={msg} onStreamUpdate={onStreamUpdate} /> : <span className="whitespace-pre-wrap">{renderMarkdown(msg.text)}</span>}
                </div>
                {/* Task 9: ARIA Confidence Meter */}
                {isAria && confidencePct !== null && !msg.streaming && (
                    <div className="mt-1.5 w-full">
                        <div className="h-1 w-full rounded-full bg-[#1f2937] overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                    confidencePct > 85 ? 'bg-red-500' :
                                    confidencePct > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                                }`}
                                style={{ width: `${confidencePct}%` }}
                            />
                        </div>
                        <p className={`text-[9px] font-mono mt-0.5 ${
                            confidencePct > 85 ? 'text-red-400' :
                            confidencePct > 50 ? 'text-amber-400/80' : 'text-emerald-400/80'
                        }`}>
                            ARIA self-reported confidence: {confidencePct}%
                            {confidencePct > 85 && ' — ⚠️ High confidence claims require independent verification'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export function ARIAChat() {
    const { state, dispatch } = useGame();
    const { askAria, isLiveMode, isGenerating } = useAria();
    const [input, setInput] = useState('');
    const [inlineWarning, setInlineWarning] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const headerControls = useAnimation();

    // Task 4: detect API failure mid-session
    const modeLabel = state.liveAIFailed
        ? 'SCRIPTED (API Unavailable)'
        : isLiveMode ? '⚡ Live Gemini' : 'Pre-scripted';
    const modeClass = state.liveAIFailed
        ? 'text-amber-400 border-amber-800/50 bg-amber-900/20'
        : isLiveMode
            ? 'text-violet-400 border-violet-800/50 bg-violet-900/20'
            : 'text-[#374151] border-[#1f2937]';

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        headerControls.start({ backgroundColor: ['rgba(13, 20, 32, 1)', 'rgba(8, 145, 178, 0.2)', 'rgba(13, 20, 32, 1)'], transition: { duration: 0.6 } });
    }, [state.chatHistory, headerControls]);

    const handleSend = () => {
        const q = input.trim();
        if (!q) return;
        if (isGenerating) return; // guard: one request at a time
        
        if (!state.selectedEvidenceId) {
            dispatch({
                type: 'ADD_CHAT_MESSAGE',
                message: {
                    id: `sys-${Date.now()}`,
                    role: 'system',
                    text: '⚠  No evidence file selected.\nSelect a file from the Evidence Vault on the left, then ask ARIA about it.\nARIA needs an evidence context to generate verifiable claims.',
                    timestamp: new Date(),
                }
            });
            // Do NOT clear input
            return;
        }

        const validation = validateQuery(q);
        if (!validation.valid) {
            if (validation.hard) {
                // Hard block: spam / too short — reject entirely
                setInlineWarning(validation.reason || 'Invalid query');
                return;
            } else {
                // Soft warn: query is broad but allowed — show as system chat message and proceed
                setInlineWarning(null);
                dispatch({
                    type: 'ADD_CHAT_MESSAGE',
                    message: {
                        id: `warn-${Date.now()}`,
                        role: 'system',
                        text: validation.reason || '\u26a0\ufe0f Your query seems broad. Proceeding anyway\u2026',
                        timestamp: new Date(),
                    }
                });
            }
        } else {
            setInlineWarning(null);
        }
        setInput('');

        // Add player message
        dispatch({
            type: 'ADD_CHAT_MESSAGE',
            message: {
                id: `player-${Date.now()}`,
                role: 'player',
                text: q,
                timestamp: new Date(),
            }
        });

        // ARIA responds
        askAria(q, state.selectedEvidenceId);
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1420] border-l border-[#1f2937]">
            {/* Header */}
            <motion.div
                animate={headerControls}
                className="flex items-center gap-2 px-4 py-3 border-b border-[#1f2937]"
            >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono text-[#64748b] uppercase tracking-widest">ARIA Chat</span>
                <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded border ${modeClass}`}>
                    {modeLabel}
                </span>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-1">
                {state.chatHistory.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} onStreamUpdate={() => {
                        // Use a small timeout to let the DOM settle before scrolling
                        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);
                    }} />
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#1f2937] p-3">
                {/* Evidence Context Status Strip */}
                {state.selectedEvidenceId ? (() => {
                    const ev = evidenceList.find(e => e.id === state.selectedEvidenceId);
                    return (
                        <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded bg-emerald-900/20 border border-emerald-800/30 text-emerald-400 text-[10px] font-mono">
                            <span className="font-bold">🔍 CONTEXT:</span> {ev?.filename || state.selectedEvidenceId}
                        </div>
                    );
                })() : (
                    <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded bg-amber-900/20 border border-amber-800/30 text-amber-500 text-[10px] font-mono animate-[pulse_2s_ease-in-out_infinite]">
                        <span className="font-bold">⚠ NO EVIDENCE SELECTED:</span> Select a file to enable ARIA analysis
                    </div>
                )}
                
                <div className="flex gap-2 relative">
                    <div className={`flex-1 relative aria-input-wrap ${input.length === 0 ? 'is-empty' : ''}`}>
                        {inlineWarning && (
                            <div className="absolute -top-10 left-0 right-0 p-2 bg-amber-900/30 border border-amber-500/50 rounded text-[10px] text-amber-500 italic shadow-lg animate-[fadeIn_0.2s_ease-out]">
                                ⚠️ {inlineWarning}
                            </div>
                        )}
                        {isGenerating && (
                            <div className="absolute -top-8 left-0 right-0 p-1.5 bg-violet-900/30 border border-violet-500/40 rounded text-[10px] text-violet-400 font-mono animate-pulse">
                                ⏳ ARIA is processing…
                            </div>
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => {
                                setInput(e.target.value);
                                if (inlineWarning) setInlineWarning(null);
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleSend();
                            }}
                            disabled={isGenerating}
                            placeholder={isGenerating ? 'ARIA is processing…' : 'Ask ARIA about the evidence…'}
                            className={`w-full bg-[#111827] border border-[#1f2937] rounded px-3 py-2 text-xs font-mono text-slate-300 placeholder-[#374151] focus:outline-none focus:border-cyan-400/50 focus:ring-0 transition-colors custom-cursor-input ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label="Ask ARIA"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!state.selectedEvidenceId || isGenerating}
                        title={!state.selectedEvidenceId ? "Select an evidence file first" : isGenerating ? "ARIA is processing" : ""}
                        className="p-2 rounded bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-gray-600 disabled:text-gray-500 transition-colors"
                        aria-label="Send message"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] font-mono text-[#374151] mt-1.5">
                    Tip: Select evidence first, then ask ARIA about it
                </p>
            </div>
        </div>
    );
}
