import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    images: string[];
    interval?: number;
    className?: string;
}

export const CardSlideshow: React.FC<Props> = ({ images, interval = 2500, className = '' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images, interval]);

    if (!images || images.length === 0) return null;

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <AnimatePresence initial={false}>
                <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

            {/* Progress Bars */}
            {images.length > 1 && (
                <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                    {images.map((_, idx) => (
                        <div key={idx} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: "0%" }}
                                animate={{ width: idx === currentIndex ? "100%" : idx < currentIndex ? "100%" : "0%" }}
                                transition={idx === currentIndex ? { duration: interval / 1000, ease: "linear" } : { duration: 0 }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
