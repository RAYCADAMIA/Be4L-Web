import React, { useRef, useState } from 'react';

interface HorizontalRailProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}

export const HorizontalRail: React.FC<HorizontalRailProps> = ({
    children,
    className = "",
    containerClassName = ""
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const velocity = useRef(0);
    const lastX = useRef(0);
    const lastTime = useRef(0);
    const animationFrameId = useRef<number>();
    const snapTimeoutId = useRef<NodeJS.Timeout>();

    // Smart Snap: Disable snap while scrolling (trackpad/swipe), re-enable after stop
    const handleScroll = () => {
        if (!scrollRef.current || isDragging.current) return;

        // Disable snap to allow free momentum
        scrollRef.current.style.scrollSnapType = 'none';

        // Clear existing timeout
        if (snapTimeoutId.current) clearTimeout(snapTimeoutId.current);

        // Re-enable snap after scrolling stops (150ms debounce)
        snapTimeoutId.current = setTimeout(() => {
            if (scrollRef.current && !isDragging.current) {
                scrollRef.current.style.scrollSnapType = 'x mandatory';
            }
        }, 150);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;

        // Reset velocity tracking
        velocity.current = 0;
        lastX.current = e.pageX;
        lastTime.current = performance.now();
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);

        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.scrollSnapType = 'none'; // Disable snap while dragging
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 1; // 1:1 movement to match touch
        scrollRef.current.scrollLeft = scrollLeft.current - walk;

        // Calculate velocity
        const now = performance.now();
        const dt = now - lastTime.current;
        if (dt > 0) {
            velocity.current = (e.pageX - lastX.current) / dt;
            lastX.current = e.pageX;
            lastTime.current = now;
        }
    };

    const applyMomentum = () => {
        if (!scrollRef.current || Math.abs(velocity.current) < 0.01) {
            if (scrollRef.current) {
                scrollRef.current.style.scrollSnapType = 'x mandatory'; // Re-enable snap
            }
            return;
        }

        if (scrollRef.current) {
            scrollRef.current.scrollLeft -= velocity.current * 16;
            velocity.current *= 0.96; // Slightly less friction for longer glide (closer to iOS/Android)
            animationFrameId.current = requestAnimationFrame(applyMomentum);
        }
    };

    const stopDragging = () => {
        if (!isDragging.current || !scrollRef.current) return;
        isDragging.current = false;
        scrollRef.current.style.cursor = 'pointer';

        // Start momentum decay
        animationFrameId.current = requestAnimationFrame(applyMomentum);
    };

    return (
        <div className={`relative group/rail w-full ${containerClassName}`}>
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={stopDragging}
                onMouseLeave={stopDragging}
                className={`flex overflow-x-auto no-scrollbar items-center ${className}`}
            >
                {children}
            </div>
        </div>
    );
};

export default HorizontalRail;
