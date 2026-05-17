import React, { useRef, useEffect } from 'react';
import { Camera, Send, Loader2 } from 'lucide-react';

interface ChatComposerProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onCamera?: () => void;
    disabled?: boolean;
    sending?: boolean;
    cooldown?: number; // seconds remaining, 0 = idle
    placeholder?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
    value,
    onChange,
    onSend,
    onCamera,
    disabled = false,
    sending = false,
    cooldown = 0,
    placeholder = 'Send a message…',
}) => {
    const ref = useRef<HTMLTextAreaElement>(null);

    // Auto-grow (1-5 lines)
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = 'auto';
        const lineHeight = 20;
        const maxH = lineHeight * 5 + 16;
        el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
    }, [value]);

    const canSend = !disabled && !sending && cooldown === 0 && value.trim().length > 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (canSend) onSend();
        }
    };

    return (
        <div className="px-4 py-3 border-t border-white/5 bg-[#0E0C0B]/95 backdrop-blur-xl">
            <div className="flex items-end gap-2">
                {onCamera && (
                    <button
                        type="button"
                        onClick={onCamera}
                        aria-label="Open camera"
                        className="shrink-0 w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 text-[#F5E6D3]/70 hover:text-[#F5E6D3] hover:bg-white/[0.07] transition-all active:scale-95 flex items-center justify-center"
                    >
                        <Camera size={18} />
                    </button>
                )}
                <div
                    className={`flex-1 min-w-0 flex items-end gap-2 rounded-full bg-white/[0.04] border px-4 py-2 transition-colors ${
                        value.trim().length > 0
                            ? 'border-[#2DD4BF]/40'
                            : 'border-white/10 focus-within:border-[#2DD4BF]/40'
                    }`}
                >
                    <textarea
                        ref={ref}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder={cooldown > 0 ? `Cooldown… ${cooldown}s` : placeholder}
                        disabled={disabled || cooldown > 0}
                        className="flex-1 bg-transparent resize-none outline-none text-sm font-medium text-[#F5E6D3] placeholder-[#F5E6D3]/30 leading-5 py-1.5 max-h-32"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => canSend && onSend()}
                    disabled={!canSend}
                    aria-label="Send"
                    className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                        canSend
                            ? 'bg-[#2DD4BF] text-black shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:scale-105'
                            : 'bg-white/5 text-[#F5E6D3]/20 cursor-not-allowed'
                    }`}
                >
                    {sending || cooldown > 0 ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Send size={16} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatComposer;
