import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, PlusSquare, Zap, RefreshCw, ChevronLeft, Tag, Check, MapPin, MapPinOff, Music, Globe, Users } from 'lucide-react';
import { User as UserType, Capture } from '../types';
import { supabaseService } from '../services/supabaseService';
import { DailyCountdown } from './ui/AestheticComponents';
import { useToast } from './Toast';
import { POSITIVE_QUOTES, OTHER_USERS } from '../constants';
import DualCameraView from './DualCameraView';

interface CameraFlowProps {
    onClose: () => void;
    onPost?: () => void;
    onCapture?: (url: string) => void;
    currentUser: UserType;
    questId?: string; // NEW: Optional Quest ID linkage
}

const CameraFlow: React.FC<CameraFlowProps> = ({ onClose, onPost, onCapture, currentUser, questId }) => {
    const [images, setImages] = useState<{ main: string | null, sec: string | null }>({ main: null, sec: null });
    const [caption, setCaption] = useState('');
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [isCapturing, setIsCapturing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [captureStep, setCaptureStep] = useState<'IDLE' | 'MAIN_CAPTURED' | 'SWITCHING' | 'DONE'>('IDLE');
    const [isRecordingFront, setIsRecordingFront] = useState(false);
    const [recordingStage, setRecordingStage] = useState<'NONE' | 'MAIN' | 'SEC'>('NONE');
    const [switchingQuote, setSwitchingQuote] = useState('');
    const [flashOn, setFlashOn] = useState(false);
    const { showToast } = useToast();

    // Preview Logic State
    const [isSwapped, setIsSwapped] = useState(false);
    const [showTagModal, setShowTagModal] = useState(false);

    // Metadata State
    const [taggedUsers, setTaggedUsers] = useState<UserType[]>([]);
    const [location, setLocation] = useState<string | null>(null);
    const [locationCoords, setLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [musicTrack, setMusicTrack] = useState<string | null>(null);
    const [isDetectingMusic, setIsDetectingMusic] = useState(false);
    const [isDetectingLoc, setIsDetectingLoc] = useState(false);

    // Capture detected time
    const [musicStartTime, setMusicStartTime] = useState<number>(0);
    const [capturedAt, setCapturedAt] = useState<string | null>(null);

    // Toggles
    const [isLocEnabled, setIsLocEnabled] = useState(false);
    const [isMusicEnabled, setIsMusicEnabled] = useState(false);
    const [visibility, setVisibility] = useState<'public' | 'friends'>('public');

    // Submission State
    const [isSending, setIsSending] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Camera
    useEffect(() => {
        let mounted = true;

        const startCamera = async () => {
            // Reset flash state when camera starts/switches
            setFlashOn(false);

            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: true // Always request audio so we can record video if needed
                });

                if (mounted && videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                }
            } catch (err) {
                console.error("Camera error:", err);
                // alert("Could not access camera. Please allow permissions.");
            }
        };

        if (captureStep !== 'DONE') {
            startCamera();
        }

        return () => {
            mounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };

    }, [facingMode, captureStep]);

    // Handle Flash Toggle
    const toggleFlash = async () => {
        if (!streamRef.current) return;
        const track = streamRef.current.getVideoTracks()[0];
        const newFlashState = !flashOn;
        setFlashOn(newFlashState);
        try {
            await track.applyConstraints({
                advanced: [{ torch: newFlashState }] as any
            });
        } catch (e) {
            console.log("Flash not supported on this device/camera");
        }
    };

    // Handle Sequential Capture Logic
    const captureFrame = () => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Mirror if front camera
        if (facingMode === 'user') {
            ctx?.translate(canvas.width, 0);
            ctx?.scale(-1, 1);
        }

        ctx?.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8);
    };

    const handleShutterPress = async () => {
        if (isCapturing || isRecording) return;

        // If in Video Mode, this is the start of a HOLD
        longPressTimerRef.current = setTimeout(() => {
            startRecording();
        }, 300); // 300ms hold to start recording
    };

    const handleShutterRelease = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }

        if (isRecording || isRecordingFront) {
            // Sequential recording will handle its own stopping if needed, 
            // but we can allow early release to stop the CURRENT stage
            if (recordingStage === 'MAIN') {
                stopRecording('MAIN');
            } else if (recordingStage === 'SEC') {
                stopRecording('SEC');
            }
        } else {
            // Tapped (released before hold threshold), treat as photo
            handleTakePhoto();
        }
    };

    const startRecording = (stage: 'MAIN' | 'SEC' = 'MAIN') => {
        if (!streamRef.current) return;

        if (stage === 'MAIN') {
            setIsRecording(true);
            setRecordingStage('MAIN');
        } else {
            setIsRecordingFront(true);
            setRecordingStage('SEC');
        }

        setRecordingTime(0);

        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(blob);

            if (stage === 'MAIN') {
                setImages(prev => ({ ...prev, main: videoUrl }));
                setIsRecording(false);

                // --- Sequential Logic ---
                // Automatically prepare for second stage
                setCaptureStep('MAIN_CAPTURED');
                setSwitchingQuote(POSITIVE_QUOTES[Math.floor(Math.random() * POSITIVE_QUOTES.length)]);
                const nextMode = facingMode === 'environment' ? 'user' : 'environment';
                setFacingMode(nextMode);
                setCaptureStep('SWITCHING');

                // Wait for camera flip then start second recording stage
                setTimeout(() => {
                    setCaptureStep('IDLE'); // Hide switching overlay
                    startRecording('SEC');
                }, 1500);
            } else {
                setImages(prev => ({ ...prev, sec: videoUrl }));
                setIsRecordingFront(false);
                setRecordingStage('NONE');
                setCapturedAt(new Date().toISOString());
                setCaptureStep('DONE');
            }
        };

        mediaRecorder.start();

        // Start Timer (simple tracking)
        const interval = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);

        // Stage-based duration
        const duration = stage === 'MAIN' ? 5000 : 3000; // 5s main, 3s front
        setTimeout(() => {
            if (mediaRecorder.state === 'recording') stopRecording(stage);
            clearInterval(interval);
        }, duration);
    };

    const stopRecording = (stage: 'MAIN' | 'SEC') => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };


    const handleTakePhoto = async () => {
        if (isCapturing) return;
        setIsCapturing(true);

        // 1. Capture Main Image
        const img1 = captureFrame();
        if (!img1) return;

        setCaptureStep('MAIN_CAPTURED');

        // Pick random quote
        setSwitchingQuote(POSITIVE_QUOTES[Math.floor(Math.random() * POSITIVE_QUOTES.length)]);

        // 2. Prepare for Second Capture (Switch Camera)
        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(nextMode);
        setCaptureStep('SWITCHING');

        // Allow time for camera to switch and exposure to settle
        setTimeout(() => {
            // 3. Capture Second Image
            const img2 = captureFrame();

            // 4. Finalize
            setImages({
                main: img1, // First capture works as Back
                sec: img2   // Second capture works as Front (or vice versa depending on start)
            });
            setCapturedAt(new Date().toISOString()); // CAPTURE TIME
            setCaptureStep('DONE');
            setIsCapturing(false);
        }, 3000);
    };

    const toggleCamera = () => {
        if (!isCapturing && captureStep === 'IDLE') {
            setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
        }
    };

    // --- Preview / Editing Logic ---

    // ... removed handleSwapImages local ...

    const toggleLocation = () => {
        const next = !isLocEnabled;
        setIsLocEnabled(next);
        if (next) {
            detectLocation();
        } else {
            setLocation(null);
            setLocationCoords(null);
        }
    };

    const [spotifyConnected, setSpotifyConnected] = useState(false);
    const [showSpotifyModal, setShowSpotifyModal] = useState(false);

    // ... existing ...

    const toggleMusic = () => {
        if (!isMusicEnabled) {
            // Turning ON
            if (!spotifyConnected) {
                setShowSpotifyModal(true);
            } else {
                setIsMusicEnabled(true);
                detectMusic();
            }
        } else {
            // Turning OFF
            setIsMusicEnabled(false);
            setMusicTrack(null);
            setMusicStartTime(0);
        }
    };

    const detectLocation = () => {
        setIsDetectingLoc(true);

        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser", 'error');
            setIsDetectingLoc(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocationCoords({ latitude, longitude });

                try {
                    // Reverse Geocoding via OSM Nominatim (Free, no key required for low usage)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    // Extract a nice short name
                    const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
                    const area = data.address.neighbourhood || data.address.road;
                    const shortName = city ? (area ? `${area}, ${city}` : city) : "Pinned Location";

                    setLocation(shortName);
                } catch (e) {
                    console.error("Geocoding failed", e);
                    setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                } finally {
                    setIsDetectingLoc(false);
                }
            },
            (error) => {
                console.error("Error detecting location", error);
                showToast("Unable to retrieve location. Check permissions.", 'error');
                setIsDetectingLoc(false);

                // Fallback Mock (so user sees something during demo if they deny)
                setLocation("Downtown Metro (Mock)");
            }
        );
    };

    const detectMusic = () => {
        setIsDetectingMusic(true);
        // Simulate checking Spotify
        setTimeout(() => {
            // Random chance to have no music playing (20% chance)
            const isPlaying = Math.random() > 0.2;

            if (isPlaying) {
                const SONGS = ["Espresso - Sabrina", "BIRDS OF A FEATHER - Billie", "Not Like Us - Kendrick", "Good Luck, Babe - Chappell"];
                setMusicTrack(SONGS[Math.floor(Math.random() * SONGS.length)]);
                // Simulate capturing the CURRENT timestamp of the song
                // When we play it back later, we will play 30s starting from this point
                setMusicStartTime(Math.floor(Math.random() * 60) + 30);
            } else {
                setMusicTrack(null);
                setMusicStartTime(0);
                setIsMusicEnabled(false); // Turn off if nothing playing
                showToast("No song currently playing on Spotify.", 'info');
            }
            setIsDetectingMusic(false);
        }, 1500);
    };

    const toggleTag = (u: UserType) => {
        if (taggedUsers.find(x => x.id === u.id)) {
            setTaggedUsers(prev => prev.filter(x => x.id !== u.id));
        } else {
            setTaggedUsers(prev => [...prev, u]);
        }
    };

    const handleSend = async () => {
        if (isSending) return; // Prevent duplicates
        setIsSending(true);

        // If in Chat/Usage mode (returning image only), and NOT in a quest flow
        if (onCapture && !questId) {
            onCapture(images.main || '');
            onClose();
            return;
        }

        try {
            const finalCapturedAt = capturedAt || new Date().toISOString();

            const newCapture: Capture = {
                id: `c-${Date.now()}`,
                user_id: currentUser.id,
                user: currentUser,

                // V1 Spec: Strictly use media_url fields
                front_media_url: images.sec || '',
                back_media_url: images.main || '',
                media_type: images.main?.startsWith('blob:') ? 'video' : 'image', // Basic detection

                // Legacy Fallback (for old UI components if they still rely on it)
                front_image_url: images.sec || '',
                back_image_url: images.main || '',

                location: {
                    lat: locationCoords?.latitude || 0,
                    lng: locationCoords?.longitude || 0,
                    place_name: location || '',
                },
                location_name: location || '',
                location_coords: locationCoords || undefined,
                music_context: isMusicEnabled ? {
                    track_name: musicTrack || 'Unknown Track',
                    artist: 'Unknown Artist',
                    playback_position: musicStartTime
                } : undefined,
                visibility: visibility,
                state: 'active',

                caption: caption,

                // TIME TRUTH
                created_at: new Date().toISOString(), // Server/Upload Time
                captured_at: finalCapturedAt,         // Device/Capture Time

                tagged_users: taggedUsers,
                reaction_count: 0,
                comment_count: 0,
                reactions: [],
                quest_id: questId // LINKING TO QUEST
            };

            const result = await supabaseService.captures.postCapture(newCapture);
            if (result.success) {
                showToast("Lore Posted!", 'success');
                if (onPost) (onPost as any)(result.localUpdate);
                onClose();
            } else {
                showToast(result.error || "Failed to post Lore. Check logs.", 'error');
            }
        } catch (e) {
            console.error("Failed to post", e);
            showToast("Unexpected error while posting.", 'error');
        } finally {
            setIsSending(false);
        }
    };

    // --- RENDER CAPTURE PHASE ---
    if (captureStep !== 'DONE') {
        return (
            <div className="absolute inset-0 z-[60] bg-black flex flex-col safe-area-bottom">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 pointer-events-none">
                    <div className="text-primary font-black tracking-tighter text-xl drop-shadow-md">
                        Be4L
                    </div>
                    {/* Small countdown or branding */}
                    {/* <DailyCountdown onTimerZero={onClose} className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 scale-90" /> */}
                    {questId && <span className="text-[10px] uppercase font-bold text-primary tracking-widest bg-primary/10 px-2 rounded-md border border-primary/20">Quest Mode</span>}
                </div>

                {/* Main Camera Feed */}
                <div
                    className="absolute inset-0 bg-gray-900"
                    onClick={toggleCamera} // Tap to Flip
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transition-opacity duration-300 ${captureStep === 'SWITCHING' ? 'opacity-0' : 'opacity-100'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />

                    {/* Capture Progress Overlay */}
                    {(isCapturing || recordingStage !== 'NONE') && (
                        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/20 backdrop-blur-[2px]">
                            <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center gap-2">
                                <p className="text-white font-black text-[11px] uppercase tracking-[0.2em] text-center animate-pulse">
                                    {captureStep === 'SWITCHING' ? switchingQuote :
                                        recordingStage === 'MAIN' ? 'Recording Context...' :
                                            recordingStage === 'SEC' ? 'Capturing You...' :
                                                'Capturing...'}
                                </p>
                                {recordingStage !== 'NONE' && (
                                    <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: recordingStage === 'MAIN' ? 5 : 3, ease: 'linear' }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Controls - Left Only */}
                <div className="absolute top-6 left-4 z-20">
                    <button onClick={onClose} className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 pb-12 pt-20 px-8 flex flex-col items-center justify-end z-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none gap-6">



                    <div className="w-full flex items-center justify-between">
                        {/* Flash (Bottom Left) */}
                        <button
                            onClick={toggleFlash}
                            className={`p-3 backdrop-blur-md rounded-full border transition-all pointer-events-auto ${flashOn ? 'bg-primary/20 border-primary text-primary' : 'bg-black/20 border-white/10 text-white hover:bg-white/10'}`}
                        >
                            <Zap size={24} className={flashOn ? "fill-current" : "opacity-80"} />
                        </button>

                        {/* Shutter (Bottom Center) */}
                        <button
                            onMouseDown={handleShutterPress}
                            onMouseUp={handleShutterRelease}
                            onTouchStart={handleShutterPress}
                            onTouchEnd={handleShutterRelease}
                            disabled={isCapturing}
                            className={`w-20 h-20 rounded-full border-[5px] flex items-center justify-center active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] pointer-events-auto disabled:opacity-50 ${recordingStage !== 'NONE' ? 'border-red-500 bg-red-500/20' : 'border-white bg-white/10'}`}
                        >
                            <div className={`rounded-full shadow-inner transition-all duration-300 ${recordingStage !== 'NONE' ? 'w-8 h-8 bg-red-500 rounded-sm' : 'w-16 h-16 bg-white'}`} />
                        </button>

                        {/* Flip (Bottom Right) */}
                        <button
                            onClick={toggleCamera}
                            disabled={isCapturing}
                            className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors pointer-events-auto"
                        >
                            <RefreshCw size={24} className="opacity-80" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // --- RENDER PREVIEW / EDIT PHASE ---
    return (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col safe-area-bottom">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 pointer-events-none">
                <div className="text-primary font-black tracking-tighter text-xl drop-shadow-md">
                    Be4L
                </div>
                {/* <DailyCountdown onTimerZero={onClose} className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 scale-90" /> */}
                {questId && <span className="text-[10px] uppercase font-bold text-primary tracking-widest bg-primary/10 px-2 rounded-md border border-primary/20">Confirm Quest Lore</span>}
            </div>

            {/* Header (Always Visible) */}
            <div className="px-4 py-4 flex justify-between items-center z-10">
                <button onClick={() => { setCaptureStep('IDLE'); setIsCapturing(false); }} className="p-2 bg-black/50 rounded-full"><ChevronLeft className="text-white" /></button>
                <button onClick={onClose} className="p-2 bg-black/50 rounded-full"><X className="text-white" /></button>
            </div>

            {/* Main Image Area */}
            {/* Main Image Area (Using DualCameraView) */}
            <div className="flex-1 px-4">
                <DualCameraView
                    frontImage={images.sec || ''}
                    backImage={images.main || ''}
                    musicTrack={isMusicEnabled ? (isDetectingMusic ? "Detecting..." : musicTrack || "Music") : undefined}
                    locationName={isLocEnabled ? (isDetectingLoc ? "Detecting..." : location || "Location") : undefined}
                    isSwapped={isSwapped}
                    onSwap={setIsSwapped}
                    aspectRatio="h-full"
                    rounded="rounded-3xl"
                    mediaType={images.main?.startsWith('blob:') || images.main?.indexOf('.mp4') !== -1 ? 'video' : 'image'}
                />
            </div>

            {/* Bottom Controls (Always Visible) */}
            <div className="px-4 py-6">

                {/* Metadata Chips - Minimalist Row */}
                <div className="relative flex justify-center gap-2 mb-6 h-8">

                    {/* Transparent Backdrop for Click-Outside to Dismiss Tag Modal */}
                    {showTagModal && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowTagModal(false)}
                        />
                    )}

                    {/* Tag Button */}
                    <button
                        onClick={() => setShowTagModal(!showTagModal)}
                        className={`flex items-center gap-1 px-3 rounded-full text-[10px] font-bold border transition-all h-full ${taggedUsers.length > 0 ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/10 text-gray-500 hover:text-white'}`}
                    >
                        <Tag size={12} />
                        {taggedUsers.length > 0 && <span>{taggedUsers.length}</span>}
                    </button>

                    {/* Compact Tag Popup - Positioned absolutely above the row */}
                    {showTagModal && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-card border border-white/10 rounded-xl p-2 w-48 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-end items-center mb-1 pb-1 border-b border-white/10 px-1">
                                <button onClick={() => setShowTagModal(false)}><X size={10} className="text-white" /></button>
                            </div>
                            <div className="max-h-32 overflow-y-auto no-scrollbar space-y-1">
                                {OTHER_USERS.map(user => {
                                    const isSelected = !!taggedUsers.find(u => u.id === user.id);
                                    return (
                                        <div key={user.id} onClick={() => toggleTag(user)} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <img src={user.avatar_url} className="w-5 h-5 rounded-full" />
                                                <span className="text-white text-[10px] font-bold">{user.username}</span>
                                            </div>
                                            {isSelected && <Check size={10} className="text-primary" strokeWidth={3} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Location Toggle */}
                    <button
                        onClick={toggleLocation}
                        className={`flex items-center gap-1.5 px-3 rounded-full text-[10px] font-bold border transition-all h-full ${isLocEnabled ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/10 text-gray-500'}`}
                    >
                        {isLocEnabled ? <MapPin size={12} /> : <MapPinOff size={12} />}
                        {isLocEnabled && <span className="max-w-[80px] truncate">{isDetectingLoc ? "..." : location || "Loc"}</span>}
                    </button>

                    {/* Music Toggle */}
                    <button
                        onClick={toggleMusic}
                        className={`flex items-center gap-1.5 px-3 rounded-full text-[10px] font-bold border transition-all h-full relative overflow-hidden ${isMusicEnabled ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/10 text-gray-500'}`}
                    >
                        <div className="relative">
                            <Music size={12} />
                            {!isMusicEnabled && <div className="absolute inset-0 border-t border-current rotate-45 top-[5px] scale-125" />}
                        </div>
                        {isMusicEnabled && <span className="max-w-[80px] truncate">{isDetectingMusic ? "..." : musicTrack || "Music"}</span>}
                    </button>

                    {/* Visibility Toggle */}
                    <button
                        onClick={() => setVisibility(prev => prev === 'public' ? 'friends' : 'public')}
                        className={`flex items-center gap-1.5 px-3 rounded-full text-[10px] font-bold border transition-all h-full ${visibility === 'friends' ? 'bg-orange-500/20 border-orange-500/40 text-orange-500' : 'bg-primary/20 border-primary text-primary'}`}
                    >
                        {visibility === 'public' ? <Globe size={12} /> : <Users size={12} />}
                        <span className="uppercase">{visibility}</span>
                    </button>
                </div>

                {/* Input & Send */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <img src={currentUser.avatar_url} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value.slice(0, 100))}
                            placeholder="Add a caption..."
                            className="w-full bg-transparent text-white font-medium placeholder-gray-500 outline-none pr-8 text-sm"
                        />
                        <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold ${caption.length >= 100 ? 'text-red-500' : 'text-gray-600'}`}>
                            {100 - caption.length}
                        </span>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className={`px-6 py-2 font-black rounded-full uppercase text-xs tracking-wider transition-colors ${isSending ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-white text-black hover:bg-primary'}`}
                    >
                        {isSending ? 'Posting Lore...' : 'Post Lore'}
                    </button>
                </div>
            </div>

            {/* Spotify Connect Modal */}
            {showSpotifyModal && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowSpotifyModal(false)}>
                    <div className="bg-card w-full max-w-sm rounded-3xl border border-white/10 p-8 flex flex-col items-center relative text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-[#1DB954]/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(29,185,84,0.2)]">
                            <Music size={32} className="text-[#1DB954]" />
                        </div>

                        <h3 className="text-2xl font-black text-white uppercase mb-2">Connect Music</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            Link your Spotify account to automatically share your vibe with every capture.
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowSpotifyModal(false)}
                                className="flex-1 py-4 bg-surface text-gray-400 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setSpotifyConnected(true);
                                    setIsMusicEnabled(true);
                                    setShowSpotifyModal(false);
                                    detectMusic();
                                    showToast("Spotify Connected!", 'success');
                                }}
                                className="flex-1 py-4 bg-[#1DB954] text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#1ed760] transition-colors shadow-[0_0_20px_rgba(29,185,84,0.3)]"
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraFlow;
