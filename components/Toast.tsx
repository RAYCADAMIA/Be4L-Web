
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3s
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Render Toasts - Positioned Top Center within the viewport */}
            {createPortal(
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[350px] pointer-events-none px-4">
                    {toasts.map(toast => (
                        <div
                            key={toast.id}
                            className={`
                                pointer-events-auto
                                flex items-center gap-3 px-5 py-3.5 rounded-[22px]
                                bg-black/60 backdrop-blur-3xl border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.4)]
                                animate-in slide-in-from-top-4 fade-in duration-500
                                ${toast.type === 'success' ? 'border-primary/20' : ''}
                                ${toast.type === 'error' ? 'border-red-500/20' : ''}
                            `}
                        >
                            <div className={`
                                shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                                ${toast.type === 'success' ? 'bg-primary text-black' : ''}
                                ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
                                ${toast.type === 'info' ? 'bg-white/10 text-white' : ''}
                            `}>
                                {toast.type === 'success' && <Check strokeWidth={3} size={12} />}
                                {toast.type === 'error' && <AlertCircle strokeWidth={3} size={12} />}
                                {toast.type === 'info' && <Info strokeWidth={3} size={12} />}
                            </div>

                            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/90 flex-1 leading-tight">
                                {toast.message}
                            </p>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
