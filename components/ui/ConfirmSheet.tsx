import React from 'react';
import { Sheet } from './Sheet';

export type ConfirmTone = 'neutral' | 'success' | 'danger' | 'warning';

interface ConfirmSheetProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    tone?: ConfirmTone;
    icon?: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    confirmLabel: string;
    cancelLabel?: string;
    loading?: boolean;
}

const TONE_BUTTON: Record<ConfirmTone, string> = {
    neutral: 'bg-white text-[#080707] shadow-[0_10px_30px_rgba(255,255,255,0.12)]',
    success: 'bg-emerald-500 text-black shadow-[0_10px_30px_rgba(16,185,129,0.25)]',
    danger: 'bg-red-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.25)]',
    warning: 'bg-[#FF8C00] text-black shadow-[0_10px_30px_rgba(255,140,0,0.3)]',
};

const TONE_ICON_RING: Record<ConfirmTone, string> = {
    neutral: 'bg-white/[0.03] border-white/10 text-[#F5E6D3]',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    danger: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-[#FF8C00]/10 border-[#FF8C00]/30 text-[#FFB854]',
};

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
    open,
    onClose,
    onConfirm,
    tone = 'neutral',
    icon,
    title,
    subtitle,
    confirmLabel,
    cancelLabel = 'Cancel',
    loading = false,
}) => {
    return (
        <Sheet
            open={open}
            onClose={onClose}
            variant="auto"
            size="sm"
            showClose={false}
            dismissible={!loading}
        >
            <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center">
                {icon && (
                    <div
                        className={`w-16 h-16 rounded-full border flex items-center justify-center mb-5 ${TONE_ICON_RING[tone]}`}
                    >
                        {icon}
                    </div>
                )}
                <h3 className="font-display font-black text-xl text-[#F5E6D3] uppercase tracking-tighter leading-none">
                    {title}
                </h3>
                {subtitle && (
                    <p className="mt-3 text-[11px] font-bold text-[#8B7E6D] uppercase tracking-[0.2em] leading-relaxed max-w-[22rem]">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="px-6 pb-6 pt-2 grid grid-cols-1 gap-3">
                <button
                    onClick={() => !loading && onConfirm()}
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${TONE_BUTTON[tone]}`}
                >
                    {loading ? 'Working…' : confirmLabel}
                </button>
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#F5E6D3]/50 hover:text-[#F5E6D3] transition-all bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-60"
                >
                    {cancelLabel}
                </button>
            </div>
        </Sheet>
    );
};

export default ConfirmSheet;
