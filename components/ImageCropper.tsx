import React, { useState, useRef } from 'react';
import { Minus, Plus, Check } from 'lucide-react';

export const ImageCropper = ({ imageSrc, onCancel, onComplete }: { imageSrc: string, onCancel: () => void, onComplete: (croppedUrl: string) => void }) => {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [baseScale, setBaseScale] = useState(1);
    const lastPos = useRef({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);

    const VIEWPORT_SIZE = 280;

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        const scale = Math.max(VIEWPORT_SIZE / naturalWidth, VIEWPORT_SIZE / naturalHeight);
        setBaseScale(scale);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        lastPos.current = { x: e.clientX, y: e.clientY };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        if (e.target instanceof HTMLElement) {
            try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) { }
        }
    };

    const handleCrop = () => {
        const canvas = document.createElement('canvas');
        canvas.width = VIEWPORT_SIZE;
        canvas.height = VIEWPORT_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const scale = Math.max(VIEWPORT_SIZE / img.naturalWidth, VIEWPORT_SIZE / img.naturalHeight);

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);

            ctx.translate(VIEWPORT_SIZE / 2, VIEWPORT_SIZE / 2);
            ctx.translate(offset.x, offset.y);
            ctx.scale(scale * zoom, scale * zoom);
            ctx.translate(-img.naturalWidth / 2, -img.naturalHeight / 2);

            ctx.drawImage(img, 0, 0);

            onComplete(canvas.toDataURL('image/jpeg', 0.9));
        };
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-sm flex flex-col items-center">
                <h3 className="text-white font-black text-2xl mb-8 tracking-tighter uppercase">Adjust Photo</h3>
                <div
                    className="relative bg-black border-2 border-primary overflow-hidden touch-none cursor-move shadow-[0_0_30px_rgba(45,212,191,0.1)]"
                    style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE, borderRadius: '50%' }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <img
                        ref={imgRef}
                        src={imageSrc}
                        onLoad={onImageLoad}
                        className="absolute max-w-none origin-center pointer-events-none select-none"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${baseScale * zoom})`
                        }}
                        draggable={false}
                        alt="Crop preview"
                    />
                </div>
                <div className="w-full mt-10 space-y-8">
                    <div className="flex items-center gap-4 bg-card px-4 py-3 rounded-2xl border border-white/10">
                        <Minus size={16} className="text-gray-500" />
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <Plus size={16} className="text-gray-500" />
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onCancel} className="flex-1 py-4 rounded-xl font-bold bg-surface text-gray-400 border border-white/5 hover:bg-gray-800 transition-colors uppercase tracking-widest text-xs">
                            Cancel
                        </button>
                        <button onClick={handleCrop} className="flex-1 py-4 rounded-xl font-bold bg-primary text-black shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:bg-white transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                            <Check size={16} strokeWidth={3} /> Save Photo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
