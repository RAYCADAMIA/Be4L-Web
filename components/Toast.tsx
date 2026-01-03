
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
                                flex items-center gap-3 p-4 rounded-2xl
                                backdrop-blur-xl border shadow-2xl
                                animate-in slide-in-from-top-4 fade-in duration-300
                                ${toast.type === 'success' ? 'bg-primary/10 border-primary/50 text-white' : ''}
                                ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-white' : ''}
                                ${toast.type === 'info' ? 'bg-gray-900/90 border-white/10 text-white' : ''}
                            `}
                        >
                            <div className={`
                                shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                                ${toast.type === 'success' ? 'bg-primary text-black' : ''}
                                ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
                                ${toast.type === 'info' ? 'bg-white/10 text-white' : ''}
                            `}>
                                {toast.type === 'success' && <Check strokeWidth={3} size={16} />}
                                {toast.type === 'error' && <AlertCircle strokeWidth={3} size={16} />}
                                {toast.type === 'info' && <Info strokeWidth={3} size={16} />}
                            </div>

                            <p className="text-sm font-bold flex-1 leading-tight tracking-wide">
                                {toast.message}
                            </p>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
                            >
                                <X size={16} className="opacity-50" />
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
