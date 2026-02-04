import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Clock, Calendar, Check, X, Shield, Star, DollarSign, Eye, EyeOff } from 'lucide-react';
import { DibsItem } from '../../types';

// Mock data integration or moved from BookScreen
export const MOCK_ITEMS: DibsItem[] = [
    {
        id: 'court1',
        operator_id: 'op1',
        title: 'Court 1 (Pro)',
        description: 'Professional grade court with AC',
        price: 350,
        category: 'venue',
        image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
        unit_label: 'hour',
        total_slots: 24,
        available_slots: 12,
        is_active: true
    },
    {
        id: 'event1',
        operator_id: 'op1',
        title: 'VIP Pass',
        description: 'Access to VIP lounge and free drinks',
        price: 2500,
        category: 'event',
        image_url: 'https://images.unsplash.com/photo-1561002417-195a3b7d1884',
        unit_label: 'ticket',
        total_slots: 50,
        available_slots: 45,
        is_active: true
    }
];

interface AdaptiveMenuEditorProps {
    operatorType: 'venue' | 'event';
}

const AdaptiveMenuEditor: React.FC<AdaptiveMenuEditorProps> = ({ operatorType }) => {
    const [items, setItems] = useState<DibsItem[]>(MOCK_ITEMS.filter(i => i.category === operatorType));
    const [editingItem, setEditingItem] = useState<DibsItem | null>(null);

    // Mock Slot Management for Venues
    const [blockedSlots, setBlockedSlots] = useState<string[]>(['16:00', '17:00']);

    const toggleSlot = (time: string) => {
        if (blockedSlots.includes(time)) {
            setBlockedSlots(prev => prev.filter(t => t !== time));
        } else {
            setBlockedSlots(prev => [...prev, time]);
        }
    };

    const toggleActive = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setItems(prev => prev.map(item => item.id === id ? { ...item, is_active: !item.is_active } : item));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black italic text-white">
                        {operatorType === 'venue' ? 'VENUE MANAGEMENT' : 'EVENT TICKETS'}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                        {operatorType === 'venue' ? 'Manage courts & availability' : 'Manage ticket tiers & quantity'}
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-electric-teal text-black px-4 py-2 rounded-xl font-bold text-xs uppercase hover:scale-105 transition-transform">
                    <Plus size={16} /> Add {operatorType === 'venue' ? 'Court' : 'Tier'}
                </button>
            </div>

            {/* Grid of Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <motion.div
                        layout
                        key={item.id}
                        className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden group hover:border-electric-teal/50 transition-colors"
                    >
                        <div className="relative h-40">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={(e) => toggleActive(item.id, e)}
                                    className={`p-2 rounded-full hover:scale-110 transition-transform ${item.is_active ? 'bg-yellow-500 text-black' : 'bg-electric-teal text-black'}`}
                                    title={item.is_active ? "Unlist Item" : "List Item"}
                                >
                                    {item.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-bold">
                                ₱{item.price}/{item.unit_label}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-bold ${item.is_active ? 'text-white' : 'text-gray-500 line-through decoration-gray-600'}`}>
                                    {item.title}
                                </h4>
                                <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-electric-teal shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'bg-gray-600'}`} />
                            </div>
                            <p className="text-gray-500 text-xs mb-3 line-clamp-2">{item.description}</p>

                            {/* Detailed Stats */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                <div className="bg-white/5 p-2 rounded-lg text-center">
                                    <span className="block text-white text-lg">{item.available_slots}</span>
                                    Available
                                </div>
                                <div className="bg-white/5 p-2 rounded-lg text-center">
                                    <span className="block text-white text-lg">{item.total_slots}</span>
                                    Total
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Edit {editingItem.title}</h3>
                                <button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                                {/* Common Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Name</label>
                                        <input defaultValue={editingItem.title} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-electric-teal outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Price (PHP)</label>
                                        <div className="relative">
                                            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input type="number" defaultValue={editingItem.price} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-8 text-white focus:border-electric-teal outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Description</label>
                                    <textarea defaultValue={editingItem.description} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-electric-teal outline-none resize-none h-24" />
                                </div>

                                {/* VENUE SPECIFIC: Availability Grid */}
                                {operatorType === 'venue' && (
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                <Clock size={16} className="text-electric-teal" /> Availability Blocks
                                            </h4>
                                            <span className="text-[10px] text-gray-500">Tap to block/unblock hours</span>
                                        </div>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                            {Array.from({ length: 12 }).map((_, i) => {
                                                const hour = i + 10; // Start at 10 AM
                                                const time = `${hour}:00`;
                                                const isBlocked = blockedSlots.includes(time);
                                                return (
                                                    <button
                                                        key={time}
                                                        onClick={() => toggleSlot(time)}
                                                        className={`p-2 rounded-lg text-xs font-bold border transition-all ${isBlocked
                                                            ? 'bg-red-500/10 border-red-500/30 text-red-500'
                                                            : 'bg-white/5 border-white/10 text-white hover:border-electric-teal'
                                                            }`}
                                                    >
                                                        {time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {operatorType === 'event' && (
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                <Calendar size={16} className="text-electric-teal" /> Event Details
                                            </h4>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Event Date</label>
                                            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-electric-teal outline-none" />
                                        </div>

                                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mt-4">
                                            <Star size={16} className="text-electric-teal" /> Ticket Tiers
                                        </h4>
                                        <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                                                    <Shield size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-white text-xs font-bold">VIP Access</p>
                                                    <p className="text-gray-500 text-[10px]">50 pax capacity</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-electric-teal text-sm font-bold">₱2,500</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="flex-1 py-3 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 py-3 rounded-xl font-bold bg-electric-teal text-black hover:opacity-90 transition-opacity">
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdaptiveMenuEditor;
