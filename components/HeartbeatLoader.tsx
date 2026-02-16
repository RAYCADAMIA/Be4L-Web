import React from 'react';
import { motion } from 'framer-motion';

export const HeartbeatLoader: React.FC = () => {
    return (
        <div className="flex items-center justify-center p-8">
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-16 h-16 bg-electric-teal/20 rounded-full blur-xl"
            />
        </div>
    );
};
