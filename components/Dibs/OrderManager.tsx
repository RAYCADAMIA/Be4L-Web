
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, X, Clock, ExternalLink, RefreshCw, Filter, AlertCircle, MessageCircle } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { DibsBooking } from '../../types';
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
                bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col gap-4
                ${isPending ? 'border-electric-teal/30 shadow-[0_0_15px_rgba(45,212,191,0.05)]' : 'opacity-80'}
            `}
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-yellow-500 animate-pulse' : booking.status === 'CONFIRMED' ? 'bg-electric-teal' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{booking.status.replace('_', ' ')}</span>
                    </div>
                    <h4 className="font-bold text-white text-lg">{booking.item?.title || booking.item_id || 'Unknown Item'}</h4>
                    <p className="text-xs text-gray-500">Qty: {booking.quantity} • Total: ₱{booking.total_amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-mono text-gray-600 uppercase mb-1">Order ID</p>
                    <p className="text-xs font-mono text-gray-400 truncate w-20">{booking.id.substring(0, 8).toUpperCase()}</p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-xs font-bold text-white border border-white/10">
                    {booking.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-white max-w-[150px] truncate">{booking.user?.name || 'Guest User'}</p>
                    <a href={`/app/profile/${booking.user?.username}`} className="text-[10px] text-electric-teal hover:underline decoration-electric-teal/30">
                        @{booking.user?.username || 'user'}
                    </a>
                </div>
                <button
                    onClick={() => navigate('/app/chat', {
                        state: {
                            openChatId: booking.user_id,
                            openChatName: booking.user?.name || 'Customer'
                        }
                    })}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                    <MessageCircle size={14} />
                </button>
            </div>

            {/* Payment Proof Preview */}
            {booking.payment_proof_url && (
                <a href={booking.payment_proof_url} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-electric-teal/50 transition-colors">
                        <img src={booking.payment_proof_url} alt="Payment Proof" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    {(booking.confidence_score || 1) < 0.5 ? (
                                        <>
                                            <AlertCircle size={14} className="text-red-500" />
                                            <p className="text-[10px] font-bold text-red-500 uppercase">Suspicious Proof</p>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={14} className="text-electric-teal" />
                                            <p className="text-[10px] font-bold text-electric-teal uppercase">System Verified</p>
                                        </>
                                    )}
                                </div>
                                {booking.confidence_score && (
                                    <p className={`text-[10px] font-mono font-black ${booking.confidence_score < 0.5 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {Math.round(booking.confidence_score * 100)}%
                                    </p>
                                )}
                            </div>
                            {booking.extracted_ref && (
                                <div className="mt-1 flex items-center gap-1.5 opacity-80">
                                    <div className="w-1 h-1 rounded-full bg-electric-teal" />
                                    <p className="text-[8px] font-mono text-white tracking-wider">Ref: {booking.extracted_ref}</p>
                                </div>
                            )}
                        </div>
                        {/* Warning Hint */}
                        {(booking.confidence_score || 1) < 0.5 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-[8px] font-black uppercase rounded shadow-lg">Review Required</div>
                        )}
                        <ExternalLink size={16} className="absolute top-3 right-3 text-white/70 group-hover:text-white transition-colors" />
                    </div>
                </a>
            )}
            {!booking.payment_proof_url && isPending && (
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-500" />
                    <p className="text-[10px] font-bold text-red-500 uppercase">No Payment Proof Yet</p>
                </div>
            )}

            {/* Actions */}
            {isPending && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                        onClick={() => handleAction('REJECTED')}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-xs uppercase hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                        <X size={14} /> Reject
                    </button>
                    <button
                        onClick={() => handleAction('CONFIRMED')}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-electric-teal text-black font-black text-xs uppercase hover:bg-electric-teal/90 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                    >
                        {isUpdating ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />} Verify Payment
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
        // Using mock operator ID 'op1' for demo
        try {
            const data = await supabaseService.dibs.getOperatorBookings('op1');
            setBookings(data || []);
        } catch (e) {
            console.error("Failed to fetch bookings", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black italic text-white flex items-center gap-2">
                        INCOMING ORDERS <div className="w-2 h-2 rounded-full bg-electric-teal animate-pulse" />
                    </h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        {bookings.length} Orders • {bookings.filter(b => b.status === 'PENDING_VERIFICATION').length} Pending • ₱{bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0).toLocaleString()} Volume
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchBookings} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <RefreshCw size={16} />
                    </button>
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white text-xs font-bold uppercase rounded-lg py-2 pl-3 pr-8 focus:outline-none appearance-none hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <option value="ALL" className="bg-black text-gray-400">All Orders</option>
                            <option value="PENDING" className="bg-black text-gray-400">Pending</option>
                            <option value="CONFIRMED" className="bg-black text-gray-400">Confirmed</option>
                            <option value="REJECTED" className="bg-black text-gray-400">Rejected</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><EKGLoader size={60} /></div>
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
        </div>
    );
};

export default OrderManager;
