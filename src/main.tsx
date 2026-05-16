import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ARIA_LOGO_SRC } from './lib/assets.ts'

document.documentElement.style.setProperty('--aria-logo-url', `url("${ARIA_LOGO_SRC}")`);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
