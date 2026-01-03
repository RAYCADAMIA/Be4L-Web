import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Aesthetic App Background (Aurora Mesh)
 */
export const AestheticAppBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 bg-black pointer-events-none">
                <div className="absolute inset-0 bg-[#050505]" />
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse-slow delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] animate-float" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

/**
 * Glassmorphism Card
 */
export const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = "", children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={`
                bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl 
                shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] 
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
});

/**
 * Gradient Action Button
 */
export const GradientButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode, fullWidth?: boolean }> = ({
    children, className = "", icon, fullWidth = false, ...props
}) => {
    return (
        <button
            className={`
                relative px-6 py-3 rounded-xl font-black uppercase tracking-wider text-xs text-black
                bg-gradient-to-r from-primary to-lime-400
                shadow-[0_0_20px_rgba(204,255,0,0.3)]
                transition-all duration-300
                hover:shadow-[0_0_40px_rgba(204,255,0,0.5)] hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 overflow-hidden group
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">
                {icon}
                {children}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
        </button>
    );
};

/**
 * Glowing Text Header
 */
export const GlowText: React.FC<{ children: React.ReactNode; className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ children, className = "", size = 'md' }) => {
    const sizes = {
        sm: "text-sm",
        md: "text-xl",
        lg: "text-3xl",
        xl: "text-5xl"
    };

    return (
        <h1 className={`font-black italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${sizes[size]} ${className}`}>
            {children}
        </h1>
    );
};

/**
 * Aesthetic Feed Placeholder / Unlock Overlay
 */
export const FeedPlaceholder: React.FC<{
    title: string;
    description: string;
    icon?: React.ReactNode;
    buttonLabel?: string;
    onAction?: () => void
}> = ({ title, description, icon, buttonLabel, onAction }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 py-20 animate-in fade-in zoom-in duration-700">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-2xl">
                    {icon}
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{title}</h3>
                <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed font-medium uppercase tracking-widest">{description}</p>
            </div>
            {buttonLabel && onAction && (
                <GradientButton onClick={onAction} className="mt-4 px-8 py-4 h-auto">
                    {buttonLabel}
                </GradientButton>
            )}
        </div>
    );
};

/**
 * Aesthetic Pulse Loader (HD)
 */
export const EKGLoader: React.FC<{ size?: number; color?: string; isFlatline?: boolean; className?: string; showLabel?: boolean }> = ({ size = 120, color = "#CCFF00", isFlatline = false, className = "", showLabel = true }) => {
    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <svg width={size} height={size / 2} viewBox="0 0 120 60" className="opacity-80 drop-shadow-[0_0_10px_rgba(204,255,0,0.3)]">
                <motion.path
                    d="M0 30 H20 L25 10 L35 50 L45 30 H70 L75 5 L85 55 L95 30 H120"
                    fill="transparent"
                    stroke={isFlatline ? "#ef4444" : color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0.2 }}
                    animate={{
                        pathLength: [0, 1, 1],
                        pathOffset: isFlatline ? 0 : [0, 0, 1],
                        opacity: [0.2, 1, 0.2]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </svg>
            {showLabel && (
                <span className={`text-[9px] font-black uppercase tracking-[0.4em] animate-pulse italic ${isFlatline ? 'text-red-500' : 'text-primary'}`}>
                    {isFlatline ? 'Critical Pulse' : 'Syncing Vitals...'}
                </span>
            )}
        </div>
    );
};

/**
 * Heartbeat Effect Transition
 */
export const HeartbeatTransition: React.FC<{ children: React.ReactNode; isVisible?: boolean, loading?: boolean, label?: string }> = ({ children, isVisible = true, loading, label }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <EKGLoader />
                {label && <p className="text-[10px] text-white/30 uppercase mt-4 tracking-widest font-bold">{label}</p>}
            </div>
        )
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="w-full h-full"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
