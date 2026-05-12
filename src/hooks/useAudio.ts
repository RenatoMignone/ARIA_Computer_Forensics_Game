import { useCallback } from 'react';

export function useAudio() {
    const playBeep = useCallback((_freq = 800, _type: OscillatorType = 'sine', _duration = 0.05, _vol = 0.1) => {
        // Terminal audio is intentionally disabled for a quieter investigation flow.
    }, []);

    const playKeystroke = useCallback(() => {
    }, []);

    const playBootSequence = useCallback(() => {
    }, []);

    return { playKeystroke, playBootSequence, playBeep };
}
