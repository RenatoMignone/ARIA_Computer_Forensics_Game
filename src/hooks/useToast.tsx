import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success-hallu' | 'success-verify' | 'error-hallu' | 'error-verify' | 'info';

export interface ToastConfig {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    toasts: ToastConfig[];
    showToast: (config: Omit<ToastConfig, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastConfig[]>([]);

    const showToast = useCallback((config: Omit<ToastConfig, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts(prev => {
            const newToasts = [...prev, { ...config, id }];
            // Max 2 toasts visible simultaneously
            return newToasts.slice(-2);
        });

        // Auto-dismiss after 3.5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3500);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
