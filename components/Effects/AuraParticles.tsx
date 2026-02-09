import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    velocity: { x: number; y: number };
}

interface AuraParticlesProps {
    trigger: number; // Increment to trigger
    x?: number;
    y?: number;
    amount?: number;
}

export const AuraParticles: React.FC<AuraParticlesProps> = ({ trigger, x = window.innerWidth / 2, y = window.innerHeight / 2, amount = 20 }) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (trigger === 0) return;

        const timestamp = Date.now();
        const newParticles: Particle[] = Array.from({ length: amount }).map((_, i) => ({
            id: timestamp + i + Math.random(), // Ensure uniqueness
            x: x,
            y: y,
            color: i % 2 === 0 ? '#FFD700' : '#A855F7', // Gold and Purple
            size: Math.random() * 6 + 2,
            velocity: {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10
            }
        }));

        setParticles(prev => [...prev, ...newParticles]);

        const timeout = setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1000);

        return () => clearTimeout(timeout);
    }, [trigger, x, y, amount]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 1, x: p.x, y: p.y, scale: 1 }}
                        animate={{
                            opacity: 0,
                            x: p.x + p.velocity.x * 50,
                            y: p.y + p.velocity.y * 50,
                            scale: 0
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            width: p.size,
                            height: p.size,
                            borderRadius: '50%',
                            backgroundColor: p.color,
                            boxShadow: `0 0 ${p.size * 2}px ${p.color}`
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
