import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';

export type SheetVariant = 'bottom-sheet' | 'dialog' | 'fullscreen' | 'auto';
export type SheetSize = 'sm' | 'md' | 'lg' | 'xl';

interface SheetProps {
    open: boolean;
    onClose: () => void;
    variant?: SheetVariant;
    size?: SheetSize;
    showClose?: boolean;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    headerAccessory?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    bodyClassName?: string;
    dismissible?: boolean;
    children: React.ReactNode;
}

const SIZE_MAX_W: Record<SheetSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

const useIsMobile = () => {
    const [isMobile, setIsMobile] = React.useState(
        typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
    );
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    return isMobile;
};

export const Sheet: React.FC<SheetProps> = ({
    open,
    onClose,
    variant = 'auto',
    size = 'md',
    showClose = true,
    title,
    subtitle,
    headerAccessory,
    footer,
    className = '',
    bodyClassName = '',
    dismissible = true,
    children,
}) => {
    const isMobile = useIsMobile();
    const resolvedVariant: Exclude<SheetVariant, 'auto'> =
        variant === 'auto' ? (isMobile ? 'bottom-sheet' : 'dialog') : variant;

    const contentRef = useRef<HTMLDivElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    // Escape key + body scroll lock + focus management
    useEffect(() => {
        if (!open) return;
        previouslyFocused.current = document.activeElement as HTMLElement;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && dismissible) onClose();
        };
        window.addEventListener('keydown', handleKey);

        // Focus into the sheet
        requestAnimationFrame(() => {
            contentRef.current?.focus();
        });

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKey);
            previouslyFocused.current?.focus?.();
        };
    }, [open, onClose, dismissible]);

    const handleDragEnd = useCallback(
        (_: any, info: PanInfo) => {
            if (!dismissible) return;
            const shouldClose = info.velocity.y > 500 || info.offset.y > 150;
            if (shouldClose) onClose();
        },
        [onClose, dismissible]
    );

    const handleBackdropClick = () => {
        if (dismissible) onClose();
    };

    if (typeof document === 'undefined') return null;

    const backdrop = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />
    );

    const header = (title || showClose || headerAccessory) ? (
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3 border-b border-white/5">
            <div className="min-w-0 flex-1">
                {title && (
                    <h2 className="text-white font-display font-black text-lg leading-tight truncate">
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 truncate">
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {headerAccessory}
                {showClose && dismissible && (
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    ) : null;

    const contentBase = 'bg-[#0A0A0A] border border-white/10 text-white relative flex flex-col focus:outline-none';

    let container: React.ReactNode;

    if (resolvedVariant === 'bottom-sheet') {
        container = (
            <motion.div
                ref={contentRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                drag={dismissible ? 'y' : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.4 }}
                onDragEnd={handleDragEnd}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className={`${contentBase} absolute bottom-0 left-0 right-0 rounded-t-3xl max-h-[92vh] ${className}`}
            >
                <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-white/15" aria-hidden />
                {header}
                <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>
                {footer && (
                    <div className="border-t border-white/5 px-6 py-4 bg-[#0A0A0A]/95 backdrop-blur">
                        {footer}
                    </div>
                )}
            </motion.div>
        );
    } else if (resolvedVariant === 'fullscreen') {
        container = (
            <motion.div
                ref={contentRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`${contentBase} absolute inset-0 flex flex-col ${className}`}
            >
                {header}
                <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>
                {footer && (
                    <div className="border-t border-white/5 px-6 py-4 bg-[#0A0A0A]/95 backdrop-blur">
                        {footer}
                    </div>
                )}
            </motion.div>
        );
    } else {
        // dialog
        container = (
            <motion.div
                ref={contentRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className={`${contentBase} relative mx-auto my-auto w-full ${SIZE_MAX_W[size]} rounded-3xl max-h-[90vh] shadow-[0_30px_80px_rgba(0,0,0,0.5)] ${className}`}
            >
                {header}
                <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>
                {footer && (
                    <div className="border-t border-white/5 px-6 py-4 bg-[#0A0A0A]/95 backdrop-blur rounded-b-3xl">
                        {footer}
                    </div>
                )}
            </motion.div>
        );
    }

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
                    {backdrop}
                    <div className="relative w-full h-full flex items-end md:items-center md:justify-center pointer-events-none">
                        <div className="w-full pointer-events-auto h-full md:h-auto flex md:block items-end">
                            {container}
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

// Convenience helper for building a step-indicator row
export const SheetStepper: React.FC<{ current: number; total: number; className?: string }> = ({
    current,
    total,
    className = '',
}) => {
    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                        i < current
                            ? 'w-6 bg-electric-teal'
                            : i === current
                            ? 'w-8 bg-electric-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]'
                            : 'w-4 bg-white/10'
                    }`}
                />
            ))}
        </div>
    );
};

export default Sheet;
