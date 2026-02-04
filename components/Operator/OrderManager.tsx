import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, CheckCircle, XCircle, Eye,
    ArrowLeft, Filter, Search, Download,
    ExternalLink, AlertCircle
} from 'lucide-react';

const OrderManager: React.FC = () => {
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

    const MOCK_BOOKINGS = [
        { id: 'bk-1', user: 'Alex Reyes (@alexr)', item: 'Court Rental', amount: 200, status: 'PENDING_VERIFICATION', date: '2024-01-20', time: '2h ago', proof: 'https://images.unsplash.com/photo-1554224155-1696413575b9?auto=format&fit=crop&q=80&w=400' },
        { id: 'bk-2', user: 'Sofia Lim (@soflim)', item: 'Racket Rental', amount: 50, status: 'PENDING_VERIFICATION', date: '2024-01-20', time: '5h ago', proof: 'https://images.unsplash.com/photo-1554224155-1696413575b9?auto=format&fit=crop&q=80&w=400' },
        { id: 'bk-3', user: 'Mark Tan (@mtan)', item: 'Court Rental', amount: 400, status: 'CONFIRMED', date: '2024-01-19', time: '1d ago', proof: 'https://images.unsplash.com/photo-1554224155-1696413575b9?auto=format&fit=crop&q=80&w=400' },
    ];

    return (
        <div className="flex-1 h-full overflow-y-auto bg-deep-black p-6 no-scrollbar space-y-6 pb-32">
            {/* Header */}
            <div>
                <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Logistics</h2>
                <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Order Manager</h1>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4">
                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center px-4 h-12">
                    <Search size={18} className="text-gray-500 mr-3" />
                    <input type="text" placeholder="SEARCH ORDERS..." className="bg-transparent w-full text-xs font-bold uppercase tracking-widest text-white outline-none placeholder-gray-700" />
                </div>
                <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white">
                    <Filter size={20} />
                </button>
            </div>

            {/* Bookings List */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01]">
                            <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Customer</th>
                            <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">Item / Service</th>
                            <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Amount</th>
                            <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                            <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        {MOCK_BOOKINGS.map(bk => (
                            <tr key={bk.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white text-xs">{bk.user}</div>
                                    <div className="text-[10px] text-gray-600">{bk.time}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-gray-300 font-medium">{bk.item}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="text-xs font-black text-white">₱{bk.amount}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${bk.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                                        }`}>
                                        {bk.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedBooking(bk)}
                                        className="p-2.5 bg-white/5 rounded-xl text-gray-400 hover:text-primary transition-colors"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Verification Drawer / Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setSelectedBooking(null)}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg h-full bg-[#111] border-l border-white/10 shadow-3xl p-8 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <button onClick={() => setSelectedBooking(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                                    <ArrowLeft size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Back to List</span>
                                </button>
                                <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Order Verification</span>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
                                <div className="space-y-1">
                                    <div className="text-3xl font-black italic text-white uppercase tracking-tighter">Verification Needed</div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">Order ID: {selectedBooking.id}</p>
                                </div>

                                {/* Proof Preview */}
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Payment Proof (GCash Screenshot)</label>
                                    <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 bg-black relative group">
                                        <img src={selectedBooking.proof} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white">
                                                <ExternalLink size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-[10px] font-bold uppercase">Customer</span>
                                        <span className="text-white text-xs font-bold">{selectedBooking.user}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-[10px] font-bold uppercase">Total Amount</span>
                                        <span className="text-primary text-lg font-black italic tracking-tighter">₱{selectedBooking.amount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-8 grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle size={16} /> Reject Proof
                                </button>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="py-4 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={16} /> Confirm Receipt
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
