import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Trash2, Flag, Edit2, Pause, Play, MapPin, Plus, Reply, ArrowRight, X, Smile } from 'lucide-react';
import MapPopup from './MapPopup';
import { Capture, Reaction, User } from '../types';
import { supabaseService } from '../services/supabaseService';
import { audioService } from '../services/audioService';
import DualCameraView from './DualCameraView';

const PostDetailScreen: React.FC<{
    capture: Capture,
    onClose: () => void,
    onDelete?: () => void,
    onUpdate?: () => void,
    currentUser: User,
    isLocked?: boolean,
    onUnlock?: () => void
}> = ({ capture: initialCapture, onClose, onDelete, onUpdate, currentUser, isLocked, onUnlock }) => {
    const [capture, setCapture] = useState(initialCapture);

    // Comments
    const [comments, setComments] = useState<{ id: string, user: string, text: string, time: string }[]>([
        { id: 'cm1', user: 'dave_climbs', text: 'Sick shot! 🔥', time: '2m' },
        { id: 'cm2', user: 'mike_runs', text: 'Where is this?', time: '5m' }
    ]);
    const [newComment, setNewComment] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Metadata
    const [isPlaying, setIsPlaying] = useState(false);

    // Caption Edit
    const [isEditingCaption, setIsEditingCaption] = useState(false);
    const [captionText, setCaptionText] = useState(capture.caption);

    // Reaction View
    const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);

    // Reaction Camera
    const [showReactionCam, setShowReactionCam] = useState(false);
    const reactionVideoRef = useRef<HTMLVideoElement>(null);
    const reactionCanvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isOwner = capture.user?.id === currentUser?.id;

    // Cleanup reaction camera stream
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Subscribe to Audio Service
    useEffect(() => {
        const handleAudioUpdate = ({ isPlaying: globalPlaying, currentId }: { isPlaying: boolean, currentId: string | null }) => {
            setIsPlaying(currentId === capture.id && globalPlaying);
        };
        const unsubscribe = audioService.subscribe(handleAudioUpdate);
        return unsubscribe;
    }, [capture.id]);

    const startReactionCamera = async () => {
        setShowReactionCam(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 300 }, height: { ideal: 300 } }
            });
            streamRef.current = stream;
            if (reactionVideoRef.current) {
                reactionVideoRef.current.srcObject = stream;
            }
        } catch (e) {
            console.error("Failed to start reaction camera", e);
            alert("Camera access denied");
            setShowReactionCam(false);
        }
    };

    const handleCaptureReaction = () => {
        if (!reactionVideoRef.current || !reactionCanvasRef.current) return;

        const video = reactionVideoRef.current;
        const canvas = reactionCanvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx?.translate(canvas.width, 0);
        ctx?.scale(-1, 1);
        ctx?.drawImage(video, 0, 0);

        const imageUrl = canvas.toDataURL('image/jpeg', 0.7);

        const newReaction: Reaction = {
            id: `r-${Date.now()}`,
            user: currentUser,
            image_url: imageUrl,
            timestamp: 'Just now'
        };

        setCapture(prev => {
            const otherReactions = prev.reactions?.filter(r => r.user.id !== currentUser.id) || [];
            return {
                ...prev,
                reactions: [newReaction, ...otherReactions],
                reaction_count: otherReactions.length + 1
            };
        });

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowReactionCam(false);
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const newCm = {
            id: `cm-${Date.now()}`,
            user: currentUser.username,
            text: newComment,
            time: 'Now'
        };
        setComments(prev => [...prev, newCm]);
        setNewComment('');
    };

    const handleReply = (username: string) => {
        setNewComment(`@${username} `);
        inputRef.current?.focus();
    };

    const toggleMusic = () => {
        if (!capture.music_track) return;
        const songUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        audioService.toggle(capture.id, songUrl, capture.music_start_time || 0);
    };

    const saveCaption = async () => {
        setIsEditingCaption(false);
        setCapture(prev => ({ ...prev, caption: captionText }));
        await supabaseService.captures.updateCapture(capture.id, { caption: captionText });
        if (onUpdate) onUpdate();
    };

    const handleDelete = async () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        await supabaseService.captures.deleteCapture(capture.id);
        if (onDelete) onDelete();
        else onClose();
        setShowDeleteModal(false);
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col animate-in slide-in-from-bottom duration-300 safe-area-bottom">

            {/* 1. Header (Fixed Top) */}
            <div className="flex justify-between items-start px-4 pt-[15px] pb-2 bg-black z-30 border-b border-white/5 relative">
                <button onClick={onClose} className="p-2 rounded-full text-white hover:bg-white/10 transition-colors">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex flex-col items-center pt-1">
                    <span className="font-bold text-white text-base shadow-sm italic">
                        <span className="animate-liquid-text">
                            {capture.user?.username || 'Unknown User'}
                        </span>
                    </span>
                    <span className="text-xs text-gray-400 font-medium shadow-sm">
                        {new Date(capture.created_at).toDateString() === new Date().toDateString()
                            ? new Date(capture.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(capture.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                        }
                    </span>
                </div>
                <div className="flex gap-2 pt-1 relative min-w-[40px] justify-end">
                    {isOwner ? (
                        <button onClick={handleDelete} className="p-2 rounded-full text-red-500 hover:bg-white/10 transition-colors">
                            <Trash2 size={24} />
                        </button>
                    ) : (
                        <button className="p-2 rounded-full text-white hover:bg-white/10 transition-colors">
                            <Flag size={24} />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pb-14">

                {/* 2. Image Area (Centralized DualCameraView) */}
                <div className="px-4 mt-4">
                    <DualCameraView
                        frontImage={capture.front_media_url || capture.front_image_url}
                        backImage={capture.back_media_url || capture.back_image_url}
                        musicTrack={capture.music_track}
                        locationName={capture.location_name}
                        isPlaying={isPlaying}
                        onToggleMusic={toggleMusic}
                        onOpenMap={() => setShowMap(true)}
                        isLocked={isLocked && !isOwner}
                        onUnlock={onUnlock}
                        mediaType={capture.media_type}
                    />
                </div>

                {/* 3. Caption */}
                <div className="mt-4 px-6 text-center">
                    {isEditingCaption ? (
                        <input
                            autoFocus
                            type="text"
                            value={captionText}
                            onChange={(e) => setCaptionText(e.target.value)}
                            onBlur={saveCaption}
                            onKeyDown={(e) => e.key === 'Enter' && saveCaption()}
                            className="w-full bg-surface border border-primary rounded-lg px-2 py-2 text-center text-white font-bold outline-none"
                        />
                    ) : (
                        <div
                            onClick={() => isOwner && setIsEditingCaption(true)}
                            className={`flex justify-center items-center gap-2 ${isOwner ? 'cursor-pointer hover:opacity-80' : ''}`}
                        >
                            <p className="text-white font-bold text-lg leading-tight">{captionText}</p>
                            {isOwner && <Edit2 size={12} className="text-gray-500" />}
                        </div>
                    )}
                </div>

                {/* 4. Reactions & Comments */}
                <div className="mt-8 px-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Reacts</h3>
                    <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
                        {(!capture.reactions || capture.reactions.length === 0) && (
                            <div className="flex items-center h-12">
                                <span className="text-gray-500 text-xs italic">No reacts yet</span>
                            </div>
                        )}
                        {capture.reactions?.map(r => (
                            <div key={r.id} className="flex flex-col items-center gap-2 shrink-0">
                                <button onClick={() => setSelectedReaction(r)} className="w-12 h-12 rounded-full border-2 border-surface overflow-hidden hover:scale-105 transition-transform">
                                    <img src={r.image_url} className="w-full h-full object-cover" />
                                </button>
                                <span className="text-[9px] font-bold text-gray-400 max-w-[60px] truncate italic">
                                    <span className="animate-liquid-text">
                                        {r.user.username}
                                    </span>
                                </span>
                            </div>
                        ))}
                        {!isOwner && (
                            <div className="flex flex-col items-center gap-2 shrink-0">
                                <button onClick={startReactionCamera} className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center text-gray-400">
                                    <Plus size={20} />
                                </button>
                                <span className="text-[9px] font-bold text-gray-500">Add</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Comments</h3>
                    <div className="space-y-6">
                        {comments.length === 0 ? (
                            <p className="text-center text-gray-600 text-xs italic">No comments yet.</p>
                        ) : (
                            comments.map((c, i) => (
                                <div key={i} className="flex gap-3 items-start group">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 shrink-0 overflow-hidden">
                                        <img src={`https://picsum.photos/50/50?random=${i}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-white text-sm italic">
                                                <span className="animate-liquid-text">
                                                    {c.user}
                                                </span>
                                            </span>
                                            <span className="text-xs text-gray-500">{c.time}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{c.text}</p>
                                        <button onClick={() => handleReply(c.user)} className="flex items-center gap-1 text-[10px] font-bold text-gray-500 mt-1 hover:text-primary">
                                            <Reply size={10} /> Reply
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Input Bar */}
            <div className="absolute bottom-0 w-full bg-black/90 backdrop-blur-md border-t border-white/10 p-4 pb-5 safe-area-bottom">
                <div className="flex items-center gap-3">
                    <img src={currentUser.avatar_url} className="w-8 h-8 rounded-full border border-white/10" />
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            placeholder="Add a comment..."
                            className="w-full bg-surface border border-white/10 rounded-full py-3 px-4 text-white placeholder-gray-500 outline-none text-sm"
                        />
                        <button onClick={handleAddComment} disabled={!newComment.trim()} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-full text-black">
                            <ArrowRight size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showReactionCam && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center">
                    <div className="w-24 h-24 bg-black rounded-full border-4 border-primary relative overflow-hidden shadow-2xl">
                        <video ref={reactionVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                        <canvas ref={reactionCanvasRef} className="hidden" />
                        <button onClick={handleCaptureReaction} className="absolute inset-0 z-10 active:bg-white/10" />
                    </div>
                    <button onClick={() => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); setShowReactionCam(false); }} className="mt-2 bg-black/60 px-3 py-1 rounded-full text-[10px] text-white">Cancel</button>
                </div>
            )}

            {selectedReaction && (
                <div className="absolute inset-0 z-[70] bg-black/60 flex items-end" onClick={() => setSelectedReaction(null)}>
                    <div className="w-full bg-[#1A1A1A] rounded-t-[2.5rem] p-6 pb-10 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                        <div className="w-32 h-32 rounded-full border-[3px] border-primary overflow-hidden mx-auto mb-4">
                            <img src={selectedReaction.image_url} className="w-full h-full object-cover transform scale-x-[-1]" />
                        </div>
                        <h3 className="text-center font-bold text-white italic">
                            <span className="animate-liquid-text">
                                {selectedReaction.user.username}
                            </span>
                        </h3>
                        <button onClick={() => setSelectedReaction(null)} className="absolute top-6 right-6 p-2 text-gray-500"><X size={16} /></button>
                    </div>
                </div>
            )}

            {showMap && <MapPopup locationName={capture.location_name} locationCoords={capture.location_coords} onClose={() => setShowMap(false)} />}

            {showDeleteModal && (
                <div className="absolute inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowDeleteModal(false)}
                    />
                    <div className="relative w-full max-w-[320px] bg-[#121212] border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6">
                                <Trash2 size={32} className="text-red-500" />
                            </div>

                            <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-8 italic">
                                Delete Memory?
                            </h3>

                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-4 text-gray-400 font-bold text-sm hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_10px_20px_rgba(239,68,68,0.3)] active:scale-95 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDetailScreen;
