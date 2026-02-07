import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Minus, Plus, Upload, Check, Copy, AlertCircle, Loader2, Shield, Wallet, Sparkles, Download, Share2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
// toPng is dynamically imported in handleDownload and handleShare to avoid SSR issues
import { DibsItem, Operator } from '../../types';
import SmartMap from '../ui/SmartMap';
import { GradientButton } from '../ui/AestheticComponents';
import { supabaseService } from '../../services/supabaseService';
import MapPicker from '../MapPicker';
import { MapPin, Navigation } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: DibsItem;
    operator: Operator;
}

const MOCK_TIME_SLOTS = [
    '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM',
    '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
];

// Helper to generate dynamic slots
const generateDynamicSlots = (start: string = '08:00', end: string = '20:00', duration: number = 60) => {
    const slots: string[] = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    let current = new Date();
    current.setHours(startH, startM, 0, 0);

    const endDay = new Date(current);
    if (endH < startH || (endH === startH && endM <= startM)) {
        endDay.setDate(endDay.getDate() + 1);
    }
    endDay.setHours(endH, endM, 0, 0);

    while (current < endDay) {
        slots.push(current.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
        current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
};

// Helper to determine booking type
const getBookingType = (item: DibsItem, opCategory: string) => {
    if (item.type === 'EVENT') return 'TIER_BASED';
    // Legacy fallback
    if (item.unit_label === 'hour' || item.category === 'Court' || opCategory === 'venue') {
        return 'SLOT_BASED';
    }
    return 'QUANTITY_BASED';
};

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, item, operator }) => {
    if (!operator || !item) return null;

    const { user } = useAuth();
    const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
    const [isViewingPoster, setIsViewingPoster] = useState(false);

    // PRE-LAUNCH LOGIC
    // Restrictions removed for generic launch
    const isRestricted = false;

    // Form State
    const [quantity, setQuantity] = useState(1);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedSlots, setSelectedSlots] = useState<{ date: string, time: string }[]>([]);
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);

    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState({ name: '', contact: '', email: '', referral: '' });
    const [voucherCode, setVoucherCode] = useState('');
    const [showVoucherInput, setShowVoucherInput] = useState(false);

    // Sync user info if available
    React.useEffect(() => {
        if (user && userInfo.name === '') {
            setUserInfo({
                name: user.name || '',
                contact: '',
                email: user.id || '',
                referral: ''
            });
        }
    }, [user]);

    // Mock Rate Cards for Courts (Jam Session)
    const RATE_CARDS = [
        { id: 'off-peak', label: 'Day Pass', time: '08:00 AM - 04:00 PM', price: 150, description: 'Standard Rate' },
        { id: 'peak', label: 'Night Owl', time: '04:00 PM - 12:00 AM', price: 300, description: 'Peak Hours' }
    ];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingCode, setBookingCode] = useState('');
    const [verificationResult, setVerificationResult] = useState<{ verified: boolean, confidence: number, reason?: string, extracted_ref?: string } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'lore'>('gcash');
    const [secureId, setSecureId] = useState('');
    const images = item.images && item.images.length > 0 ? item.images : [item.image_url];

    const [showPoster, setShowPoster] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPicker, setShowPicker] = useState(false);
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
    const [assignedCourt, setAssignedCourt] = useState<number | null>(null);

    const ticketRef = useRef<HTMLDivElement>(null);
    const posterRef = useRef<HTMLDivElement>(null);

    const isOwner = user?.id === item.operator_id;

    const bookingType = getBookingType(item, operator.category);

    // Price Calculation
    let totalPrice = 0;
    if (bookingType === 'TIER_BASED') {
        const tier = item.tiers?.find(t => t.id === selectedTierId);
        totalPrice = (tier?.price || 0) * quantity;
    } else if (bookingType === 'SLOT_BASED') {
        // Dynamic Price Logic for Courts (Jam Session)
        if (bookingType === 'SLOT_BASED' && bookingCode === '' && item.category === 'Court') {
            totalPrice = selectedSlots.reduce((acc, slot) => {
                const hour = parseInt(slot.time.split(':')[0]) + (slot.time.includes('PM') && slot.time !== '12:00 PM' ? 12 : 0);
                // Simple rule: 4PM (16:00) onwards is Peak
                return acc + (hour >= 16 ? 300 : 150);
            }, 0);
        } else {
            totalPrice = item.price * selectedSlots.length;
        }
    } else {
        totalPrice = item.price * quantity;
    }

    // Reset state when opening
    React.useEffect(() => {
        if (isOpen) {
            setStep(0);
            setQuantity(1);
            setProofFile(null);
            setIsSubmitting(false);
            setBookingCode('');
            setSecureId('');
            setSelectedSlots([]);
            setSelectedResourceId(null);
            setSelectedTierId(null);
            setVerificationResult(null);
            setIsVerifying(false);
            setCurrentImageIndex(0);
            setShowPicker(false);
            const initialDate = date ? new Date(date) : new Date();
            setViewMonth(initialDate.getMonth());
            setViewYear(initialDate.getFullYear());
        }
    }, [isOpen]);

    // Slideshow Logic for Preview
    React.useEffect(() => {
        const images = item.images && item.images.length > 0 ? item.images : [item.image_url];
        if (images.length <= 1 || isViewingPoster) return;

        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [item.images, item.image_url, isViewingPoster]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProofFile(file);

            // SYSTEM VERIFICATION INITIATION
            setIsVerifying(true);
            const mockUrl = URL.createObjectURL(file);
            const result = await supabaseService.dibs.verifyPaymentProof(mockUrl);
            setVerificationResult(result);
            setIsVerifying(false);
        }
    };

    const handleDownloadPoster = async () => {
        if (!item.image_url) return;

        // Create a canvas to add watermark
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = item.image_url;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            if (!ctx) return;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Export
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `Be4L-${item.title.replace(/\s+/g, '-')}.png`;
            link.href = dataUrl;
            link.click();
        };
    };

    const handleSharePoster = async () => {
        const shareUrl = `${window.location.origin}${window.location.pathname}?item=${item.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out ${item.title} on Be4L`,
                    text: item.description,
                    url: shareUrl
                });
            } catch (err) {
                handleCopy(shareUrl);
                alert('Link copied to clipboard!');
            }
        } else {
            handleCopy(shareUrl);
            alert('Link copied to clipboard!');
        }
    };

    const handleDownload = async () => {
        if (ticketRef.current === null) return;
        try {
            // const { toPng } = await import('html-to-image');
            // const dataUrl = await toPng(ticketRef.current, {
            //     quality: 0.95,
            //     backgroundColor: '#05050A',
            //     style: {
            //         borderRadius: '2rem',
            //     }
            // });
            // const link = document.createElement('a');
            // link.download = `Be4LTICKET_${secureId || bookingCode}.png`;
            // link.href = dataUrl; // was dataUrl
            // link.click();
            alert('Download disabled temporarily');
        } catch (err) {
            console.error('Download failed', err);
        }
    };

    const handleShare = async () => {
        if (ticketRef.current === null) return;
        try {
            // const { toPng } = await import('html-to-image');
            // const dataUrl = await toPng(ticketRef.current);
            // const blob = await (await fetch(dataUrl)).blob();
            // const file = new File([blob], `BE4L-Booking-${bookingCode}.png`, { type: 'image/png' });
            // if (navigator.share) {
            //     await navigator.share({
            //         title: 'My Be4L Booking',
            //         text: `Check out my booking: ${bookingCode}`,
            //         // files: [file]
            //     });
            // } else {
            //     handleCopy(bookingCode);
            //     alert('Sharing not supported on this browser. Booking code copied to clipboard!');
            // }
            handleCopy(bookingCode);
            alert('Booking code copied: ' + bookingCode);
        } catch (err) {
            console.error('Share failed', err);
        }
    };

    const handleSubmit = async () => {
        if (paymentMethod === 'gcash' && !proofFile) return;
        setIsSubmitting(true);

        try {
            // 1. Upload Proof logic (Mock)
            const mockProofUrl = proofFile ? URL.createObjectURL(proofFile) : null;

            // 2. Generate Booking Booking Code & Handle Court Assignment
            const simulatedCode = `DIB-${Math.random().toString(36).substring(2, 5).toUpperCase()}${Math.floor(Math.random() * 10)}`;
            const sid = Math.random().toString(36).substring(7).toUpperCase();
            setBookingCode(simulatedCode);
            setSecureId(sid);

            // Simulation: Assign a court if it's a court/venue
            if (item.category === 'Court' || operator.category === 'venue') {
                const courtNum = Math.floor(Math.random() * (item.slots_per_hour || 2)) + 1;
                setAssignedCourt(courtNum);
            }

            // 3. Create Booking
            const result = await supabaseService.dibs.createBooking(
                {
                    item_id: item.id,
                    operator_id: operator.user_id,
                    quantity: bookingType === 'SLOT_BASED' ? selectedSlots.length : quantity,
                    booking_date: bookingType === 'SLOT_BASED' ? selectedSlots.map(s => `${s.date} ${s.time}`).join(', ') : date,
                    payment_proof_url: mockProofUrl,
                    payment_method: paymentMethod,
                    total_amount: totalPrice,
                    // Additional Metadata for the new flow
                    booking_ref: simulatedCode,
                    slot_times: selectedSlots,
                    extracted_ref: verificationResult?.extracted_ref,
                    tier_id: selectedTierId || undefined,
                    metadata: {
                        name: userInfo.name,
                        contact: userInfo.contact,
                        email: userInfo.email,
                        referral_code: userInfo.referral,
                        voucher_code: voucherCode,
                        assigned_resource: assignedCourt ? `Court ${assignedCourt}` : undefined
                    }
                }
            );

            if (result.success) {
                setStep(3);
            } else {
                alert('Booking failed. Please try again.');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render Logic for Time Slots (Grid Blocks for Easy Picking)
    const renderTimeSlots = () => {
        const slots = (item.opening_time && item.closing_time)
            ? generateDynamicSlots(item.opening_time, item.closing_time, item.slot_duration || 60)
            : MOCK_TIME_SLOTS;

        return (
            <div className="grid grid-cols-4 gap-2 mt-2">
                {slots.map((time, idx) => {
                    // Mock availability
                    const isBooked = (item.id.charCodeAt(0) + (selectedResourceId?.charCodeAt(0) || 0) + idx + new Date(date).getDate()) % 5 === 0;
                    const isSelected = selectedSlots.some(s => s.date === date && s.time === time);

                    return (
                        <button
                            key={time}
                            disabled={isBooked}
                            onClick={() => {
                                if (isSelected) {
                                    setSelectedSlots(prev => prev.filter(s => !(s.date === date && s.time === time)));
                                } else {
                                    setSelectedSlots(prev => [...prev, { date, time }]);
                                }
                            }}
                            className={`
                                h-12 px-1 rounded-2xl text-[10px] font-black uppercase tracking-tighter border transition-all relative overflow-hidden
                                ${isBooked
                                    ? 'bg-white/[0.02] border-white/5 text-zinc-700 cursor-not-allowed'
                                    : isSelected
                                        ? 'bg-electric-teal text-black border-electric-teal shadow-[0_0_15px_rgba(45,212,191,0.3)]'
                                        : 'bg-white/5 border-white/10 text-zinc-300 hover:border-white/20 hover:bg-white/10'
                                }
                            `}
                        >
                            <div className={`relative z-10 ${isBooked ? 'opacity-20' : ''}`}>
                                {time.split(' ')[0]}
                                <span className="text-[7px] ml-0.5 opacity-50">{time.split(' ')[1]}</span>
                            </div>

                            {isBooked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <span className="text-[7px] font-black text-white/40 tracking-[0.2em] uppercase">
                                        DIBBED
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderDateTimeline = () => {
        const today = new Date();
        const dates = Array.from({ length: 5 }).map((_, i) => {
            const d = new Date();
            d.setDate(today.getDate() + i);
            return d;
        });

        return (
            <div className="flex gap-2.5 items-center pb-4 custom-scrollbar no-scrollbar scroll-smooth -mx-6 px-6">
                {dates.map((d) => {
                    const dateStr = d.toISOString().split('T')[0];
                    const isSelected = date === dateStr;
                    const isToday = d.toDateString() === today.toDateString();

                    return (
                        <button
                            key={dateStr}
                            onClick={() => {
                                setDate(dateStr);
                                setShowPicker(false);
                            }}
                            className={`
                                flex flex-col items-center justify-center min-w-[50px] h-[64px] rounded-2xl border transition-all duration-300
                                ${isSelected
                                    ? 'bg-electric-teal border-electric-teal text-black shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                                    : 'bg-white/[0.06] border-white/10 text-zinc-400 hover:border-white/20'
                                }
                            `}
                        >
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-black/60' : 'text-zinc-500'}`}>
                                {isToday ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' })}
                            </span>
                            <span className={`text-sm font-black -mt-0.5 ${isSelected ? 'text-black' : 'text-white'}`}>
                                {d.getDate()}
                            </span>
                            {isToday && !isSelected && (
                                <div className="w-1 h-1 rounded-full bg-electric-teal mt-1" />
                            )}
                        </button>
                    );
                })}

                <div className="h-10 w-px bg-white/10 mx-1 shrink-0" />

                <button
                    onClick={() => setShowPicker(true)}
                    className="flex flex-col items-center justify-center min-w-[50px] h-[64px] rounded-2xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 transition-all shrink-0"
                >
                    <Calendar size={18} className="text-electric-teal" />
                    <span className="text-[7px] font-black uppercase tracking-widest mt-1">Pick</span>
                </button>
            </div>
        );
    };

    const renderCalendarInline = () => {
        const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
        const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

        const daysInMonth = getDaysInMonth(viewMonth, viewYear);
        const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
        const blanks = Array.from({ length: firstDay }, (_, i) => i);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 shadow-2xl">
                <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none">
                        {MONTHS[viewMonth]} {viewYear}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (viewMonth === 0) {
                                    setViewMonth(11);
                                    setViewYear(prev => prev - 1);
                                } else {
                                    setViewMonth(prev => prev - 1);
                                }
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => {
                                if (viewMonth === 11) {
                                    setViewMonth(0);
                                    setViewYear(prev => prev + 1);
                                } else {
                                    setViewMonth(prev => prev + 1);
                                }
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={14} className="rotate-180" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 mb-2">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-[7px] font-black text-zinc-600 uppercase py-1">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {blanks.map(b => <div key={`blank-${b}`} />)}
                    {days.map(d => {
                        const m = (viewMonth + 1).toString().padStart(2, '0');
                        const dayStr = d.toString().padStart(2, '0');
                        const fullDate = `${viewYear}-${m}-${dayStr}`;
                        const isSelected = date === fullDate;
                        const isToday = new Date().toISOString().split('T')[0] === fullDate;
                        const isPast = fullDate < new Date().toISOString().split('T')[0];

                        return (
                            <button
                                key={d}
                                onClick={() => {
                                    if (!isPast) {
                                        setDate(fullDate);
                                        setShowPicker(false);
                                    }
                                }}
                                disabled={isPast}
                                className={`
                                    h-7 w-7 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all
                                    ${isSelected
                                        ? 'bg-electric-teal text-black font-black scale-110 shadow-[0_0_10px_rgba(45,212,191,0.4)]'
                                        : isPast
                                            ? 'text-zinc-800'
                                            : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                                    }
                                    ${isToday && !isSelected ? 'border border-electric-teal/30 text-electric-teal' : ''}
                                `}
                            >
                                {d}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <button
                        onClick={() => setShowPicker(false)}
                        className="px-4 py-1.5 rounded-lg bg-white/5 text-zinc-400 text-[8px] font-black uppercase hover:bg-white/10 hover:text-white transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:pt-24">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-zinc-900 border border-white/15 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] md:max-h-[75vh]"
            >
                {/* Floating Navigation Controls */}
                <div className="absolute top-6 left-0 right-0 px-6 flex items-center justify-between z-50 pointer-events-none">
                    <div className="pointer-events-auto">
                        {isViewingPoster ? (
                            <button
                                onClick={() => setIsViewingPoster(false)}
                                className="p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all active:scale-90"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        ) : step > 0 && step < 3 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all active:scale-90"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className={`pointer-events-auto p-2 rounded-full transition-all active:scale-90 ${isViewingPoster ? 'bg-black/40 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-black/60' : 'bg-white/10 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/20'}`}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-0 relative flex flex-col overflow-hidden h-[75vh]">
                    <AnimatePresence mode="wait">
                        {isViewingPoster ? (
                            <motion.div
                                key="poster-view"
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                className="absolute inset-0 bg-zinc-950 flex flex-col"
                            >
                                <div className="flex-1 relative group overflow-hidden">
                                    {/* Slideshow Poster Content */}
                                    <div className="absolute inset-0 flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                                        {images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                className="w-full h-full object-cover shrink-0"
                                            />
                                        ))}
                                    </div>

                                    {/* Navigation Arrows */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length); }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-black/50 transition-all z-20"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % images.length); }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-black/50 transition-all z-20"
                                            >
                                                <ChevronLeft size={24} className="rotate-180" />
                                            </button>
                                        </>
                                    )}

                                    {/* Subtle gradients for control legibility */}
                                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                                    {/* Minimalist Floating Controls Bottom Right */}
                                    <div className="absolute right-8 bottom-10 flex flex-col gap-4 z-10">
                                        <button
                                            onClick={handleDownloadPoster}
                                            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/60 transition-all active:scale-95 shadow-2xl"
                                            title="Download"
                                        >
                                            <Download size={20} />
                                        </button>
                                        <button
                                            onClick={handleSharePoster}
                                            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/60 transition-all active:scale-95 shadow-2xl"
                                            title="Share"
                                        >
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>


                            </motion.div>
                        ) : (
                            <motion.div
                                key="booking-steps"
                                initial={{ opacity: 0, rotateY: -90, scale: 0.95 }}
                                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                                exit={{ opacity: 0, rotateY: 90, scale: 0.95 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200, bounce: 0 }}
                                className="absolute inset-0 p-6 pt-20 overflow-y-auto custom-scrollbar flex flex-col"
                            >
                                {/* Step 0: Item Details */}
                                {step === 0 && (
                                    <>
                                        <motion.div
                                            key="step0"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="pt-2"
                                        >
                                            <div className="flex gap-6 items-start">
                                                {/* Left Side: Poster */}
                                                <div
                                                    className="relative w-32 h-48 rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl cursor-zoom-in group shrink-0 hover:rotate-0 transition-all duration-700"
                                                    onClick={() => setIsViewingPoster(true)}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        <motion.img
                                                            key={currentImageIndex}
                                                            src={images[currentImageIndex]}
                                                            initial={{ opacity: 0, scale: 1.1 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            transition={{ duration: 0.8 }}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                    </AnimatePresence>
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-500" />

                                                    {images.length > 1 && (
                                                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                                            {images.map((_, i) => (
                                                                <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === currentImageIndex ? 'w-2 bg-electric-teal' : 'bg-white/30'}`} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right Side: Header & Deets */}
                                                <div className="flex-1 flex flex-col gap-4">
                                                    {/* BRAND HEADER */}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-zinc-800">
                                                                <img
                                                                    src={operator.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${operator.business_name}`}
                                                                    className="w-full h-full object-cover"
                                                                    alt={operator.business_name}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-electric-teal via-purple-400 to-electric-teal bg-clip-text text-transparent">
                                                                {operator.business_name}
                                                            </span>
                                                            {operator.is_verified && <Shield size={10} className="text-electric-teal fill-electric-teal/20" />}
                                                        </div>

                                                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-3">
                                                            {item.title}
                                                        </h2>

                                                        {/* SHORT INFO / STATUS */}
                                                        <div className="flex flex-col gap-1.5">
                                                            {bookingType === 'TIER_BASED' ? (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-1.5 text-white/50">
                                                                        <Calendar size={10} className="text-electric-teal" />
                                                                        <span className="text-[9px] font-bold uppercase text-white/80">
                                                                            {item.event_date ? new Date(item.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                                                    <div className="flex items-center gap-1.5 text-white/50">
                                                                        <Sparkles size={10} className="text-electric-teal" />
                                                                        <span className="text-[9px] font-bold uppercase text-white/80">
                                                                            {item.event_date ? new Date(item.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-white/5 border border-white/10">
                                                                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                                                                            OPEN DAILY
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-white/40">
                                                                        <Sparkles size={10} />
                                                                        <span className="text-[9px] font-bold uppercase text-white/80">
                                                                            {item.opening_time || '06:00'} - {item.closing_time || '23:00'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* Categories/Types */}
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-electric-teal/5 border border-white/10 uppercase">
                                                                    <span className="text-[9px] font-black text-white/50">{item.category}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Deets Section */}
                                                    {(item.description || operator.bio) && (
                                                        <div className="space-y-2">
                                                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Deets</label>
                                                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                                                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                                                                    {item.description || operator.bio}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-6 mb-10">
                                                {bookingType === 'SLOT_BASED' && item.category === 'Court' && (
                                                    <div className="space-y-3">
                                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Pricing Tiers</label>
                                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                            {RATE_CARDS.map((card) => (
                                                                <div key={card.id} className="min-w-[140px] p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[9px] font-black uppercase text-electric-teal tracking-wider">{card.label}</span>
                                                                        <span className="text-[10px] font-bold text-white">₱{card.price}</span>
                                                                    </div>
                                                                    <span className="text-[8px] text-zinc-500 font-bold">{card.time}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* PLACE SPECIFIC: Date Timeline Picker */}
                                                {bookingType !== 'TIER_BASED' && (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Pick Date</label>
                                                        </div>
                                                        {renderDateTimeline()}
                                                    </div>
                                                )}

                                                {/* SELECTION ENGINE: Slots vs Tiers */}
                                                <div className="space-y-4">
                                                    {bookingType === 'SLOT_BASED' ? (
                                                        <div className="perspective-1000 relative min-h-[220px]">
                                                            <AnimatePresence mode="wait">
                                                                {!showPicker ? (
                                                                    <motion.div
                                                                        key="slots"
                                                                        initial={{ rotateY: 90, opacity: 0 }}
                                                                        animate={{ rotateY: 0, opacity: 1 }}
                                                                        exit={{ rotateY: -90, opacity: 0 }}
                                                                        transition={{ type: 'spring', damping: 25, stiffness: 250, bounce: 0 }}
                                                                        className="space-y-4 backface-hidden w-full origin-center"
                                                                    >
                                                                        <div className="flex items-center justify-between px-1">
                                                                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                                                                Time Slots
                                                                            </label>
                                                                            {selectedSlots.length > 0 && <span className="text-[8px] font-black text-electric-teal uppercase">{selectedSlots.length} Selected</span>}
                                                                        </div>
                                                                        {renderTimeSlots()}

                                                                        {/* Pricing Highlight below slots */}
                                                                        {selectedSlots.length > 0 && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                className="mt-6 bg-white/[0.03] border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-xl"
                                                                            >
                                                                                <div>
                                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Total Estimate</p>
                                                                                    <div className="flex items-baseline gap-1">
                                                                                        <span className="text-xl font-black text-white">₱{totalPrice.toLocaleString()}</span>
                                                                                        <span className="text-[10px] font-bold text-zinc-500">for {selectedSlots.length} slots</span>
                                                                                    </div>
                                                                                </div>
                                                                                {isRestricted ? (
                                                                                    <div className="px-6 py-2.5 bg-zinc-800 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 cursor-not-allowed">
                                                                                        Friday
                                                                                    </div>
                                                                                ) : (
                                                                                    <button
                                                                                        onClick={() => setStep(1)}
                                                                                        className="px-6 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                                                                    >
                                                                                        Next
                                                                                    </button>
                                                                                )}
                                                                            </motion.div>
                                                                        )}
                                                                    </motion.div>
                                                                ) : (
                                                                    <motion.div
                                                                        key="calendar"
                                                                        initial={{ rotateY: 90, opacity: 0 }}
                                                                        animate={{ rotateY: 0, opacity: 1 }}
                                                                        exit={{ rotateY: -90, opacity: 0 }}
                                                                        transition={{ type: 'spring', damping: 25, stiffness: 250, bounce: 0 }}
                                                                        className="space-y-4 backface-hidden w-full origin-center"
                                                                    >
                                                                        <div className="flex items-center justify-between px-1">
                                                                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                                                                Select Date
                                                                            </label>
                                                                        </div>
                                                                        {renderCalendarInline()}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    ) : null}

                                                    {/* Common Quantity Picker - Only for simple quantity items in Step 0 */}
                                                    {bookingType === 'QUANTITY_BASED' && (
                                                        <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">QUANTITY</span>
                                                                <span className="text-[10px] font-bold text-white uppercase">{quantity} {item.unit_label || 'Units'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <button
                                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
                                                                >
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="text-xs font-black text-white w-4 text-center">{quantity}</span>
                                                                <button
                                                                    onClick={() => setQuantity(Math.min(item.available_slots || 99, quantity + 1))}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Location Card Mini */}
                                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                                                    <div className="p-3.5 flex items-center gap-3">
                                                        <MapPin size={16} className="text-zinc-500" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">LOCATION</span>
                                                            <span className="text-[10px] font-bold text-white uppercase truncate max-w-[200px]">
                                                                {item.event_location || operator.location_text || "Davao City"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Interactive Maps Window */}
                                                    <div className="h-56 w-full bg-zinc-900 relative border-t border-white/5">
                                                        <SmartMap
                                                            mode="view"
                                                            initialLocation={item.event_lat ? {
                                                                lat: item.event_lat,
                                                                lng: item.event_lng!,
                                                                placeName: item.event_location
                                                            } : undefined}
                                                            height="100%"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Action Section (Hidden if Slot Based due to footer) */}
                                            {bookingType !== 'SLOT_BASED' && (
                                                <div className="space-y-3">
                                                    {isRestricted && (
                                                        <div className="w-full py-3 rounded-xl bg-electric-teal/5 border border-dashed border-electric-teal/20 text-center flex flex-col items-center justify-center gap-1 mb-2">
                                                            <p className="text-[10px] font-black uppercase text-electric-teal tracking-widest">Preview Mode</p>
                                                            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Experience the flow before launch</p>
                                                        </div>
                                                    )}

                                                    <GradientButton
                                                        onClick={() => setStep(1)}
                                                        fullWidth
                                                        className="shadow-[0_20px_40px_-10px_rgba(20,255,236,0.3)]"
                                                    >
                                                        {isRestricted ? 'START PREVIEW FLOW' : 'GET DIBS'}
                                                    </GradientButton>
                                                </div>
                                            )}
                                        </motion.div>


                                    </>
                                )}

                                {/* STEP 1: INFO COLLECTION */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="py-2 space-y-6"
                                    >
                                        <div className="text-center space-y-2 mb-8">
                                            <h3 className="text-xl font-black uppercase text-white tracking-tight">Guest Details</h3>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Who are we expecting?</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={userInfo.name}
                                                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                                    placeholder="ENTER FULL NAME"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white placeholder-white/20 outline-none focus:border-electric-teal/50 transition-all uppercase"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Contact Number</label>
                                                <input
                                                    type="tel"
                                                    value={userInfo.contact}
                                                    onChange={(e) => setUserInfo({ ...userInfo, contact: e.target.value })}
                                                    placeholder="09XXXXXXXXX"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white placeholder-white/20 outline-none focus:border-electric-teal/50 transition-all uppercase"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Email Address (Optional)</label>
                                                <input
                                                    type="email"
                                                    value={userInfo.email}
                                                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                                                    placeholder="EMAIL@EXAMPLE.COM"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white placeholder-white/20 outline-none focus:border-electric-teal/50 transition-all uppercase"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Who referred you?</label>
                                                <input
                                                    type="text"
                                                    value={userInfo.referral}
                                                    onChange={(e) => setUserInfo({ ...userInfo, referral: e.target.value })}
                                                    placeholder="NAME OR CODE"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white placeholder-white/20 outline-none focus:border-electric-teal/50 transition-all uppercase"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-8">
                                            <GradientButton
                                                onClick={() => setStep(2)}
                                                fullWidth
                                                disabled={!userInfo.name || !userInfo.contact}
                                            >
                                                GET DIBS
                                            </GradientButton>
                                        </div>
                                    </motion.div>
                                )}


                                {/* STEP 2: PAYMENT */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="pb-8"
                                    >
                                        <div className="space-y-6 pt-2">
                                            {/* Tier selection moved to payment step */}
                                            {/* Tier selection moved to payment step */}
                                            {bookingType === 'TIER_BASED' && (
                                                <div className="space-y-4">
                                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">Tiers & Inclusions</label>
                                                    <div className="flex flex-col gap-3">
                                                        {item.tiers?.map(tier => (
                                                            <div
                                                                key={tier.id}
                                                                onClick={() => {
                                                                    setSelectedTierId(tier.id);
                                                                    setQuantity(1);
                                                                }}
                                                                className={`p-5 rounded-2xl border transition-all cursor-pointer relative group
                                                                    ${selectedTierId === tier.id
                                                                        ? 'bg-electric-teal/5 border-electric-teal shadow-[0_0_30px_-5px_rgba(45,212,191,0.15)]'
                                                                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                                                                    }
                                                                `}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className={`text-base font-black uppercase tracking-tight ${selectedTierId === tier.id ? 'text-electric-teal' : 'text-white'}`}>
                                                                        {tier.name}
                                                                    </span>
                                                                    {selectedTierId === tier.id && (
                                                                        <Check size={16} className="text-electric-teal" />
                                                                    )}
                                                                </div>

                                                                <div className="flex justify-between items-end">
                                                                    <div className="text-[10px] text-zinc-400 font-medium max-w-[70%]">
                                                                        {tier.perks?.join(' • ') || 'Standard Entry'}
                                                                    </div>
                                                                    <span className="text-lg font-black text-white tracking-tight">
                                                                        ₱{tier.price.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Quantity Picker for Tiers */}
                                                    {selectedTierId && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-between mt-2"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">QUANTITY</span>
                                                                <span className="text-sm font-black text-white uppercase">{quantity} TICKET{quantity > 1 ? 'S' : ''}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-1 border border-white/5">
                                                                <button
                                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-90"
                                                                >
                                                                    <Minus size={16} />
                                                                </button>
                                                                <span className="text-base font-black text-white w-6 text-center tabular-nums">{quantity}</span>
                                                                <button
                                                                    onClick={() => setQuantity(Math.min(item.available_slots || 99, quantity + 1))}
                                                                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-90"
                                                                >
                                                                    <Plus size={16} />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Payment Method Selector */}
                                            <div className="flex gap-2 p-1 bg-white/10 rounded-2xl border border-white/10">
                                                {[
                                                    { id: 'gcash', label: 'PAY', icon: Wallet },
                                                    { id: 'aura', label: 'Aura', icon: Sparkles, badge: 'Soon' }
                                                ].map((method) => (
                                                    <button
                                                        key={method.id}
                                                        disabled={method.id === 'aura'}
                                                        onClick={() => setPaymentMethod(method.id as any)}
                                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all 
                                                    ${paymentMethod === method.id ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-zinc-400 hover:text-white hover:bg-white/10'}
                                                    ${method.id === 'aura' ? 'opacity-50 cursor-not-allowed' : ''}
                                                `}
                                                    >
                                                        <method.icon size={14} />
                                                        {method.label}
                                                        {method.badge && <span className="text-[8px] bg-electric-teal text-black px-1 rounded ml-1">{method.badge}</span>}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Promotions</label>
                                                    {!showVoucherInput ? (
                                                        <button
                                                            onClick={() => setShowVoucherInput(true)}
                                                            className="text-[8px] font-black text-electric-teal uppercase tracking-widest hover:underline"
                                                        >
                                                            Have a voucher?
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setShowVoucherInput(false); setVoucherCode(''); }}
                                                            className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {showVoucherInput && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[7px] font-black text-electric-teal uppercase tracking-[0.2em] mb-0.5">Voucher System</span>
                                                                    <span className="text-[10px] font-bold text-zinc-400">Feature coming soon!</span>
                                                                </div>
                                                                <Sparkles size={14} className="text-electric-teal animate-pulse" />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Premium Billing Invoice */}
                                            <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-5 shadow-2xl">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-electric-teal/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Billing Summary</h4>
                                                        <div className="flex items-center gap-2">
                                                            <FileText size={14} className="text-electric-teal" />
                                                            <span className="text-xs font-bold text-white uppercase tracking-tight">Order #DIB-{item.id.slice(0, 4).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Payable Amount</p>
                                                        <p className="text-2xl font-black text-white leading-none mt-1">₱{totalPrice.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 border-t border-white/5 pt-4">
                                                    <div className="flex justify-between items-center text-[8px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">
                                                        <span>Itinerary Breakdown</span>
                                                        <span>{selectedSlots.length} Items</span>
                                                    </div>

                                                    <div className="space-y-4 pr-1">
                                                        {bookingType === 'SLOT_BASED' ? (
                                                            // Group slots by date for better billing clarity
                                                            Object.entries(
                                                                selectedSlots.reduce((acc, slot) => {
                                                                    if (!acc[slot.date]) acc[slot.date] = [];
                                                                    acc[slot.date].push(slot);
                                                                    return acc;
                                                                }, {} as Record<string, typeof selectedSlots>)
                                                            ).map(([dStr, daySlots]) => (
                                                                <div key={dStr} className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-px flex-1 bg-white/5" />
                                                                        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">
                                                                            {new Date(dStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                                        </span>
                                                                        <div className="h-px flex-1 bg-white/5" />
                                                                    </div>
                                                                    {daySlots.map((slot, i) => {
                                                                        const hour = parseInt(slot.time.split(':')[0]) + (slot.time.includes('PM') && slot.time !== '12:00 PM' ? 12 : 0);
                                                                        const price = item.category === 'Court' ? (hour >= 16 ? 300 : 150) : item.price;
                                                                        return (
                                                                            <div key={i} className="flex justify-between items-center text-[10px] bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                                                                                <span className="text-white font-bold">{slot.time}</span>
                                                                                <span className="text-zinc-300 font-mono">₱{price}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="flex justify-between items-center text-[10px] bg-white/[0.02] border border-white/5 p-2 rounded-lg">
                                                                <div className="flex flex-col">
                                                                    <span className="text-white font-bold">{quantity} {item.unit_label || 'Units'}</span>
                                                                    <span className="text-[8px] text-zinc-500 uppercase font-black">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                                </div>
                                                                <span className="text-zinc-300 font-mono">₱{totalPrice}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3.5 bg-electric-teal/5 border border-dashed border-electric-teal/20 rounded-xl flex gap-3 items-center">
                                                <div className="w-8 h-8 rounded-full bg-electric-teal/10 flex items-center justify-center text-electric-teal shrink-0">
                                                    <AlertCircle size={14} />
                                                </div>
                                                <p className="text-[10px] text-zinc-400 leading-tight font-medium">
                                                    Please send exactly <span className="text-white font-bold">₱{totalPrice.toLocaleString()}</span>. Screenshot the success screen and upload below for automated verification.
                                                </p>
                                            </div>

                                            {paymentMethod === 'gcash' ? (
                                                <>
                                                    {/* Payment Destination (Static List) */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Send Payment To</label>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3">
                                                            {[
                                                                { name: operator.gcash_name, number: operator.gcash_number, label: 'Primary Account', icon: 'GCASH' },
                                                                { name: operator.gcash_name, number: '0977-123-4567', label: 'Secondary (Backup)', icon: 'GCASH' }
                                                            ].map((account, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="relative flex items-center gap-5 p-5 rounded-2xl border bg-white/[0.03] border-white/10 shadow-lg group"
                                                                >
                                                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[11px] font-black shadow-inner bg-blue-600/20 text-blue-400 border border-blue-500/20">
                                                                        {account.icon}
                                                                    </div>
                                                                    <div className="text-left flex-1 min-w-0">
                                                                        <div className="flex items-center gap-1.5 mb-1">
                                                                            <p className="text-[8px] uppercase font-black tracking-[0.2em] text-zinc-500">{account.label}</p>
                                                                        </div>
                                                                        <p className="font-black text-white text-sm uppercase tracking-tight truncate">{account.name}</p>
                                                                        <div className="flex items-center gap-2 mt-1.5">
                                                                            <p className="text-2xl font-black text-white font-mono tracking-tighter leading-none">{account.number}</p>
                                                                            <button
                                                                                onClick={() => handleCopy(account.number)}
                                                                                className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
                                                                                title="Copy Number"
                                                                            >
                                                                                <Copy size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest text-center px-4">Transfer funds through any of the accounts above</p>
                                                    </div>

                                                    {/* Upload Proof */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Payment Proof</label>
                                                            {isRestricted && <span className="text-[8px] font-bold text-electric-teal uppercase tracking-widest animate-pulse">Mock Upload Required</span>}
                                                        </div>
                                                        <div
                                                            onClick={isRestricted ? () => {
                                                                // Mock file upload for preview mode
                                                                const mockFile = new File([""], "mock_receipt.jpg", { type: "image/jpeg" });
                                                                setProofFile(mockFile);
                                                                // Auto trigger verification after short delay
                                                                setTimeout(() => {
                                                                    setVerificationResult({ verified: true, confidence: 0.99, reason: 'Mock Verification Successful' });
                                                                }, 1500);
                                                            } : () => fileInputRef.current?.click()}
                                                            className={`
                                                    border border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all relative overflow-hidden
                                                    ${proofFile ? 'border-electric-teal/50 bg-electric-teal/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}
                                                `}
                                                        >
                                                            <input
                                                                type="file"
                                                                ref={fileInputRef}
                                                                onChange={handleFileChange}
                                                                accept="image/*"
                                                                className="hidden"
                                                            />
                                                            {proofFile ? (
                                                                <div className="z-10 flex flex-col items-center">
                                                                    <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-white/20 mb-3 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                                                                        <img
                                                                            src={URL.createObjectURL(proofFile)}
                                                                            className="w-full h-full object-cover"
                                                                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                                                            alt="Proof"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/20" />
                                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                                            <Check size={20} className="text-electric-teal drop-shadow-lg" />
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-xs font-bold text-white max-w-[200px] truncate">{proofFile.name}</p>
                                                                    <p className="text-[10px] text-electric-teal uppercase font-bold mt-1">Ready to Verify</p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                                                                        <Upload size={20} />
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="text-xs font-bold text-gray-300">
                                                                            {isRestricted ? 'Tap to Simulate Upload' : 'Tap to Upload Screenshot'}
                                                                        </p>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="py-10 flex flex-col items-center justify-center gap-6 bg-white/5 rounded-2xl border border-white/10 opacity-50">
                                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-electric-teal to-purple-500 flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.3)]">
                                                        <Sparkles className="text-white" size={32} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-black text-white tracking-tighter">{(totalPrice * 10).toLocaleString()}</p>
                                                        <p className="text-[10px] font-black uppercase text-electric-teal tracking-[0.3em]">AURA POINTS</p>
                                                        <p className="text-[8px] font-bold text-gray-500 mt-2">COMING SOON</p>
                                                    </div>
                                                </div>
                                            )}

                                            <GradientButton
                                                onClick={handleSubmit}
                                                fullWidth
                                                disabled={
                                                    isSubmitting ||
                                                    isVerifying ||
                                                    (paymentMethod === 'gcash' && (!proofFile || (verificationResult ? !verificationResult.verified : false))) ||
                                                    paymentMethod === 'aura' ||
                                                    (bookingType === 'TIER_BASED' && !selectedTierId)
                                                }
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> :
                                                    isVerifying ? 'SYSTEM VERIFYING...' :
                                                        paymentMethod === 'gcash' ? 'CONFIRM DIBS' : 'AURA PAYMENT SOON'}
                                            </GradientButton>

                                            {/* System Verification Result Overlay */}
                                            <AnimatePresence>
                                                {(isVerifying || verificationResult) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`p-4 rounded-2xl border flex items-center gap-4 ${isVerifying ? 'bg-white/5 border-white/10' :
                                                            verificationResult?.verified ? 'bg-electric-teal/10 border-electric-teal/20' : 'bg-red-500/10 border-red-500/20'
                                                            }`}
                                                    >
                                                        <div className="shrink-0">
                                                            {isVerifying ? <Loader2 className="animate-spin text-white/40" size={20} /> :
                                                                verificationResult?.verified ? <Shield className="text-electric-teal" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">System Verification</p>
                                                            <p className={`text-xs font-bold ${isVerifying ? 'text-white/40' : verificationResult?.verified ? 'text-electric-teal' : 'text-red-500'}`}>
                                                                {isVerifying ? 'Scanning receipt for details...' : verificationResult?.reason}
                                                            </p>
                                                        </div>
                                                        {verificationResult && (
                                                            <div className="text-right">
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Confidence</p>
                                                                <p className="text-xs font-black text-white">{Math.round(verificationResult.confidence * 100)}%</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )}


                                {/* STEP 3: SUCCESS */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <div className="flex flex-col items-center justify-center text-center py-2 space-y-6">
                                            {/* Success Animation & Code Container for Screenshot */}
                                            {/* PREMIUM PASS TICKET */}
                                            <div ref={ticketRef} className="w-full max-w-sm mx-auto">
                                                <div className="relative w-full overflow-hidden rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
                                                    {/* Background Aesthetics */}
                                                    <div className="absolute inset-0 bg-[#0A0A0B]" />
                                                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-electric-teal/20 to-transparent opacity-50" />
                                                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-electric-teal/5 rounded-full blur-[80px]" />

                                                    {/* Status Badge */}
                                                    {(() => {
                                                        const bDate = bookingType === 'TIER_BASED' && item.event_date ? item.event_date : date;
                                                        const isToday = new Date(bDate).toDateString() === new Date().toDateString();
                                                        return (
                                                            <>
                                                                {isRestricted && (
                                                                    <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-zinc-800/80 backdrop-blur-md border border-white/10 rounded-full">
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Preview Mode</span>
                                                                    </div>
                                                                )}
                                                                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest z-20 ${isToday
                                                                    ? 'bg-electric-teal text-black border-electric-teal shadow-[0_0_15px_rgba(45,212,191,0.4)]'
                                                                    : 'bg-white/5 text-white/50 border-white/10'
                                                                    }`}>
                                                                    {isToday ? 'Valid Today' : 'Upcoming'}
                                                                </div>
                                                            </>
                                                        );
                                                    })()}

                                                    <div className="relative z-10 p-8 pb-10">
                                                        {/* Header */}
                                                        <div className="flex items-center gap-3 mb-10">
                                                            <div className="w-10 h-10 rounded-xl bg-electric-teal flex items-center justify-center text-black shadow-lg">
                                                                <Check size={20} strokeWidth={4} />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-1">Status</p>
                                                                <p className="text-lg font-black uppercase text-white leading-none tracking-tight">Dibs Called</p>
                                                            </div>
                                                        </div>

                                                        {/* Main Highlight: Itinerary List (Redesigned Minimalist) */}
                                                        <div className="mb-10 border-b border-white/10 pb-8">
                                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6 text-left">Itinerary Breakdown</p>
                                                            <div className="space-y-4">
                                                                {bookingType === 'SLOT_BASED' ? (
                                                                    Object.entries(
                                                                        selectedSlots.reduce((acc, slot) => {
                                                                            if (!acc[slot.date]) acc[slot.date] = [];
                                                                            acc[slot.date].push(slot);
                                                                            return acc;
                                                                        }, {} as Record<string, typeof selectedSlots>)
                                                                    ).map(([dStr, daySlots]) => (
                                                                        <div key={dStr} className="space-y-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[6px] font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                                                                    {new Date(dStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                                                </span>
                                                                                <div className="h-px flex-1 bg-white/5" />
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                {daySlots.map((slot, i) => (
                                                                                    <div key={i} className="flex items-center justify-between group px-3 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                                                                                        <p className="text-[10px] font-black uppercase text-white tracking-tight">{slot.time}</p>
                                                                                        <div className="w-1 h-1 rounded-full bg-electric-teal/40" />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                                                        <div className="text-left">
                                                                            <p className="text-xl font-black uppercase text-white tracking-tight">{quantity} {item.unit_label || 'Units'}</p>
                                                                            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                                                                {new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                                                            </p>
                                                                        </div>
                                                                        <div className="w-2 h-2 rounded-full bg-electric-teal shadow-[0_0_10px_rgba(45,212,191,0.3)]" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Code Area with QR */}
                                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center group active:scale-95 transition-all">
                                                            <div className="flex flex-col items-center gap-4 mb-4">
                                                                <div className="w-32 h-32 bg-white rounded-2xl p-3 shadow-inner">
                                                                    <img
                                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingCode}`}
                                                                        alt="QR Code"
                                                                        className="w-full h-full opacity-80"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">DIB CODE</p>
                                                                    <p className="text-4xl font-mono font-black tracking-[0.2em] text-white brightness-125 group-hover:tracking-[0.3em] transition-all">
                                                                        {bookingCode}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-center gap-2 opacity-30">
                                                                <div className="h-[1px] flex-1 bg-white/20" />
                                                                <Shield size={10} className="text-white" />
                                                                <div className="h-[1px] flex-1 bg-white/20" />
                                                            </div>
                                                        </div>

                                                        {/* Footer Info */}
                                                        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
                                                            <div className="text-left">
                                                                <p className="text-[7px] font-black uppercase text-zinc-600 tracking-widest mb-1">Pass Holder</p>
                                                                <p className="text-[10px] font-black text-white uppercase truncate">
                                                                    <span className="animate-liquid-text">
                                                                        {userInfo.name || 'Guest'}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-[7px] font-black uppercase text-zinc-600 tracking-widest mb-1">
                                                                    {assignedCourt ? 'Assigned' : 'Quantity'}
                                                                </p>
                                                                <p className="text-[10px] font-black text-white uppercase">
                                                                    {assignedCourt ? `#${assignedCourt}` : `${quantity} ${item.unit_label || 'Units'}`}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[7px] font-black uppercase text-zinc-600 tracking-widest mb-1">Operator</p>
                                                                <p className="text-[10px] font-black text-white uppercase truncate">
                                                                    <span className="animate-liquid-text">
                                                                        {operator.business_name}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {assignedCourt && (
                                                            <div className="mt-6 p-4 rounded-2xl bg-electric-teal/5 border border-electric-teal/10 flex items-center justify-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-electric-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-white">Go to Court #{assignedCourt} upon arrival</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Decorative Notch / Security Edge */}
                                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-900 border border-white/10" />
                                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-900 border border-white/10" />
                                                </div >
                                            </div>

                                            <p className="text-[9px] text-gray-600 leading-relaxed max-w-[250px] mx-auto uppercase font-black tracking-[0.2em] mt-6 mb-2">
                                                SECURE ID: {secureId}
                                            </p>
                                            <p className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest mb-6">Don't share this ticket with others. Download or screenshot for your copy.</p>

                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={handleDownload}
                                                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-95"
                                                    title="Download Ticket"
                                                >
                                                    <Download size={20} />
                                                </button>
                                                <button
                                                    onClick={handleShare}
                                                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-95"
                                                    title="Share Ticket"
                                                >
                                                    <Share2 size={20} />
                                                </button>
                                            </div>

                                            <p className="text-[10px] text-gray-500 leading-relaxed max-w-[250px] mx-auto">
                                                Show this code to the operator upon arrival.
                                                Ticket has been saved to your profile.
                                            </p>

                                            <GradientButton onClick={onClose} fullWidth>
                                                DONE
                                            </GradientButton>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

console.log('BookingModal loaded');

export default BookingModal;


