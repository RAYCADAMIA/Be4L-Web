import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { motion } from 'framer-motion';

export const DesktopSidebar: React.FC = () => {
    const { user } = useAuth();
    const { tabs, activeTab, setActiveTab } = useNavigation();
    const location = useLocation();
    const navigate = useNavigate();

    if (!user) return null;
    if (tabs.length === 0) return null;

    const handleHaptic = () => {
        if (window.navigator?.vibrate) {
            window.navigator.vibrate(5);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center p-1 bg-white/[0.08] backdrop-blur-3xl border border-white/10 rounded-full relative overflow-hidden shadow-2xl z-40 select-none
                       flex-row w-max h-[42px]
                       md:flex-col md:w-14 md:h-auto md:pb-3"
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Navigation (Contextual Tabs) */}
            <nav className="flex items-center relative z-10 gap-0.5 flex-row md:flex-col md:gap-2 md:pt-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => {
                                handleHaptic();
                                setActiveTab(tab.value);
                            }}
                            className={`
                                flex flex-col items-center justify-center gap-0.5 rounded-full transition-all duration-300 group relative
                                h-8 px-4 md:px-0 md:w-12 md:h-10 md:rounded-xl
                                ${isActive ? 'text-primary' : 'text-white/40 hover:text-white'}
                            `}
                        >
                            {/* Icon if available */}
                            {tab.icon && (
                                <tab.icon
                                    size={14}
                                    strokeWidth={2.5}
                                    className="relative z-10 md:w-4 md:h-4"
                                    style={{ filter: isActive ? 'drop-shadow(0 0 5px rgba(204,255,0,0.5))' : 'none' }}
                                />
                            )}

                            {/* Label */}
                            <span className={`relative z-10 text-[7px] md:text-[6px] font-black uppercase tracking-[0.15em] whitespace-nowrap ${isActive ? 'text-primary md:text-white' : 'md:text-gray-500'}`} style={{
                                textShadow: isActive ? '0 0 12px rgba(204,255,0,0.8)' : 'none'
                            }}>
                                {tab.label}
                            </span>

                            {/* Active Pill Background */}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebarActivePill"
                                    className="absolute inset-0 bg-white/10 rounded-full md:rounded-xl border border-white/20 -z-0 shadow-[0_0_20px_rgba(204,255,0,0.1)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    );
                })}

                {tabs.length === 0 && (
                    <div className="flex flex-row md:flex-col items-center gap-2 opacity-20 px-8 py-2 md:py-8">
                        <div className="w-1.5 h-1.5 md:w-10 md:h-10 rounded-full bg-white/40 md:border md:border-dashed" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">VOID</span>
                    </div>
                )}
            </nav>
        </motion.div>
    );
};
