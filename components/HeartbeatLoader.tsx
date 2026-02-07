import React from 'react';
import { motion } from 'framer-motion';

export const HeartbeatLoader: React.FC = () => {
    return (
        <div className="flex items-center justify-center p-8">
            <motion.svg
                viewBox="0 0 200 100"
                className="w-48 h-auto"
            >
                <motion.path
                    d="M0,50 L40,50 L50,20 L70,80 L80,50 L120,50 L130,20 L150,80 L160,50 L200,50"
                    fill="transparent"
                    stroke="url(#pulse-gradient-loader)"
                    strokeWidth="3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: [0, 1, 1],
                        opacity: [0, 1, 0],
                        pathOffset: [0, 0, 1]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.5, 1]
                    }}
                />
                <defs>
                    <linearGradient id="pulse-gradient-loader" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2DD4BF" />
                        <stop offset="50%" stopColor="#2DD4BF" />
                        <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                </defs>
            </motion.svg>
        </div>
    );
};
