import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, User as UserIcon, Lock, Globe, Smile, X, Check, Trash2, Download, MessageCircle, UserPlus, Search } from 'lucide-react';
import MapPopup from './MapPopup';
import { Capture, User, Reaction } from '../types';
import { OTHER_USERS } from '../constants';
import { audioService } from '../services/audioService';
import { supabaseService } from '../services/supabaseService';
import { GlassCard } from './ui/AestheticComponents';
import DualCameraView from './DualCameraView';

interface Props {
    capture: Capture;
    onOpenDetail?: (capture: Capture) => void;
    onUserClick?: (user: User) => void;
    currentUser: User;
    isLocked?: boolean;
    onUnlock?: () => void;
}

const DualCameraPost: React.FC<Props> = ({ capture: initialCapture, onOpenDetail, onUserClick, currentUser, isLocked, onUnlock }) => {
    const [capture, setCapture] = useState(initialCapture);
    const [isSwapped, setIsSwapped] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showTaggingModal, setShowTaggingModal] = useState(false);
    const [showTaggedList, setShowTaggedList] = useState(false);
    const [showReactionCam, setShowReactionCam] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [isEditingCaption, setIsEditingCaption] = useState(false);
    const [captionText, setCaptionText] = useState(initialCapture.caption);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const reactionVideoRef = useRef<HTMLVideoElement>(null);
    const reactionCanvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isOwnPost = capture.user?.id === currentUser?.id;

    useEffect(() => {
        setCapture(initialCapture);
        setCaptionText(initialCapture.caption);
    }, [initialCapture]);

    useEffect(() => {
        const handleAudioUpdate = ({ isPlaying: globalPlaying, currentId }: { isPlaying: boolean, currentId: string | null }) => {
            setIsPlaying(currentId === capture.id && globalPlaying);
        };
        return audioService.subscribe(handleAudioUpdate);
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
            console.error("Camera access denied", e);
            setShowReactionCam(false);
        }
    };

    const handleCompositeDownload = async () => {
        setIsMenuOpen(false);
        const mainSrc = isSwapped ? capture.front_image_url : capture.back_image_url;
        const pipSrc = isSwapped ? capture.back_image_url : capture.front_image_url;
        try {
            const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = reject;
            });
            const [mainImg, pipImg] = await Promise.all([loadImage(mainSrc), loadImage(pipSrc)]);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = mainImg.naturalWidth;
            canvas.height = mainImg.naturalHeight;
            ctx.drawImage(mainImg, 0, 0);
            const scaleFactor = canvas.width / 360;
            const pipW = 80 * scaleFactor, pipH = 112 * scaleFactor, pipX = 12 * scaleFactor, pipY = 16 * scaleFactor, radius = 10 * scaleFactor;
            ctx.save();
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(pipX, pipY, pipW, pipH, radius);
            else ctx.rect(pipX, pipY, pipW, pipH);
            ctx.clip();
            ctx.drawImage(pipImg, pipX, pipY, pipW, pipH);
            ctx.restore();
            ctx.lineWidth = 2 * scaleFactor;
            ctx.strokeStyle = '#000000';
            ctx.stroke();
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `be4l-${capture.id}.jpg`;
                link.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (e) {
            window.open(mainSrc, '_blank');
        }
    };

    const toggleMusic = () => {
        if (!capture.music_track) return;
        const songUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        audioService.toggle(capture.id, songUrl, capture.music_start_time || 0);
    };

    const handleCaptureReaction = () => {
        if (!reactionVideoRef.current || !reactionCanvasRef.current) return;
        const video = reactionVideoRef.current;
        const canvas = reactionCanvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.translate(canvas.width, 0); ctx?.scale(-1, 1);
        ctx?.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg', 0.7);
        const newReaction: Reaction = { id: `r-${Date.now()}`, user: currentUser, image_url: imageUrl, timestamp: 'Just now' };
        setCapture(prev => ({
            ...prev,
            reactions: [newReaction, ...(prev.reactions?.filter(r => r.user.id !== currentUser.id) || [])],
            reaction_count: (prev.reactions?.filter(r => r.user.id !== currentUser.id).length || 0) + 1
        }));
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        setShowReactionCam(false);
    };

    const saveCaption = async () => {
        setIsEditingCaption(false);
        setCapture(prev => ({ ...prev, caption: captionText }));
        await supabaseService.captures.updateCapture(capture.id, { caption: captionText });
    };

    const togglePrivacy = () => {
        setCapture(prev => ({ ...prev, privacy: prev.privacy === 'public' ? 'private' : 'public' }));
        setIsMenuOpen(false);
    };

    const handleTagUser = async (user: User) => {
        const isTagged = capture.tagged_users?.some(u => u.id === user.id);
        let newTags = capture.tagged_users || [];

        if (isTagged) {
            newTags = newTags.filter(u => u.id !== user.id);
        } else {
            newTags = [...newTags, user];
        }

        setCapture(prev => ({ ...prev, tagged_users: newTags }));
        await supabaseService.captures.updateCapture(capture.id, { tagged_users: newTags });
    };

    const handleDelete = async () => {
        await supabaseService.captures.deleteCapture(capture.id);
        setIsDeleted(true);
        setShowDeleteConfirm(false);
        setIsMenuOpen(false);
    };

    if (isDeleted) return null;

    return (
        <GlassCard
            ref={containerRef}
            onClick={() => onOpenDetail?.(capture)}
            className="mb-2 mx-0 bg-transparent border-none shadow-none backdrop-blur-none transition-all duration-300 cursor-pointer group/card relative"
        >
            {/* Header */}
            <div className="p-4 pb-1.5 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="relative" onClick={(e) => { e.stopPropagation(); capture.user && onUserClick?.(capture.user); }}>
                        <img src={capture.user?.avatar_url || 'https://picsum.photos/100/100?random=1'} className="w-10 h-10 rounded-full border border-primary/50 cursor-pointer object-cover shadow-lg" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary text-[8px] font-black text-black rounded-full flex items-center justify-center border border-black">{capture.user?.streak_count || 0}</div>
                    </div>
                    <div>
                        <div className="flex items-center">
                            <p className="font-black text-white text-[13px] mr-1 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); capture.user && onUserClick?.(capture.user); }}>{capture.user?.username || 'Unknown User'}</p>
                            {capture.tagged_users && capture.tagged_users.length > 0 && (
                                <span className="text-[11px] text-gray-400">
                                    {capture.tagged_users.length === 1 ? (
                                        <>is with <span className="text-white font-bold">{capture.tagged_users[0].username}</span></>
                                    ) : (
                                        <>is with <span className="text-white font-bold">{capture.tagged_users[0].username}</span> and <span className="text-white font-bold">{capture.tagged_users.length - 1} others</span></>
                                    )}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{new Date(capture.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2 text-gray-400 hover:text-white rounded-full transition-colors"><MoreHorizontal size={20} /></button>
            </div>

            {/* Caption */}
            <div className="px-4 pb-2">
                {isEditingCaption ? (
                    <input autoFocus value={captionText} onChange={(e) => setCaptionText(e.target.value)} onBlur={saveCaption} onKeyDown={(e) => e.key === 'Enter' && saveCaption()} className="w-full bg-white/5 border border-primary/30 rounded-xl px-3 py-2 text-sm text-white outline-none" />
                ) : (
                    <p className="text-white text-sm font-bold" onClick={() => isOwnPost && setIsEditingCaption(true)}>{captionText || <span className="text-gray-600 italic text-xs">Add a caption...</span>}</p>
                )}
            </div>

            <div className="px-3 pb-1" onClick={(e) => e.stopPropagation()}>
                <DualCameraView
                    frontImage={capture.front_image_url}
                    backImage={capture.back_image_url}
                    musicTrack={capture.music_track}
                    locationName={capture.location_name}
                    isPlaying={isPlaying}
                    onToggleMusic={toggleMusic}
                    onOpenMap={() => setShowMap(true)}
                    isSwapped={isSwapped}
                    onSwap={setIsSwapped}
                    isLocked={isLocked && !isOwnPost}
                    onUnlock={onUnlock}
                />
            </div>

            {/* Footer - Social Interactions */}
            <div className="px-4 py-2 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    {/* Reactions Button - Always shown for uniformity */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isOwnPost) return; // Don't allow own post reacts
                            startReactionCamera();
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:bg-white/20 active:scale-90 transition-all shadow-sm ${isOwnPost ? 'bg-white/5 opacity-40 cursor-default' : 'bg-white/10'}`}
                    >
                        <Smile size={20} />
                    </button>

                    {/* Comments Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenDetail?.(capture); }}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/90 hover:bg-white/20 active:scale-90 transition-all relative shadow-sm"
                    >
                        <MessageCircle size={18} />
                        {capture.comment_count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-black text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black shadow-sm">
                                {capture.comment_count}
                            </span>
                        )}
                    </button>

                    {/* Facepile - Placed immediately after comment icon */}
                    {capture.reactions && capture.reactions.length > 0 && (
                        <div
                            onClick={(e) => { e.stopPropagation(); onOpenDetail?.(capture); }}
                            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer ml-1"
                        >
                            <div className="flex -space-x-2.5">
                                {capture.reactions.slice(0, 3).map(r => (
                                    <div key={r.id} className="w-7 h-7 rounded-full border-2 border-black overflow-hidden shadow-md">
                                        <img src={r.image_url} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            {capture.reactions.length > 3 && (
                                <span className="text-[10px] font-black text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-tighter ml-1">
                                    +{capture.reactions.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Privacy/Status Indicator */}
                <div className="flex items-center gap-2">
                    {capture.privacy === 'private' && <Lock size={12} className="text-gray-600" />}
                </div>
            </div>

            {/* Menu */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[40]"
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                    />
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-4 top-14 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl w-52 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="p-1.5 flex flex-col gap-0.5">
                            {isOwnPost ? (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); setShowTaggingModal(true); }}
                                        className="w-full px-4 py-3.5 text-[13px] font-bold text-white/90 hover:bg-white/10 rounded-xl flex items-center gap-3 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                            <UserPlus size={16} className="text-primary" />
                                        </div>
                                        Tag Friends
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCompositeDownload(); }}
                                        className="w-full px-4 py-3.5 text-[13px] font-bold text-white/90 hover:bg-white/10 rounded-xl flex items-center gap-3 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                            <Download size={16} />
                                        </div>
                                        Download
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); togglePrivacy(); }}
                                        className="w-full px-4 py-3.5 text-[13px] font-bold text-white/90 hover:bg-white/10 rounded-xl flex items-center gap-3 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                            {capture.privacy === 'public' ? <Lock size={16} /> : <Globe size={16} />}
                                        </div>
                                        {capture.privacy === 'public' ? 'Make Private' : 'Make Public'}
                                    </button>

                                    <div className="h-[1px] bg-white/5 my-1 mx-2" />

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); setIsMenuOpen(false); }}
                                        className="w-full px-4 py-3.5 text-[13px] font-bold text-red-500 hover:bg-red-500/10 rounded-xl flex items-center gap-3 transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                            <Trash2 size={16} />
                                        </div>
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <button className="w-full px-4 py-3.5 text-[13px] font-bold text-gray-400 hover:bg-white/5 rounded-xl flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                        <X size={16} />
                                    </div>
                                    Report Post
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            <canvas ref={reactionCanvasRef} className="hidden" />

            {showReactionCam && (
                <div
                    className="fixed inset-0 z-[40]"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowReactionCam(false);
                        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
                    }}
                />
            )}

            {showReactionCam && (
                <div className="absolute bottom-24 left-4 z-50 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="relative">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-black rounded-full border-4 border-primary relative overflow-hidden shadow-[0_0_30px_rgba(204,255,0,0.3)]">
                            <video ref={reactionVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                            <button onClick={handleCaptureReaction} className="absolute inset-0 z-10" />
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowReactionCam(false); }}
                            className="absolute -top-1 -right-1 z-30 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black transition-all shadow-lg active:scale-90"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleCaptureReaction(); }}
                            className="w-16 h-16 rounded-full bg-white border-4 border-black/20 shadow-2xl active:scale-95 transition-transform flex items-center justify-center hover:bg-gray-100 group"
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-black/5 group-hover:scale-95 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowDeleteConfirm(false)}
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
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-4 text-gray-400 font-bold text-sm hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_10px_20px_rgba(239,68,68,0.3)] active:scale-95 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showMap && <MapPopup locationName={capture.location_name} locationCoords={capture.location_coords} onClose={() => setShowMap(false)} />}

            {showTaggingModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end animate-in fade-in duration-300">
                    <div className="w-full bg-card rounded-t-[32px] border-t border-white/10 p-6 pb-12 animate-in slide-in-from-bottom duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-black uppercase text-lg tracking-tight italic">Tag Friends</h3>
                            <button onClick={() => setShowTaggingModal(false)} className="p-2 bg-white/5 rounded-full text-white"><X size={20} /></button>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 mb-6">
                            <Search size={16} className="text-gray-500" />
                            <input placeholder="Search friends..." className="bg-transparent w-full text-white font-bold outline-none text-sm" />
                        </div>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar">
                            {OTHER_USERS.map(friend => {
                                const isTagged = capture.tagged_users?.some(u => u.id === friend.id);
                                return (
                                    <div
                                        key={friend.id}
                                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isTagged ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                        onClick={() => handleTagUser(friend)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={friend.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="text-white font-bold text-sm tracking-tight">{friend.username}</p>
                                                <p className="text-gray-500 text-[10px] uppercase font-black">{friend.name}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isTagged ? 'bg-primary border-primary text-black' : 'border-white/20'}`}>
                                            {isTagged && <Check size={14} strokeWidth={3} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setShowTaggingModal(false)}
                            className="w-full mt-8 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </GlassCard>
    );
};

export default DualCameraPost;
