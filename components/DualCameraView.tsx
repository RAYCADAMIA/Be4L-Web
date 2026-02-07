import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Play, Pause, MapPin, EyeOff, Music } from 'lucide-react';

interface DualCameraViewProps {
    frontImage: string;
    backImage: string;
    musicTrack?: string;
    locationName?: string;
    isPlaying?: boolean;
    onToggleMusic?: () => void;
    onOpenMap?: () => void;
    aspectRatio?: string;
    rounded?: string;
    pipRounded?: string;
    showMetadata?: boolean;
    isSwapped?: boolean;
    className?: string;
    onSwap?: (swapped: boolean) => void;
    onInteractionStart?: () => void; // Triggered on press
    onInteractionEnd?: () => void;   // Triggered on release
    isLocked?: boolean;
    onUnlock?: () => void;
    mediaType?: 'image' | 'video';
}

/**
 * A highly interactive Dual Camera view component.
 * Features:
 * - Tap to swap Primary/Secondary views
 * - Hold to hide PIP and metadata (to see the full main photo)
 * - Draggable PIP that snaps to top corners
 * - Float animation and glassmorphism metadata pills
 */
const DualCameraView: React.FC<DualCameraViewProps> = ({
    frontImage,
    backImage,
    musicTrack,
    locationName,
    isPlaying,
    onToggleMusic,
    onOpenMap,
    aspectRatio = "aspect-[4/5]",
    rounded = "rounded-[1.5rem] md:rounded-[2.5rem]",
    pipRounded = "rounded-[1.2rem] md:rounded-[2rem]",
    showMetadata = true,
    isSwapped: controlledIsSwapped,
    className = "",
    onSwap,
    onInteractionStart,
    onInteractionEnd,
    isLocked = false,
    onUnlock,
    mediaType = 'image'
}) => {
    const [internalIsSwapped, setInternalIsSwapped] = useState(false);
    const isSwapped = controlledIsSwapped ?? internalIsSwapped;

    const [isPaused, setIsPaused] = useState(false);
    const mainVideoRef = useRef<HTMLVideoElement>(null);
    const pipVideoRef = useRef<HTMLVideoElement>(null);

    const toggleSwap = () => {
        if (isLocked) return;
        const newValue = !isSwapped;
        if (controlledIsSwapped === undefined) setInternalIsSwapped(newValue);
        onSwap?.(newValue);
    };

    const handleVideoTap = () => {
        if (mediaType !== 'video') return;
        if (isPaused) {
            setIsPaused(false);
            mainVideoRef.current?.play().catch(e => console.error("Video play failed", e));
            pipVideoRef.current?.play().catch(e => console.error("Video play failed", e));
        } else {
            // Optional: toggle pause? User said "tap to play", so maybe only play if paused
            // But usually toggle is expected.
            setIsPaused(true);
            mainVideoRef.current?.pause();
            pipVideoRef.current?.pause();
        }
    };

    const [isHolding, setIsHolding] = useState(false);
    const [pipCorner, setPipCorner] = useState<'tl' | 'tr'>('tl');

    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingPIP = useRef(false);
    const pipControls = useAnimation();

    const handlePointerDown = (e: React.PointerEvent) => {
        if (isLocked) return;
        // Start long press timer
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = setTimeout(() => {
            setIsHolding(true);
            onInteractionStart?.();
            longPressTimer.current = null;
        }, 200);

        // Capture pointer to track gestures properly
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isLocked) return;
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (isHolding) {
            setIsHolding(false);
            onInteractionEnd?.();
            // Force re-appearance
            pipControls.start({ opacity: 1, scale: 1, x: 0, y: 0 });
        }

        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch (err) { }
    };

    React.useEffect(() => {
        if (isHolding) {
            pipControls.start({ opacity: 0, scale: 0.9, transition: { duration: 0.1 } });
            if (mediaType === 'video') {
                mainVideoRef.current?.pause();
                pipVideoRef.current?.pause();
            }
        } else {
            pipControls.start({ opacity: 1, scale: 1, x: 0, y: 0 });
            if (mediaType === 'video' && !isPaused) {
                mainVideoRef.current?.play().catch(() => { });
                pipVideoRef.current?.play().catch(() => { });
            }
        }
    }, [isHolding, pipControls, mediaType, isPaused]);

    const handleContainerClick = () => {
        if (isLocked) return;
        // Only swap if we aren't holding/dragging
        if (!isHolding && !isDraggingPIP.current) {
            if (mediaType === 'video') {
                handleVideoTap();
            }
            toggleSwap();
        }
    };

    const handlePipDragEnd = (event: any, info: any) => {
        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        const pointerX = info.point.x;

        // Snapping logic: Simple left/right split based on center
        const isRight = pointerX > centerX;
        setPipCorner(isRight ? 'tr' : 'tl');

        // Smoothly snap back to relative origin (0,0) of the target corner class
        pipControls.start({
            x: 0,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8,
                restDelta: 0.01
            }
        });

        // Delay resetting flag to prevent accidental click detection
        setTimeout(() => {
            isDraggingPIP.current = false;
        }, 100);
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${aspectRatio} ${rounded} bg-black overflow-hidden shadow-2xl group border border-white/5 select-none touch-none ${className}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleContainerClick}
        >
            {mediaType === 'video' ? (
                <video
                    ref={mainVideoRef}
                    src={isSwapped ? frontImage : backImage}
                    loop
                    muted={isLocked || isPlaying}
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover pointer-events-none"
                    style={{
                        filter: isLocked ? "blur(40px) brightness(0.6)" : "blur(0px) brightness(1)"
                    }}
                />
            ) : (
                <motion.img
                    src={isSwapped ? frontImage : backImage}
                    alt="Main Capture"
                    initial={false}
                    animate={{
                        scale: 1,
                        filter: isLocked ? "blur(40px) brightness(0.6)" : "blur(0px) brightness(1)"
                    }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover pointer-events-none"
                />
            )}

            {/* 2. Draggable PIP Secondary Image */}
            <motion.div
                layout
                drag={!isLocked}
                dragMomentum={false}
                dragElastic={0.05}
                dragConstraints={containerRef}
                onDragStart={() => {
                    isDraggingPIP.current = true;
                }}
                onDragEnd={handlePipDragEnd}
                animate={pipControls}
                className={`
                    absolute w-[95px] h-[130px] border-2 border-black/50 overflow-hidden shadow-2xl z-20 
                    ${pipRounded} ${isLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} 
                    pointer-events-auto
                    ${pipCorner === 'tl' ? 'top-4 left-4' : 'top-4 right-4'}
                `}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ touchAction: 'none' }}
                transition={{
                    layout: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }
                }}
            >
                {mediaType === 'video' ? (
                    <video
                        ref={pipVideoRef}
                        src={isSwapped ? backImage : frontImage}
                        loop
                        muted // Secondary is always muted
                        playsInline
                        autoPlay
                        className="w-full h-full object-cover pointer-events-none"
                        style={{ filter: isLocked ? 'blur(10px)' : 'blur(0px)' }}
                    />
                ) : (
                    <motion.img
                        initial={false}
                        animate={{ filter: isLocked ? 'blur(10px)' : 'blur(0px)' }}
                        src={isSwapped ? backImage : frontImage}
                        alt="Secondary PIP"
                        className="w-full h-full object-cover pointer-events-none"
                        transition={{ duration: 0.3 }}
                    />
                )}
            </motion.div>

            {/* 3. Metadata Overlay (Floating Pills) */}
            {showMetadata && (
                <div
                    className={`absolute bottom-4 left-4 right-4 flex justify-between items-end z-20 pointer-events-none transition-all duration-300 ${isHolding ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                >
                    {musicTrack ? (
                        <div
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                if (isLocked) return;
                                e.stopPropagation();
                                onToggleMusic?.();
                            }}
                            className={`bg-black/40 backdrop-blur-2xl px-3 py-2 rounded-full border border-primary/20 flex items-center gap-2 max-w-[60%] shadow-2xl pointer-events-auto transition-all ${isLocked ? 'cursor-default opacity-80' : 'cursor-pointer active:scale-95 hover:bg-black/60 hover:border-primary/40'}`}
                        >
                            <Music className={isPlaying ? "text-primary animate-pulse shadow-[0_0_8px_rgba(204,255,0,0.5)]" : "text-white"} size={12} />
                            <span className="text-[10px] font-black text-white truncate tracking-tight">{musicTrack}</span>
                        </div>
                    ) : <div />}

                    {locationName && (
                        <div
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                if (isLocked) return;
                                e.stopPropagation();
                                onOpenMap?.();
                            }}
                            className={`bg-black/40 backdrop-blur-2xl px-3 py-2 rounded-full border border-primary/20 flex items-center gap-2 max-w-[40%] shadow-2xl pointer-events-auto transition-all ${isLocked ? 'cursor-default opacity-80' : 'cursor-pointer active:scale-95 hover:bg-black/60 hover:border-primary/40'}`}
                        >
                            <MapPin className="text-primary drop-shadow-[0_0_5px_rgba(204,255,0,0.6)]" size={12} />
                            <span className="text-[10px] font-black text-white truncate tracking-tight">{locationName}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Hold Indicator Overlay (Removed as requested by user - felt blurry) */}
            {/* {isHolding && !isLocked && (
                <div className="absolute inset-0 bg-black/20 pointer-events-none animate-in fade-in duration-300" />
            )} */}

            {/* 4. Lock Overlay */}
            {isLocked && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500 bg-black/40 backdrop-blur-[2px]">
                    <div className="mb-6 drop-shadow-[0_0_20px_rgba(204,255,0,0.4)]">
                        <EyeOff size={48} className="text-primary" />
                    </div>

                    <h2 className="text-xl font-black text-white mb-2 leading-tight tracking-tighter drop-shadow-lg uppercase">
                        Lore Locked
                    </h2>
                    <p className="text-white/70 text-[11px] font-bold mb-8 max-w-[240px] text-center drop-shadow-md tracking-wide">
                        Post your own Lore to unlock your friends' world.
                    </p>

                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onUnlock?.(); }}
                        className="py-4 px-10 rounded-2xl bg-gradient-to-r from-primary to-green-400 text-black font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(204,255,0,0.4)] active:scale-95 transition-all pointer-events-auto"
                    >
                        Share Lore
                    </button>
                </div>
            )}
        </div>
    );
};

export default DualCameraView;
