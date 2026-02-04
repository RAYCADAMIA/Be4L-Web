import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Trash2, Clock, Calendar, DollarSign, MapPin, X, Check,
    Shield, Users, Camera, Edit2, Target, ChevronRight, Box,
    Store, Ticket, LayoutGrid, Info, Settings, Eye, EyeOff, Sparkles, Globe,
    Scan, Search, Filter, AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GradientButton, GlowText } from '../ui/AestheticComponents';
import { EventTier, DibsItem } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
import MapPicker from '../MapPicker';
import DibsItemCard from '../DibsItemCard';

interface NewItemForm {
    id?: string;
    title: string;
    description: string;
    price: number;
    category: string;
    type: 'PLACE' | 'EVENT';
    image_url: string;
    unit_label: string;
    event_date: string;
    event_time: string;
    event_location: string;
    event_lat?: number;
    event_lng?: number;
    tiers: EventTier[];
    opening_time: string;
    closing_time: string;
    slot_duration: number;
    amenities: string[];
    resources: { id: string; name: string }[];
    is_active: boolean;
}

const DEFAULT_FORM: NewItemForm = {
    title: '',
    description: '',
    price: 0,
    category: '',
    type: 'PLACE',
    image_url: '',
    unit_label: 'hour',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '18:00',
    event_location: '',
    event_lat: undefined,
    event_lng: undefined,
    tiers: [],
    opening_time: '06:00',
    closing_time: '23:00',
    slot_duration: 60,
    amenities: [],
    resources: [{ id: '1', name: 'Court 1' }, { id: '2', name: 'Court 2' }],
    is_active: true
};

// --- HELPER COMPONENTS ---

const StepIndicator = ({ current, total }: { current: number, total: number }) => (
    <div className="flex gap-1.5 mb-8">
        {Array.from({ length: total }).map((_, i) => (
            <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${i <= current ? 'bg-electric-teal w-8 shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'bg-white/10 w-4'}`}
            />
        ))}
    </div>
);

// --- MAIN COMPONENT ---

const InventoryManager = () => {
    const { user } = useAuth();
    const [subTab, setSubTab] = useState<'PLACES' | 'EVENTS' | 'CHECKIN'>('PLACES');
    const [searchCode, setSearchCode] = useState('');
    const [filterDay, setFilterDay] = useState<'TODAY' | 'UPCOMING' | 'PAST'>('TODAY');
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<NewItemForm>(DEFAULT_FORM);
    const [items, setItems] = useState<DibsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadItems = async () => {
        if (!user) return;
        setLoading(true);
        const data = await supabaseService.dibs.getItems(user.id);
        setItems(data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadItems();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        const combinedDate = new Date(`${formData.event_date}T${formData.event_time}:00`).toISOString();
        const payload = {
            ...formData,
            operator_id: user.id,
            event_date: combinedDate,
            available_slots: formData.resources.length,
            total_slots: formData.resources.length
        };

        if (isEditing && formData.id) {
            await supabaseService.dibs.updateItem(formData.id, payload);
        } else {
            await supabaseService.dibs.addItem(payload);
        }

        closeModal();
        loadItems();
    };

    const handleEdit = (item: any) => {
        setFormData({
            ...DEFAULT_FORM,
            ...item,
            id: item.id,
            event_date: item.event_date ? item.event_date.split('T')[0] : DEFAULT_FORM.event_date,
            event_time: item.event_date ? new Date(item.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : DEFAULT_FORM.event_time,
            is_active: item.is_active ?? true
        });
        setIsEditing(true);
        setCurrentStep(1); // Skip type selection when editing
        setShowModal(true);
    };

    const toggleStatus = async (item: DibsItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const newStatus = !item.is_active;
        await supabaseService.dibs.updateItem(item.id, { is_active: newStatus });
        loadItems();
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this listing permanently?')) {
            await supabaseService.dibs.deleteItem(id);
            loadItems();
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentStep(0);
        setFormData(DEFAULT_FORM);
    };

    const filteredItems = items.filter(i => i.type === (subTab === 'PLACES' ? 'PLACE' : 'EVENT'));

    return (
        <div className="space-y-8 pb-32">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <GlowText size="lg" className="uppercase tracking-tighter">Inventory Console</GlowText>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 ml-1 flex items-center gap-2">
                        <Settings size={12} /> Live Operations Control
                    </p>
                </div>
                <GradientButton
                    onClick={() => {
                        setIsEditing(false);
                        setFormData(DEFAULT_FORM);
                        setCurrentStep(0);
                        setShowModal(true);
                    }}
                    icon={<Plus size={16} strokeWidth={3} />}
                >
                    Create New Listing
                </GradientButton>
            </div>

            {/* Sub-Navigation */}
            <div className="flex gap-8 border-b border-white/5 relative">
                {[
                    { id: 'PLACES', label: 'Spots & Rentals', icon: Store },
                    { id: 'EVENTS', label: 'Events & Tickets', icon: Ticket },
                    { id: 'CHECKIN', label: 'Redemptions', icon: Scan }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const active = subTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id as any)}
                            className={`flex items-center gap-2.5 px-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${active ? 'text-electric-teal' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Icon size={14} />
                            {tab.label}
                            {active && (
                                <motion.div
                                    layoutId="activeSubTab"
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-electric-teal shadow-[0_0_15px_rgba(45,212,191,0.5)]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Items Grid & Check-in View */}
            <div className={`${subTab === 'CHECKIN' ? 'block' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                {subTab === 'CHECKIN' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Check-in Action Bar */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-electric-teal transition-colors">
                                        <Search size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ENTER 6-DIGIT BOOKING CODE (E.G. XJ29K0)"
                                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-lg font-black tracking-[0.2em] text-white placeholder-white/20 outline-none focus:border-electric-teal/50 transition-all uppercase"
                                        value={searchCode}
                                        onChange={(e) => setSearchCode(e.target.value)}
                                    />
                                    <button className="absolute right-3 top-3 bottom-3 px-8 bg-electric-teal text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(45,212,191,0.3)]">
                                        VERIFY
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    {['TODAY', 'UPCOMING', 'PAST'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilterDay(f as any)}
                                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterDay === f ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-zinc-600 hover:text-zinc-400'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-electric-teal/5 border border-electric-teal/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-electric-teal animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-electric-teal">Operations Summary</span>
                                    </div>
                                    <p className="text-2xl font-black text-white italic tracking-tighter uppercase">5 Reservations</p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Expected Today</p>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black text-zinc-600 uppercase">Checked In</p>
                                        <p className="text-xl font-black text-white italic">2/5</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black text-zinc-600 uppercase">Revenue</p>
                                        <p className="text-xl font-black text-electric-teal italic">₱1,450</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Feed */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="group relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 hover:bg-white/[0.04] transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            {/* Avatar/Icon */}
                                            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 overflow-hidden shrink-0">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 77}`} alt="user" className="w-full h-full object-cover" />
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-black text-white uppercase italic tracking-tight">KREEMO J.</span>
                                                    <div className="px-2 py-0.5 rounded-md bg-electric-teal text-black text-[8px] font-black uppercase tracking-tighter">PREMIUM</div>
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase">
                                                    <span className="flex items-center gap-1.5"><Clock size={12} /> 2:00 PM - 3:00 PM</span>
                                                    <span className="flex items-center gap-1.5 text-electric-teal"><Ticket size={12} /> 6-DIGIT: <span className="text-white font-mono font-black tracking-widest ml-1">XJ29K0</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-zinc-600 uppercase">Total Paid</span>
                                                <span className="text-sm font-black text-white italic">₱250.00</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="px-6 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-electric-teal transition-all">
                                                    CHECK IN
                                                </button>
                                                <button className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-500 hover:text-white transition-all">
                                                    UI Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Status Overlay */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <div className="px-2 py-1 rounded-full bg-zinc-900 border border-white/10 flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-green-500" />
                                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Receipt Verified</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
                            ))
                        ) : filteredItems.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]"
                            >
                                <div className="p-6 rounded-full bg-white/5 text-gray-700 mb-6">
                                    <LayoutGrid size={40} strokeWidth={1} />
                                </div>
                                <h3 className="text-white font-bold text-lg italic uppercase">No active listings</h3>
                                <p className="text-gray-500 text-xs mt-2 max-w-xs">Your deployments will appear here once you launch them.</p>
                            </motion.div>
                        ) : filteredItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative group"
                            >
                                <DibsItemCard
                                    item={item}
                                    onClick={() => handleEdit(item)}
                                />

                                {/* Overlay Controls */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={(e) => toggleStatus(item, e)}
                                        className={`p-2.5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl transition-all ${item.is_active ? 'bg-electric-teal text-black' : 'bg-red-500/20 text-red-500'}`}
                                        title={item.is_active ? "Unlist Item" : "Publish Item"}
                                    >
                                        {item.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="p-2.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:text-red-500 hover:bg-red-500/10 shadow-2xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Status Indicator */}
                                {!item.is_active && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center pointer-events-none">
                                        <span className="px-4 py-1.5 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic">Unlisted</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* --- CREATION MODAL --- */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#08080A]/60 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="px-8 pt-8 flex items-center justify-between z-10">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter flex items-center gap-3">
                                        <Sparkles className="text-electric-teal" size={20} />
                                        {isEditing ? 'Sync Deployment' : 'New Deployment'}
                                    </h3>
                                    <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mt-1">Stage {currentStep + 1} of 4 • Configure Mission Specs</p>
                                </div>
                                <button onClick={closeModal} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6">
                                <StepIndicator current={currentStep} total={4} />

                                <AnimatePresence mode="wait">
                                    {currentStep === 0 && (
                                        <motion.div
                                            key="step0"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="text-center mb-8">
                                                <h4 className="text-xl font-black text-white italic uppercase tracking-tight">Select Listing Architecture</h4>
                                                <p className="text-gray-500 text-xs mt-2">What kind of inventory are you deploying today?</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {[
                                                    {
                                                        type: 'PLACE',
                                                        label: 'Spot & Rental',
                                                        desc: 'Co-working spaces, courts, studios, or equipment. Hourly or daily reservations.',
                                                        icon: Store,
                                                        color: 'text-electric-teal'
                                                    },
                                                    {
                                                        type: 'EVENT',
                                                        label: 'Social & Ticketed',
                                                        desc: 'House parties, workshops, runs, or meetups. Scannable ticket tiers.',
                                                        icon: Ticket,
                                                        color: 'text-purple-400'
                                                    }
                                                ].map((t) => {
                                                    const Icon = t.icon;
                                                    const selected = formData.type === t.type;
                                                    return (
                                                        <button
                                                            key={t.type}
                                                            onClick={() => setFormData({ ...formData, type: t.type as any, unit_label: t.type === 'PLACE' ? 'hour' : 'ticket' })}
                                                            className={`p-8 rounded-[2.5rem] border text-left transition-all duration-500 group relative overflow-hidden ${selected ? 'bg-white/5 border-electric-teal' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                                                        >
                                                            <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform ${selected ? t.color : 'text-gray-500'}`}>
                                                                <Icon size={24} />
                                                            </div>
                                                            <h5 className={`text-lg font-black uppercase tracking-tight ${selected ? 'text-white' : 'text-gray-400'}`}>{t.label}</h5>
                                                            <p className="text-gray-500 text-[11px] leading-relaxed mt-2 font-medium">{t.desc}</p>

                                                            {selected && (
                                                                <div className="absolute top-6 right-6 w-6 h-6 rounded-full bg-electric-teal flex items-center justify-center text-black">
                                                                    <Check size={14} strokeWidth={4} />
                                                                </div>
                                                            )}

                                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-teal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {currentStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            {/* Branding Section */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Listing Identifier</label>
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-electric-teal transition-all placeholder-white/20"
                                                            placeholder="e.g. Neon Court Rental"
                                                            value={formData.title}
                                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Mission Category</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['Venue', 'Rental', 'Coach', 'Event', 'Social', 'Sport'].map(cat => (
                                                                <button
                                                                    key={cat}
                                                                    onClick={() => setFormData({ ...formData, category: cat })}
                                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.category === cat ? 'bg-electric-teal border-electric-teal text-black shadow-[0_0_15px_rgba(45,212,191,0.3)]' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                                                >
                                                                    {cat}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Description Brief</label>
                                                        <textarea
                                                            rows={4}
                                                            className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-electric-teal transition-all placeholder-white/20 resize-none"
                                                            placeholder="Describe the experience, perks, or rules..."
                                                            value={formData.description}
                                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Mission Poster</label>
                                                    <div
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="aspect-[4/3] rounded-[2.5rem] bg-white/[0.02] border border-white/10 border-dashed overflow-hidden relative group cursor-pointer hover:border-electric-teal/50 transition-all"
                                                    >
                                                        {formData.image_url ? (
                                                            <>
                                                                <img src={formData.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="preview" />
                                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                                    <Camera size={32} className="text-white mb-2" />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Replace Image</p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 group-hover:text-electric-teal transition-colors">
                                                                <Camera size={40} strokeWidth={1} className="mb-4" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-center">Tap to Upload Image<br /><span className="text-[8px] opacity-50 mt-1 block">Optimal Ratio 4:3</span></p>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) setFormData({ ...formData, image_url: URL.createObjectURL(file) });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            {formData.type === 'PLACE' ? (
                                                <div className="space-y-8">
                                                    {/* Units Config */}
                                                    <div className="space-y-4 p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                                                        <h5 className="text-xs font-black uppercase text-electric-teal flex items-center gap-3 tracking-[0.2em] italic">
                                                            <Box size={16} strokeWidth={3} /> Resource Configuration
                                                        </h5>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {formData.resources.map((res, idx) => (
                                                                <div key={res.id} className="relative group/res">
                                                                    <input
                                                                        type="text"
                                                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-xs font-bold text-white outline-none focus:border-electric-teal/50"
                                                                        value={res.name}
                                                                        onChange={e => {
                                                                            const newRes = [...formData.resources];
                                                                            newRes[idx].name = e.target.value;
                                                                            setFormData({ ...formData, resources: newRes });
                                                                        }}
                                                                    />
                                                                    {formData.resources.length > 1 && (
                                                                        <button
                                                                            onClick={() => setFormData({ ...formData, resources: formData.resources.filter(r => r.id !== res.id) })}
                                                                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover/res:opacity-100 transition-opacity shadow-lg"
                                                                        >
                                                                            <X size={12} strokeWidth={4} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={() => setFormData({ ...formData, resources: [...formData.resources, { id: Math.random().toString(), name: `Unit ${formData.resources.length + 1}` }] })}
                                                                className="border border-dashed border-white/20 rounded-2xl flex items-center justify-center text-gray-600 hover:text-white hover:border-white/40 transition-all py-3 gap-2 text-[10px] font-black uppercase tracking-widest"
                                                            >
                                                                <Plus size={14} /> Add Unit
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Slot Specs */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Base Price</label>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30">₱</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-3.5 text-sm font-bold text-white outline-none focus:border-electric-teal transition-all"
                                                                    value={formData.price || ''}
                                                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Unit Label</label>
                                                            <input
                                                                type="text"
                                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm font-bold text-white outline-none focus:border-electric-teal transition-all"
                                                                placeholder="e.g. hour, room"
                                                                value={formData.unit_label}
                                                                onChange={e => setFormData({ ...formData, unit_label: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Session Length</label>
                                                            <select
                                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm font-bold text-white outline-none focus:border-electric-teal transition-all appearance-none"
                                                                value={formData.slot_duration}
                                                                onChange={e => setFormData({ ...formData, slot_duration: Number(e.target.value) })}
                                                            >
                                                                <option value={30} className="bg-[#08080A]">30 Mins</option>
                                                                <option value={60} className="bg-[#08080A]">60 Mins (1h)</option>
                                                                <option value={120} className="bg-[#08080A]">120 Mins (2h)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-8">
                                                    {/* Event Tiers */}
                                                    <div className="space-y-5">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-xs font-black uppercase text-electric-teal flex items-center gap-3 tracking-[0.2em] italic">
                                                                <Ticket size={16} strokeWidth={3} /> Ticket Inventory
                                                            </h5>
                                                            <button
                                                                onClick={() => setFormData({ ...formData, tiers: [...formData.tiers, { id: Math.random().toString(), name: '', price: 0, capacity: 50, available: 50, perks: [] }] })}
                                                                className="text-[10px] font-black uppercase text-electric-teal hover:underline tracking-widest"
                                                            >
                                                                + Add Tier
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {formData.tiers.map((tier, idx) => (
                                                                <div key={tier.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-center">
                                                                    <div className="flex-1 w-full space-y-2">
                                                                        <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Tier Name</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Standard, VIP, Early Bird..."
                                                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-electric-teal/50"
                                                                            value={tier.name}
                                                                            onChange={e => {
                                                                                const newTiers = [...formData.tiers];
                                                                                newTiers[idx].name = e.target.value;
                                                                                setFormData({ ...formData, tiers: newTiers });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="w-full md:w-32 space-y-2">
                                                                        <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Price (₱)</label>
                                                                        <input
                                                                            type="number"
                                                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-electric-teal/50"
                                                                            value={tier.price || ''}
                                                                            onChange={e => {
                                                                                const newTiers = [...formData.tiers];
                                                                                newTiers[idx].price = Number(e.target.value);
                                                                                setFormData({ ...formData, tiers: newTiers });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="w-full md:w-32 space-y-2">
                                                                        <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Cap</label>
                                                                        <input
                                                                            type="number"
                                                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-electric-teal/50"
                                                                            value={tier.capacity || ''}
                                                                            onChange={e => {
                                                                                const newTiers = [...formData.tiers];
                                                                                newTiers[idx].capacity = Number(e.target.value);
                                                                                newTiers[idx].available = Number(e.target.value);
                                                                                setFormData({ ...formData, tiers: newTiers });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setFormData({ ...formData, tiers: formData.tiers.filter(t => t.id !== tier.id) })}
                                                                        className="p-3 text-gray-700 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {formData.tiers.length === 0 && (
                                                                <div className="text-center py-10 border border-dashed border-white/5 rounded-3xl">
                                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-700 italic">No tickets defined</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {currentStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Scheduling */}
                                                <div className="space-y-6">
                                                    <h5 className="text-xs font-black uppercase text-electric-teal flex items-center gap-3 tracking-[0.2em] italic mb-4">
                                                        <Clock size={16} strokeWidth={3} /> Temporal Settings
                                                    </h5>

                                                    {formData.type === 'PLACE' ? (
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Opening</label>
                                                                <input
                                                                    type="time"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none"
                                                                    value={formData.opening_time}
                                                                    onChange={e => setFormData({ ...formData, opening_time: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Closing</label>
                                                                <input
                                                                    type="time"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none"
                                                                    value={formData.closing_time}
                                                                    onChange={e => setFormData({ ...formData, closing_time: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Date</label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs font-bold text-white outline-none"
                                                                    value={formData.event_date}
                                                                    onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Commence</label>
                                                                <input
                                                                    type="time"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none"
                                                                    value={formData.event_time}
                                                                    onChange={e => setFormData({ ...formData, event_time: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                                                            <Globe size={14} /> Mission Sector (Location)
                                                        </label>
                                                        <button
                                                            onClick={() => setShowMap(!showMap)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 flex items-center justify-between group hover:bg-white/[0.08] transition-all"
                                                        >
                                                            <div className="text-left">
                                                                <p className={`text-sm font-bold truncate max-w-[200px] ${formData.event_location ? 'text-white' : 'text-gray-600'}`}>
                                                                    {formData.event_location || 'Pin global coordinates...'}
                                                                </p>
                                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Satellite Navigation Map</p>
                                                            </div>
                                                            <div className={`p-3 rounded-2xl transition-all ${showMap ? 'bg-electric-teal text-black' : 'bg-white/5 text-electric-teal group-hover:scale-110'}`}>
                                                                <MapPin size={18} strokeWidth={3} />
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Map Area */}
                                                <div className="h-full min-h-[300px] rounded-[3rem] overflow-hidden border border-white/10 relative bg-black/40">
                                                    <AnimatePresence mode="wait">
                                                        {showMap ? (
                                                            <motion.div
                                                                key="map"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="absolute inset-0 z-20"
                                                            >
                                                                <MapPicker
                                                                    initialCoords={formData.event_lat ? { latitude: formData.event_lat, longitude: formData.event_lng! } : undefined}
                                                                    onSelect={(coords, addr) => {
                                                                        setFormData({ ...formData, event_location: addr, event_lat: coords.latitude, event_lng: coords.longitude });
                                                                        setShowMap(false);
                                                                    }}
                                                                    onClose={() => setShowMap(false)}
                                                                />
                                                            </motion.div>
                                                        ) : (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white/5 to-transparent">
                                                                <div className="p-6 rounded-full bg-white/5 text-gray-700 mb-6">
                                                                    <MapPin size={32} />
                                                                </div>
                                                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Map Preview Inactive</p>
                                                                <p className="text-gray-600 text-[9px] mt-2">Activate Satellite Navigation to pin your sector.</p>
                                                            </div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-between z-10">
                                <button
                                    onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : closeModal()}
                                    className="px-8 py-3 rounded-full text-[11px] font-black uppercase text-gray-500 hover:text-white transition-all tracking-widest"
                                >
                                    {currentStep === 0 ? 'Abort' : 'Back'}
                                </button>

                                <div className="flex items-center gap-4">
                                    {currentStep < 3 ? (
                                        <GradientButton
                                            onClick={() => setCurrentStep(currentStep + 1)}
                                            icon={<ChevronRight size={16} />}
                                            disabled={currentStep === 1 && (!formData.title || !formData.category)}
                                        >
                                            Continue
                                        </GradientButton>
                                    ) : (
                                        <GradientButton
                                            onClick={handleSave}
                                            icon={<Check size={16} strokeWidth={3} />}
                                        >
                                            {isEditing ? 'Sync Changes' : 'Confirm Launch'}
                                        </GradientButton>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryManager;
