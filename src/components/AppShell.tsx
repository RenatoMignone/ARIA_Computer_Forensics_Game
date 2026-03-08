import { useGame } from '../context/GameContext';
import { EvidenceVault } from './EvidenceVault';
import { Workspace } from './Workspace';
import { ARIAChat } from './ARIAChat';
import { Terminal } from './Terminal';
import { HUD } from './HUD';
import { ForensicErrorModal } from './ForensicErrorModal';
import { useEffect, useState } from 'react';

export function AppShell() {
    const { state, dispatch } = useGame();
    const [glitching, setGlitching] = useState(false);
    
    // Resizer State
    const [terminalHeight, setTerminalHeight] = useState(220);
    const [chatWidth, setChatWidth] = useState(320);
    const [vaultWidth, setVaultWidth] = useState(208);
    const [showChat, setShowChat] = useState(true);
    const [showTerminal, setShowTerminal] = useState(true);
    const [showVault, setShowVault] = useState(true);
    const [isDraggingTerminal, setIsDraggingTerminal] = useState(false);
    const [isDraggingChat, setIsDraggingChat] = useState(false);
    const [isDraggingVault, setIsDraggingVault] = useState(false);

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (isDraggingTerminal) {
                const newHeight = window.innerHeight - e.clientY;
                setTerminalHeight(Math.min(Math.max(100, newHeight), window.innerHeight * 0.8));
            }
            if (isDraggingChat) {
                const newWidth = window.innerWidth - e.clientX;
                setChatWidth(Math.min(Math.max(250, newWidth), window.innerWidth * 0.5));
            }
            if (isDraggingVault) {
                const newWidth = e.clientX;
                setVaultWidth(Math.min(Math.max(150, newWidth), window.innerWidth * 0.4));
            }
        };
        const handlePointerUp = () => {
            setIsDraggingTerminal(false);
            setIsDraggingChat(false);
            setIsDraggingVault(false);
            document.body.style.cursor = 'default';
        };

        if (isDraggingTerminal || isDraggingChat || isDraggingVault) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
            // Prevent text selection while dragging
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.userSelect = 'auto';
        }

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            document.body.style.userSelect = 'auto';
            document.body.style.cursor = 'default';
        };
    }, [isDraggingTerminal, isDraggingChat, isDraggingVault]);

    useEffect(() => {
        if (state.lastScoreDelta === -30) {
            setGlitching(true);
            const timer = setTimeout(() => {
                setGlitching(false);
                dispatch({ type: 'CLEAR_SCORE_DELTA' });
            }, 600); // 600ms glitch duration
            return () => clearTimeout(timer);
        }
    }, [state.lastScoreDelta, dispatch]);

    useEffect(() => {
        const savedCrt = localStorage.getItem('aria_settings_crt');
        if (savedCrt === 'true') {
            document.body.classList.add('crt-effect');
        }
    }, []);

    // Tutorial Spotlight Logic
    const isTutorial = state.phase === 'tutorial';
    const hlVault = isTutorial && (state.tutorialStep === 1 || state.tutorialStep === 5);
    const hlWorkspace = isTutorial && (state.tutorialStep === 2 || state.tutorialStep === 4);
    const hlChat = isTutorial && state.tutorialStep === 3;
    const hlTerminal = isTutorial && state.tutorialStep === 6;

    const spotlightClasses = "z-[110] ring-4 ring-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.5)] relative pointer-events-none transition-all duration-300";

    return (
        <div className={`flex flex-col h-screen bg-[#0a0e17] overflow-hidden transition-all duration-75 ${glitching ? 'hue-rotate-[-30deg] saturate-150 brightness-110' : ''
            }`}>
            <ForensicErrorModal />
            {/* Top HUD */}
            <HUD 
                showChat={showChat} 
                setShowChat={setShowChat} 
                showTerminal={showTerminal} 
                setShowTerminal={setShowTerminal} 
                showVault={showVault}
                setShowVault={setShowVault}
            />

            {/* Main 3-panel area */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Left: Evidence Vault */}
                {showVault && (
                    <div 
                        className={`flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300 ${hlVault ? spotlightClasses : ''}`}
                        style={{ width: vaultWidth }}
                    >
                        <EvidenceVault />
                    </div>
                )}

                {/* Vertical Resizer Handle (Vault) */}
                {showVault && (
                    <div 
                        className={`w-1 cursor-col-resize hover:bg-cyan-500/50 transition-colors ${isDraggingVault ? 'bg-cyan-500' : 'bg-transparent'}`}
                        onPointerDown={(e) => {
                            e.preventDefault();
                            setIsDraggingVault(true);
                            document.body.style.cursor = 'col-resize';
                        }}
                    />
                )}

                {/* Center: Workspace */}
                <div className={`flex-1 flex flex-col min-w-0 overflow-hidden border-x border-[#1f2937] transition-all duration-300 ${hlWorkspace ? spotlightClasses : ''}`}>
                    <Workspace glitching={glitching} />
                </div>

                {/* Vertical Resizer Handle (Chat) */}
                {showChat && (
                    <div 
                        className={`w-1 cursor-col-resize hover:bg-cyan-500/50 transition-colors ${isDraggingChat ? 'bg-cyan-500' : 'bg-transparent'}`}
                        onPointerDown={(e) => {
                            e.preventDefault();
                            setIsDraggingChat(true);
                            document.body.style.cursor = 'col-resize';
                        }}
                    />
                )}

                {/* Right: ARIA Chat */}
                {showChat && (
                    <div 
                        className={`flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300 ${hlChat ? spotlightClasses : ''}`}
                        style={{ width: chatWidth }}
                    >
                        <ARIAChat />
                    </div>
                )}
            </div>

            {/* Horizontal Resizer Handle (Terminal) */}
            {showTerminal && (
                <div 
                    className={`h-1 cursor-row-resize hover:bg-cyan-500/50 transition-colors z-10 ${isDraggingTerminal ? 'bg-cyan-500' : 'bg-transparent'}`}
                    onPointerDown={(e) => {
                        e.preventDefault();
                        setIsDraggingTerminal(true);
                        document.body.style.cursor = 'row-resize';
                    }}
                />
            )}

            {/* Bottom: Terminal */}
            {showTerminal && (
                <div
                    className={`flex-shrink-0 border-t border-[#1f2937] bg-[#0a0e17] transition-all duration-300 ${hlTerminal ? spotlightClasses : ''}`}
                    style={{ height: terminalHeight }}
                >
                {/* Terminal label bar */}
                <div className="flex items-center gap-2 px-4 py-1.5 border-b border-[#1f2937] bg-[#0d1420]">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-[10px] font-mono text-[#374151] ml-2 uppercase tracking-widest">
                        ARIA Forensic Terminal
                    </span>
                    <span className="ml-auto text-[10px] font-mono text-[#1f2937]">
                        {state.phase === 'debrief' ? 'SESSION CLOSED' : 'ACTIVE'}
                    </span>
                </div>
                <div style={{ height: `calc(${terminalHeight}px - 32px)` }}>
                    <Terminal />
                </div>
            </div>
            )}
        </div>
    );
}
