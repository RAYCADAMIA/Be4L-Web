import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountRecoveryModal } from './AccountRecoveryModal';
import { AuthBox } from './Auth/AuthBox';

interface AuthScreenProps {
    onClose: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onClose }) => {
    const [showRecovery, setShowRecovery] = useState(false);
    const [isLogin] = useState(false); // Default state for parent styling if needed

    return (
        <div className="relative w-full bg-transparent overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[600px] lg:min-h-[750px]">

            {/* Left Side: Dynamic Virtual Interface */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-electric-teal/10 via-transparent to-electric-teal/5" />

                {/* 3D-like Composition */}
                <div className="relative w-full h-[500px] flex items-center justify-center">

                    {/* Background Glow */}
                    <div className="absolute w-[500px] h-[500px] bg-electric-teal/5 blur-[120px] rounded-full animate-pulse" />

                    {/* Floating Interface Elements */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 w-full flex items-center justify-center"
                    >
                        {/* Central "Core" */}
                        <motion.div
                            animate={{
                                rotateY: [0, 360],
                                rotate: [0, 45, 0]
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center p-4 backdrop-blur-sm"
                        >
                            <div className="w-full h-full rounded-full border border-electric-teal/20 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-electric-teal/10 animate-pulse shadow-[0_0_30px_rgba(45,212,191,0.2)]" />
                            </div>
                        </motion.div>

                        {/* Orbiting Cards */}
                        {[0, 120, 240].map((angle, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    rotate: [angle, angle + 360],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute w-full h-full"
                            >
                                <motion.div
                                    animate={{
                                        rotate: [0, -360],
                                        y: [0, -10, 10, 0]
                                    }}
                                    transition={{
                                        rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-32 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3"
                                >
                                    <div className="w-full h-full border border-white/5 rounded-xl bg-gradient-to-br from-white/5 to-transparent flex flex-col gap-2 p-2">
                                        <div className="w-4 h-4 rounded bg-electric-teal/20" />
                                        <div className="w-full h-1 bg-white/10 rounded-full" />
                                        <div className="w-2/3 h-1 bg-white/10 rounded-full" />
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Scanning Line Effect */}
                    <motion.div
                        animate={{
                            top: ['0%', '100%', '0%']
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric-teal/20 to-transparent z-20"
                    />
                </div>
            </div>

            {/* Right Side: Small Minimalistic Auth Box */}
            <div className="flex-1 lg:flex-none lg:w-[480px] flex items-center justify-center lg:justify-end p-4 md:p-10 relative">
                <AuthBox onSuccess={onClose} />

                {/* Close Button Interactions */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 lg:hidden p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all focus:ring-2 focus:ring-electric-teal outline-none"
                >
                    <X size={24} aria-hidden="true" />
                </button>
            </div>
            <AccountRecoveryModal isOpen={showRecovery} onClose={() => setShowRecovery(false)} />
        </div>
    );
};
