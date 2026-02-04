import React from 'react';
import { X, Camera, Zap } from 'lucide-react';

export const ActionScreen: React.FC<{ onClose: () => void, onLaunchCamera: () => void, onLaunchQuest: () => void }> = ({ onClose, onLaunchCamera, onLaunchQuest }) => {
    return (
        <div
            className="absolute inset-0 z-[60] bg-deep-black/60 backdrop-blur-md flex flex-col items-center justify-end pb-24 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-12 right-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10"><X size={24} /></button>

            <div
                className="flex items-center justify-center gap-12 w-full mb-8"
            >
                <button
                    onClick={(e) => { e.stopPropagation(); onLaunchCamera(); onClose(); }}
                    className="flex flex-col items-center gap-3 group"
                >
                    <div className="w-14 h-14 rounded-full bg-surface/90 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                        <Camera size={24} className="text-white" />
                    </div>
                    <span className="font-bold text-xs text-white drop-shadow-md">Lore?</span>
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onLaunchQuest(); onClose(); }}
                    className="flex flex-col items-center gap-3 group"
                >
                    <div className="w-14 h-14 rounded-full bg-surface/90 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                        <Zap size={24} className="text-white group-hover:text-black" />
                    </div>
                    <span className="font-bold text-xs text-white drop-shadow-md">Drop Quest</span>
                </button>
            </div>
        </div>
    );
};
