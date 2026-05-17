import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    subtitle,
    action,
    className = '',
}) => {
    return (
        <div
            className={`rounded-3xl bg-white/[0.02] border border-white/5 border-dashed p-10 flex flex-col items-center text-center ${className}`}
        >
            {icon && (
                <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-5 text-[#F5E6D3]/70">
                    {icon}
                </div>
            )}
            <h4 className="font-display font-black text-lg text-[#F5E6D3] uppercase tracking-tighter leading-none">
                {title}
            </h4>
            {subtitle && (
                <p className="mt-3 text-[11px] font-bold text-[#8B7E6D] uppercase tracking-[0.2em] leading-relaxed max-w-[22rem]">
                    {subtitle}
                </p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
};

export default EmptyState;
