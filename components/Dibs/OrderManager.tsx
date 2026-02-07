import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, X, Clock, ExternalLink, RefreshCw, Filter, AlertCircle, MessageCircle, Lock, Plus, Store, Calendar, ChevronLeft } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { DibsBooking, DibsItem } from '../../types';
import { EKGLoader } from '../ui/AestheticComponents';

const OrderCard = ({ booking, onUpdateStatus }: { booking: DibsBooking, onUpdateStatus: (id: string, status: string) => void }) => {
    const isPending = booking.status === 'PENDING_VERIFICATION' || booking.status === 'PENDING_PAYMENT';
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();

    const handleAction = async (status: string) => {
        setIsUpdating(true);
        await onUpdateStatus(booking.id, status);
        setIsUpdating(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col gap-6
                ${isPending ? 'border-electric-teal/30 shadow-[0_20px_50px_rgba(45,212,191,0.05)]' : 'opacity-80'}
                relative overflow-hidden group hover:bg-white/[0.06] transition-all
            `}
        >
            {/* Glossy corner accent for pending */}
            {isPending && (
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-electric-teal/10 blur-2xl rounded-full" />
            )}

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-yellow-500 animate-pulse' : booking.status === 'CONFIRMED' ? 'bg-electric-teal shadow-[0_0_8px_rgba(45,212,191,0.5)]' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{booking.status.replace('_', ' ')}</span>
                    </div>
                    <h4 className="font-black text-white text-xl tracking-tighter">{booking.item?.title || booking.item_id || 'Unknown Item'}</h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                        Qty: <span className="text-white">{booking.quantity}</span> • Total: <span className="text-electric-teal">₱{booking.total_amount.toLocaleString()}</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">REQ ID</p>
                    <p className="text-[10px] font-mono font-black text-gray-500 bg-white/5 px-2 py-1 rounded-lg">BK-{booking.id.substring(0, 5).toUpperCase()}</p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black p-[1px]">
                    <div className="w-full h-full bg-[#0A0A0A] rounded-full flex items-center justify-center overflow-hidden">
                        {booking.user?.avatar_url ? (
                            <img src={booking.user.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-black text-gray-600">{booking.user?.name?.charAt(0) || 'U'}</span>
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-black text-white truncate">{booking.user?.name || 'Guest User'}</p>
                    <p className="text-[10px] font-bold text-gray-500">@{booking.user?.username || 'user'}</p>
                </div>
                <button
                    onClick={() => navigate('/app/chat', {
                        state: {
                            openChatId: booking.user_id,
                            openChatName: booking.user?.name || 'Customer'
                        }
                    })}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95"
                >
                    <MessageCircle size={16} />
                </button>
            </div>

            {/* Payment Proof Preview */}
            {booking.payment_proof_url ? (
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Payment Evidence</span>
                        <a href={booking.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-electric-teal uppercase tracking-widest flex items-center gap-1 hover:opacity-70">
                            View Full <ExternalLink size={10} />
                        </a>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-white/5 h-48 group/img">
                        <img src={booking.payment_proof_url} alt="Payment Proof" className="w-full h-full object-cover grayscale opacity-60 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent flex items-end p-4">
                            <div className="w-full flex items-center justify-between">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border ${(booking.confidence_score || 1) < 0.5 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-electric-teal/10 border-electric-teal/20 text-electric-teal'}`}>
                                    {(booking.confidence_score || 1) < 0.5 ? <AlertCircle size={10} /> : <Check size={10} />}
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                        {(booking.confidence_score || 1) < 0.5 ? 'Review Needed' : 'System Verified'}
                                    </span>
                                </div>
                                {booking.extracted_ref && (
                                    <span className="text-[9px] font-mono font-black text-white/40">REF: {booking.extracted_ref}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : isPending && (
                <div className="py-8 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-60">
                    <Clock size={24} className="text-gray-600" />
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Awaiting Receipt Upload</p>
                </div>
            )}

            {/* Action Bar */}
            {isPending && (
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => handleAction('REJECTED')}
                        disabled={isUpdating}
                        className="flex-1 h-[48px] rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Reject
                    </button>
                    <button
                        onClick={() => handleAction('CONFIRMED')}
                        disabled={isUpdating}
                        className="flex-[2] h-[48px] rounded-2xl bg-electric-teal text-black font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-[0_10px_30px_rgba(45,212,191,0.2)] flex items-center justify-center gap-2"
                    >
                        {isUpdating ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                        Verify Payment
                    </button>
                </div>
            )}
        </motion.div>
    );
};

const OrderManager: React.FC = () => {
    const [bookings, setBookings] = useState<DibsBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await supabaseService.dibs.getOperatorBookings('op1');
            setBookings(data || []);
        } catch (e) {
            console.error("Failed to fetch bookings", e);
        } finally {
            setLoading(false);
        }
    };

    const [showBlockModal, setShowBlockModal] = useState(false);
    const [myItems, setMyItems] = useState<DibsItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [blockQty, setBlockQty] = useState(1);
    const [blockNotes, setBlockNotes] = useState('');
    const [blocking, setBlocking] = useState(false);

    const fetchMyItems = async () => {
        try {
            const { data: { user } } = await supabaseService.auth.getUser();
            if (user) {
                const items = await supabaseService.dibs.getItems(user.id);
                setMyItems(items || []);
                if (items && items.length > 0) setSelectedItem(items[0].id);
            }
        } catch (e) { console.error(e); }
    };

    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedSlots, setSelectedSlots] = useState<{ date: string, time: string }[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [viewYear, setViewYear] = useState(new Date().getFullYear());

    const generateDynamicSlots = (start: string = '09:00', end: string = '21:00', duration: number = 60) => {
        const slots: string[] = [];
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        let current = new Date();
        current.setHours(startH, startM, 0, 0);
        const endDay = new Date(current);
        if (endH < startH || (endH === startH && endM <= startM)) endDay.setDate(endDay.getDate() + 1);
        endDay.setHours(endH, endM, 0, 0);
        while (current < endDay) {
            slots.push(current.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
            current.setMinutes(current.getMinutes() + duration);
        }
        return slots;
    };

    useEffect(() => {
        fetchBookings();
        fetchMyItems();
    }, []);

    const handleManualBlock = async () => {
        if (!selectedItem) return;
        setBlocking(true);
        try {
            const { data: { user } } = await supabaseService.auth.getUser();
            if (user) {
                const qty = selectedSlots.length > 0 ? selectedSlots.length : blockQty;
                await supabaseService.dibs.createManualBlock(user.id, selectedItem, qty, blockNotes, date, selectedSlots);
                await fetchBookings();
                setShowBlockModal(false);
                setBlockQty(1);
                setBlockNotes('');
                setSelectedSlots([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setBlocking(false);
        }
    };

    const renderDateTimeline = () => {
        const today = new Date();
        const dates = Array.from({ length: 5 }).map((_, i) => {
            const d = new Date();
            d.setDate(today.getDate() + i);
            return d;
        });

        return (
            <div className="flex gap-2.5 items-center pb-4 overflow-x-auto no-scrollbar scroll-smooth -mx-1 px-1">
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

    const renderTimeSlots = () => {
        const item = myItems.find(i => i.id === selectedItem);
        const slots = (item?.opening_time && item?.closing_time)
            ? generateDynamicSlots(item.opening_time, item.closing_time, item.slot_duration || 60)
            : generateDynamicSlots();

        return (
            <div className="grid grid-cols-3 gap-2 mt-2">
                {slots.map((time, idx) => {
                    // Check if this slot is actually booked in the bookings list
                    const isBooked = bookings.some(b =>
                        b.item_id === selectedItem &&
                        (b.status === 'CONFIRMED' || b.status === 'PENDING_VERIFICATION' || b.status === 'BLOCKED') &&
                        b.slot_times?.some((s: any) => s.date === date && s.time === time)
                    );

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
                            <div className={`relative z-10 ${isBooked ? 'opacity-20 ' : ''}`}>
                                {time.split(' ')[0]}
                                <span className="text-[7px] ml-0.5 opacity-50">{time.split(' ')[1]}</span>
                            </div>
                            {isBooked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <span className="text-[7px] font-black text-white/40 tracking-[0.2em] uppercase ">DIBBED</span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        const success = await supabaseService.dibs.updateBookingStatus(id, status);
        if (success) {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as any } : b));
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === 'ALL') return true;
        if (filter === 'PENDING') return b.status === 'PENDING_VERIFICATION' || b.status === 'PENDING_PAYMENT';
        return b.status === filter;
    });

    return (
        <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-xl">
                <div className="w-full md:w-auto text-center md:text-left">
                    <h3 className="text-2xl font-black text-white flex items-center justify-center md:justify-start gap-4">
                        INCOMING ORDERS
                        <span className="flex py-1 px-3 rounded-full bg-electric-teal/10 border border-electric-teal/20 text-electric-teal text-[10px] font-black uppercase tracking-widest animate-pulse">
                            Active Live
                        </span>
                    </h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">
                        {bookings.filter(b => b.status === 'PENDING_VERIFICATION').length} Pending • ₱{bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0).toLocaleString()} Total Volume
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl py-3 pl-4 pr-10 focus:border-electric-teal outline-none appearance-none hover:bg-white/10 transition-all cursor-pointer min-w-[140px]"
                        >
                            <option value="ALL" className="bg-black text-white">All Orders</option>
                            <option value="PENDING" className="bg-black text-white">Pending</option>
                            <option value="CONFIRMED" className="bg-black text-white">Confirmed</option>
                            <option value="REJECTED" className="bg-black text-white">Rejected</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                    </div>

                    <button
                        onClick={fetchBookings}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all active:scale-90"
                    >
                        <RefreshCw size={18} />
                    </button>

                    <button
                        onClick={() => setShowBlockModal(true)}
                        className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-electric-teal transition-all active:scale-95 shadow-[0_10px_20px_rgba(255,255,255,0.1)] group"
                    >
                        <Lock size={14} />
                        Block Slots
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <EKGLoader size={60} />
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] animate-pulse">Syncing Feed...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredBookings.map(booking => (
                            <OrderCard key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} />
                        ))}
                    </AnimatePresence>
                    {filteredBookings.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <Clock className="mx-auto text-gray-600 mb-4" size={48} />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No orders found</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {showBlockModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowBlockModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md relative z-10 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-electric-teal/5 blur-3xl rounded-full" />

                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">Block Slots</h3>
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Manual Inventory Override</p>
                                </div>
                                <button onClick={() => setShowBlockModal(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors border border-white/5">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6 relative z-10 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-electric-teal uppercase tracking-[0.2em] ml-1">1. Select your items</label>
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
                                        {myItems.map(item => {
                                            const isSelected = selectedItem === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setSelectedItem(item.id)}
                                                    className={`
                                                        min-w-[140px] p-5 rounded-2xl border transition-all duration-300 flex flex-col items-start gap-3 relative overflow-hidden group/item
                                                        ${isSelected
                                                            ? 'bg-electric-teal/10 border-electric-teal text-white shadow-[0_10px_30px_rgba(45,212,191,0.1)]'
                                                            : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:border-white/20'
                                                        }
                                                    `}
                                                >
                                                    <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-electric-teal text-black' : 'bg-white/5 text-gray-600 group-hover/item:text-gray-400'}`}>
                                                        <Store size={14} />
                                                    </div>
                                                    <div className="flex flex-col items-start translate-y-0.5">
                                                        <span className="text-[10px] font-black uppercase tracking-tight text-left leading-tight line-clamp-2 min-h-[2.5em]">{item.title}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-3 right-3">
                                                            <div className="w-4 h-4 rounded-full bg-electric-teal flex items-center justify-center">
                                                                <Check size={10} className="text-black stroke-[3px]" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {myItems.find(i => i.id === selectedItem)?.type === 'EVENT' ? (
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                                        <Calendar className="mx-auto mb-3 text-gray-600" size={24} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Event Item Selected</p>
                                        <p className="text-xs text-gray-400">Inventory for events is managed via ticket tiers. Manual slot blocking is disabled.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-electric-teal uppercase tracking-[0.2em] ml-1">2. Pick Date</label>
                                            {renderDateTimeline()}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-electric-teal uppercase tracking-[0.2em] ml-1">3. Time Slots</label>
                                            {renderTimeSlots()}
                                        </div>
                                    </>
                                )}

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Ref / Person</label>
                                    <input
                                        type="text"
                                        value={blockNotes}
                                        onChange={(e) => setBlockNotes(e.target.value)}
                                        placeholder="Desk Note"
                                        className="w-full h-[56px] bg-white/5 border border-white/10 rounded-2xl px-5 text-sm text-white font-bold focus:border-electric-teal outline-none transition-all"
                                    />
                                </div>

                                <button
                                    onClick={handleManualBlock}
                                    disabled={blocking || !selectedItem || selectedSlots.length === 0}
                                    className="w-full py-5 mt-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-electric-teal hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                                >
                                    {blocking ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
                                    Commit Manual Dibs
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderManager;
