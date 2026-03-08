import { motion, AnimatePresence } from 'framer-motion';
import { useToast, ToastConfig } from '../hooks/useToast';
import { ShieldCheck, ShieldAlert, AlertCircle, Info } from 'lucide-react';

function ToastItem({ toast }: { toast: ToastConfig }) {

    let Icon = Info;
    let bgColor = 'bg-slate-900 border-slate-700';
    let textColor = 'text-slate-200';
    let iconColor = 'text-slate-400';

    switch (toast.type) {
        case 'success-hallu':
        case 'success-verify':
            Icon = ShieldCheck;
            bgColor = 'bg-[#0f172a] border-emerald-800/50';
            textColor = 'text-emerald-50';
            iconColor = 'text-emerald-400';
            break;
        case 'error-hallu':
        case 'error-verify':
            Icon = ShieldAlert;
            bgColor = 'bg-[#1e1111] border-rose-900/50';
            textColor = 'text-rose-100';
            iconColor = 'text-rose-500';
            break;
        case 'info':
            Icon = AlertCircle;
            bgColor = 'bg-[#0f172a] border-cyan-800/50';
            textColor = 'text-cyan-50';
            iconColor = 'text-cyan-400';
            break;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`flex gap-3 p-3 rounded-lg border shadow-xl shadow-black/50 pointer-events-auto backdrop-blur-md w-80 ${bgColor}`}
            layout
        >
            <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <span className={`block text-sm font-semibold mb-0.5 ${textColor}`}>{toast.title}</span>
                {toast.message && (
                    <span className="block text-xs text-slate-400 leading-snug">{toast.message}</span>
                )}
            </div>
        </motion.div>
    );
}

export function ToastContainer() {
    const { toasts } = useToast();

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
