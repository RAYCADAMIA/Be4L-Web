import React from 'react';

interface CompassIconProps {
    className?: string;
}

export const CompassIcon: React.FC<CompassIconProps> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Top Point - Bolder (Width 10px) */}
            <path d="M12 1L17 12H7L12 1Z" fill="currentColor" />

            {/* Bottom Point - Bolder (Width 10px) */}
            <path d="M12 23L17 12H7L12 23Z" fill="currentColor" fillOpacity="0.7" />

            {/* Center Pivot - Slightly larger */}
            <circle cx="12" cy="12" r="2.5" className="text-black" fill="currentColor" />
        </svg>
    );
};
