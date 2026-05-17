import React from 'react';
import { Sheet } from './Sheet';

interface PromptSheetProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (value: string) => void | Promise<void>;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
    placeholder?: string;
    defaultValue?: string;
    multiline?: boolean;
    validate?: (value: string) => string | null;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
}

export const PromptSheet: React.FC<PromptSheetProps> = ({
    open,
    onClose,
    onSubmit,
    title,
    subtitle,
    icon,
    placeholder,
    defaultValue = '',
    multiline = false,
    validate,
    confirmLabel = 'Submit',
    cancelLabel = 'Cancel',
    loading = false,
}) => {
    const [value, setValue] = React.useState(defaultValue);
    const [error, setError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (open) {
            setValue(defaultValue);
            setError(null);
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open, defaultValue]);

    const handleSubmit = () => {
        if (loading) return;
        const err = validate?.(value) ?? null;
        if (err) {
            setError(err);
            return;
        }
        onSubmit(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const inputClass =
        'w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-[#F5E6D3] outline-none focus:border-[#2DD4BF] transition-all placeholder-[#F5E6D3]/25';

    return (
        <Sheet
            open={open}
            onClose={onClose}
            variant="auto"
            size="sm"
            showClose={false}
            dismissible={!loading}
        >
            <div className="px-8 pt-10 pb-4 flex flex-col items-center text-center">
                {icon && (
                    <div className="w-16 h-16 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center mb-5 text-[#F5E6D3]">
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
            <div className="px-6 pb-2">
                {multiline ? (
                    <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            if (error) setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        rows={4}
                        className={`${inputClass} resize-none`}
                    />
                ) : (
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            if (error) setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={inputClass}
                    />
                )}
                {error && (
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 text-center">
                        {error}
                    </p>
                )}
            </div>
            <div className="px-6 pb-6 pt-4 grid grid-cols-1 gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 bg-white text-[#080707] shadow-[0_10px_30px_rgba(255,255,255,0.12)] disabled:opacity-60 disabled:cursor-not-allowed"
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

export default PromptSheet;
