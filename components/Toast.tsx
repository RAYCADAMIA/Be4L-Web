
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Check } from 'lucide-react';
import { createPortal } from 'react-dom';


export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, options?: { icon?: React.ReactNode, action?: { label: string, onClick: () => void } }) => void;
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

    const showToast = useCallback((message: string, type: ToastType = 'info', options?: { icon?: React.ReactNode, action?: { label: string, onClick: () => void } }) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type, ...options }]);

        // Auto remove after 5s if there's an action, else 3s
        const duration = options?.action ? 5000 : 3000;
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Render Toasts - Positioned Top Center within the viewport */}
            {createPortal(
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[400px] pointer-events-none px-4">
                    {toasts.map(toast => (
                        <div
                            key={toast.id}
                            className={`
                                pointer-events-auto
                                flex items-center gap-4 px-6 py-3 rounded-full
                                bg-[#0c0c0c]/80 backdrop-blur-3xl border border-white/[0.12] shadow-[0_30px_60px_rgba(0,0,0,0.6)]
                                animate-in slide-in-from-top-6 fade-in duration-[600ms] ease-[0.22,1,0.36,1]
                                ${toast.type === 'success' ? 'border-primary/30 ring-1 ring-primary/10' : ''}
                                ${toast.type === 'error' ? 'border-red-500/30 ring-1 ring-red-500/10' : ''}
                            `}
                        >
                            <div className={`
                                shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                                ${toast.type === 'success' ? 'bg-primary text-black' : ''}
                                ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
                                ${toast.type === 'info' ? 'bg-white/10 text-white' : ''}
                            `}>
                                {toast.icon ? (
                                    toast.icon
                                ) : (
                                    <>
                                        {toast.type === 'success' && <Check strokeWidth={3} size={14} />}
                                        {toast.type === 'error' && <AlertCircle strokeWidth={3} size={14} />}
                                        {toast.type === 'info' && <Info strokeWidth={3} size={14} />}
                                    </>
                                )}
                            </div>

                            <div className="flex-1 flex items-center justify-between gap-5 py-0.5">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 leading-tight whitespace-nowrap">
                                        {toast.message}
                                    </p>
                                </div>

                                {toast.action && (
                                    <button
                                        onClick={() => {
                                            toast.action?.onClick();
                                            removeToast(toast.id);
                                        }}
                                        className="shrink-0 px-4 py-1.5 rounded-full bg-primary text-[9px] font-black uppercase tracking-widest text-black hover:bg-white transition-all shadow-[0_4px_12px_rgba(204,255,0,0.3)] active:scale-95"
                                    >
                                        {toast.action.label}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
