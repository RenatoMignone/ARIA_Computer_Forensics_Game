import './index.css';
import { GameProvider, useGame } from './context/GameContext';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/ToastContainer';
import { AppShell } from './components/AppShell';
import { Tutorial } from './components/Tutorial';
import { GlossaryModal } from './components/GlossaryModal';
import { DebriefScreen } from './components/DebriefScreen';

import { useState } from 'react';
import { BootSequence } from './components/BootSequence';
import { DifficultyScreen } from './components/DifficultyScreen';

function GameRouter() {
    const { state } = useGame();
    const [bootComplete, setBootComplete] = useState(false);

    if (!bootComplete) {
        return <BootSequence onComplete={() => setBootComplete(true)} />;
    }

    if (state.phase === 'difficulty') {
        return <DifficultyScreen />;
    }

    if (state.phase === 'debrief') {
        return <DebriefScreen />;
    }

    return (
        <>
            <AppShell />
            <Tutorial />
            <GlossaryModal />
            <ToastContainer />
        </>
    );
}

function App() {
    return (
        <ToastProvider>
            <GameProvider>
                <GameRouter />
            </GameProvider>
        </ToastProvider>
    );
}

export default App;
