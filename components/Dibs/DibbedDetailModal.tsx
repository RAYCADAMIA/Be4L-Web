import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Download, Share2, Shield, Calendar, MapPin, Clock } from 'lucide-react';
import { DibsBooking } from '../../types';

import { GradientButton } from '../ui/AestheticComponents';
import { useToast } from '../Toast';

interface DibbedDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: DibsBooking | null;
}

const DibbedDetailModal: React.FC<DibbedDetailModalProps> = ({ isOpen, onClose, booking }) => {
    const ticketRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        try {
            const htmlToImage = await import('html-to-image');
            const dataUrl = await htmlToImage.toPng(ticketRef.current, { quality: 1.0, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `BE4L_TICKET_${booking?.booking_ref || 'PASS'}.png`;
            link.href = dataUrl;
            link.click();
            showToast('Ticket saved to device', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to download ticket', 'error');
        }
    };

    const handleShare = async () => {
        if (!ticketRef.current) return;
        try {
            const htmlToImage = await import('html-to-image');
            const blob = await htmlToImage.toBlob(ticketRef.current, { quality: 1.0, pixelRatio: 2 });
            if (blob && navigator.share) {
                const file = new File([blob], `ticket.png`, { type: 'image/png' });
                await navigator.share({
                    title: 'My Be4L Dibs',
                    text: `Check out my dibs for ${booking?.item?.title}!`,
                    files: [file]
                });
            } else {
                handleDownload();
            }
        } catch (err) {
            console.error(err);
            handleDownload(); // Fallback
        }
    };

    if (!isOpen || !booking) return null;

    // Helper: Parse slot times if they exist
    // booking.slot_times might be ["2023-11-20T10:00", "2023-11-20T11:00"] strings or objects
    const slots = booking.slot_times || [];
    const hasSlots = slots.length > 0;

    // Group slots by date if needed
    const slotsByDate = slots.reduce((acc, slotStr) => {
        // assuming slotStr is ISO like "2023-11-20T10:00:00" or just date-time string
        const dateObj = new Date(slotStr);
        if (isNaN(dateObj.getTime())) return acc;

        const dateKey = dateObj.toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        acc[dateKey].push(timeStr);
        return acc;
    }, {} as Record<string, string[]>);


    // Determine booking type logic (simplified)
    const isEvent = booking.item?.type === 'EVENT';
    const isSlotBased = hasSlots && !isEvent;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center justify-center text-center py-2 space-y-6">
                            {/* PREMIUM PASS TICKET */}
                            <div ref={ticketRef} className="w-full max-w-sm mx-auto">
                                <div className="relative w-full overflow-hidden rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 bg-[#0A0A0B]">
                                    {/* Background Aesthetics */}
                                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-electric-teal/20 to-transparent opacity-50" />
                                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-electric-teal/5 rounded-full blur-[80px]" />

                                    {/* Status Badge */}
                                    <div className={`absolute top-6 right-6 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest z-20 ${booking.status === 'CONFIRMED'
                                        ? 'bg-electric-teal text-black border-electric-teal shadow-[0_0_15px_rgba(45,212,191,0.4)]'
                                        : booking.status === 'REDEEMED'
                                            ? 'bg-white/10 text-white/50 border-white/10'
                                            : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                                        }`}>
                                        {booking.status}
                                    </div>

                                    <div className="relative z-10 p-8 pb-10">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-10">
                                            <div className="w-10 h-10 rounded-xl bg-electric-teal flex items-center justify-center text-black shadow-lg">
                                                <Check size={20} className="stroke-[3]" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-1">Status</p>
                                                <p className="text-lg font-black uppercase text-white leading-none tracking-tight">Dibs Called</p>
                                            </div>
                                        </div>

                                        {/* Itinerary / Details */}
                                        <div className="mb-10 border-b border-white/10 pb-8">
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6 text-left">Itinerary Breakdown</p>
                                            <div className="space-y-4">
                                                {Object.keys(slotsByDate).length > 0 ? (
                                                    Object.entries(slotsByDate).map(([dateStr, times]) => (
                                                        <div key={dateStr} className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[6px] font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                                                    {new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                                </span>
                                                                <div className="h-px flex-1 bg-white/5" />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {times.map((time, i) => (
                                                                    <div key={i} className="flex items-center justify-between group px-3 py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                                                                        <p className="text-[10px] font-black uppercase text-white tracking-tight">{time}</p>
                                                                        <div className="w-1 h-1 rounded-full bg-electric-teal/40" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                                        <div className="text-left">
                                                            <p className="text-xl font-black uppercase text-white tracking-tight">
                                                                {booking.quantity} {booking.item?.unit_label || 'Units'}
                                                            </p>
                                                            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                                                {new Date(booking.booking_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
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
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.booking_ref}`}
                                                        alt="QR Code"
                                                        className="w-full h-full opacity-80"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">DIB CODE</p>
                                                    <p className="text-4xl font-mono font-black tracking-[0.2em] text-white brightness-125 group-hover:tracking-[0.3em] transition-all break-all">
                                                        {booking.booking_ref}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 opacity-30">
                                                <div className="h-[1px] flex-1 bg-white/20" />
                                                <Shield size={10} className="text-white" />
                                                <div className="h-[1px] flex-1 bg-white/20" />
                                            </div>
                                        </div>

                                        {/* Footer Info (Unified with BookingModal) */}
                                        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
                                            <div className="text-left">
                                                <p className="text-[7px] font-black uppercase text-zinc-600 tracking-widest mb-1">Pass Holder</p>
                                                <p className="text-[10px] font-black text-white uppercase truncate">
                                                    <span className="animate-liquid-text">
                                                        {booking.metadata?.name || 'Guest'}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[7px] font-black uppercase text-zinc-600 tracking-widest mb-1">
                                                    {booking.metadata?.assigned_resource ? 'Assigned' : 'Quantity'}
                                                </p>
                                                <p className="text-[10px] font-black text-white uppercase">
                                                    {booking.metadata?.assigned_resource ? booking.metadata.assigned_resource.replace('Court ', '#') : `${booking.quantity} ${booking.item?.unit_label || 'Units'}`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[7px] font-black uppercase text-zinc-600 tracking-widest mb-1">Operator</p>
                                                <p className="text-[10px] font-black text-white uppercase truncate">
                                                    <span className="animate-liquid-text">
                                                        {booking.operator?.business_name}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Banner (Unified) */}
                                        {booking.metadata?.assigned_resource && (
                                            <div className="mt-6 p-4 rounded-2xl bg-electric-teal/5 border border-electric-teal/10 flex items-center justify-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-electric-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white">
                                                    Go to {booking.metadata.assigned_resource} upon arrival
                                                </p>
                                            </div>
                                        )}

                                    </div>

                                    {/* Decorative Notch / Security Edge */}
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-900 border border-white/10" />
                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-900 border border-white/10" />
                                </div>
                            </div>

                            <p className="text-[9px] text-gray-600 leading-relaxed max-w-[250px] mx-auto uppercase font-black tracking-[0.2em] mt-2 mb-2">
                                ID: {booking.id.slice(0, 8)}
                            </p>

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
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DibbedDetailModal;
