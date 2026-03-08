import { useCallback, useRef } from 'react';

export function useAudio() {
    const audioCtxRef = useRef<AudioContext | null>(null);

    const getCtx = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioCtxRef.current;
    };

    const playBeep = useCallback((freq = 800, type: OscillatorType = 'sine', duration = 0.05, vol = 0.1) => {
        try {
            const enabled = localStorage.getItem('aria_settings_sound') !== 'false';
            if (!enabled) return;

            const ctx = getCtx();
            if (ctx.state === 'suspended') ctx.resume();
            
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            gainNode.gain.setValueAtTime(vol, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Ignore if AudioContext fails (e.g. strict browser policies)
        }
    }, []);

    const playKeystroke = useCallback(() => {
        // High pitched click for mechanical feel
        playBeep(2000, 'square', 0.02, 0.01);
    }, [playBeep]);

    const playBootSequence = useCallback(() => {
        // Startup sequence of beeps
        playBeep(440, 'sine', 0.1, 0.05);
        setTimeout(() => playBeep(660, 'sine', 0.1, 0.05), 150);
        setTimeout(() => playBeep(880, 'sine', 0.2, 0.05), 300);
    }, [playBeep]);

    return { playKeystroke, playBootSequence, playBeep };
}
