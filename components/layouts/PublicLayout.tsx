import React from 'react';
import { Outlet } from 'react-router-dom';

export const PublicLayout: React.FC = () => {
    return (
        <div className="relative flex flex-col min-h-screen w-full text-white">
            {/* Background Effects - Fixed so they don't scroll away */}
            {/* Removed redundant blobs to use global vibrant background */}

            {/* Content Contentenv - Using flex-1 to fill available space */}
            <div className="relative z-10 w-full flex-1 flex flex-col">
                <Outlet />
            </div>

            {/* Footer / Copyright */}

        </div>
    );
};
