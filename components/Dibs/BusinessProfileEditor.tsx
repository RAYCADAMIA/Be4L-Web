import React, { useState, useRef } from 'react';
import { Camera, MapPin, Clock, Save, Globe, Phone, Mail, Instagram, Facebook, X, Tag, Plus, Trash2, Image as ImageIcon, ChevronDown, CheckCircle2 } from 'lucide-react';
import { GradientButton } from '../ui/AestheticComponents';
import MapPicker from '../MapPicker';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { DIB_CATEGORIES } from './DibsFilters';

interface BusinessProfileEditorProps {
    operator: any;
    onSave: (data: any) => void;
}

const PRESET_TAGS: Record<string, string[]> = {
    'Courts': ['Pro Courts', 'Aircon', '24Hrs', 'Parking', 'Restroom', 'Indoor', 'Outdoor', 'Showers', 'Scoreboard'],
    'Events': ['Rave', 'Intimate', 'Ticketed', 'Alcohol', 'Food', 'Outdoor', 'Live Music', 'DJ'],
    'Rental': ['Equipment', 'Vehicles', 'Gear', 'Studio', 'Hourly', 'Daily', 'Insurance Included'],
    'Services': ['Home Service', '24Hrs', 'Professional', 'Certified', 'Booking Required'],
    'Resto': ['Fine Dining', 'Casual', 'Outdoor', 'Wine', 'Vegan', 'Pet Friendly'],
    'Cafe': ['Free Wifi', 'Work Friendly', 'Quiet', 'Specialty Coffee', 'Pastries'],
    'Vacation': ['Pool', 'Beach', 'Breakfast', 'AC', 'Ocean View'],
    'Hotels': ['Pool', 'Gym', 'Spa', 'AC', 'Room Service'],
};

const BusinessProfileEditor: React.FC<BusinessProfileEditorProps> = ({ operator, onSave }) => {
    const [formData, setFormData] = useState({
        business_name: operator.business_name || 'My Venue',
        tagline: operator.tagline || '',
        category: operator.category || 'Courts',
        vibe_tags: operator.vibe_tags || [],
        gallery_images: operator.gallery_images || [],
        location: operator.location || 'Davao City',
        google_maps_link: operator.google_maps_link || '',
        contact_number: operator.contact_number || '',
        email: operator.email || '',
        instagram: operator.instagram || '',
        facebook: operator.facebook || '',
        operating_hours: operator.operating_hours || '10:00 AM - 10:00 PM',
        website: operator.website || '',
        lat: operator.lat,
        lng: operator.lng
    });

    const [showMap, setShowMap] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));

    const CATEGORIES = DIB_CATEGORIES.filter(c => c.id !== 'All');

    const handleAddTag = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return;
        if (e) e.preventDefault();
        const t = tagInput.trim();
        if (t && formData.vibe_tags.length < 5 && !formData.vibe_tags.includes(t)) {
            setFormData(prev => ({ ...prev, vibe_tags: [...prev.vibe_tags, t] }));
            setTagInput('');
        }
    };

    const handleAddPresetTag = (tag: string) => {
        if (formData.vibe_tags.length < 5 && !formData.vibe_tags.includes(tag)) {
            setFormData(prev => ({ ...prev, vibe_tags: [...prev.vibe_tags, tag] }));
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({ ...prev, vibe_tags: prev.vibe_tags.filter((t: string) => t !== tag) }));
    };

    const handleMockUpload = () => {
        if (formData.gallery_images.length >= 3) return;
        const newUrl = `https://source.unsplash.com/random/800x800?vibe=${Date.now()}`;
        setFormData(prev => ({ ...prev, gallery_images: [...prev.gallery_images, newUrl] }));
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({ ...prev, gallery_images: prev.gallery_images.filter((_: any, i: number) => i !== index) }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // Mock Save
        onSave(formData);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h3 className="text-xl font-black text-white">BRAND PROFILE</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Manage your public presence</p>
            </div>

            {/* Gallery Images */}
            <div className="space-y-4 bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon size={16} className="text-electric-teal" /> Brand Visuals (Gallery)
                </h4>
                <p className="text-xs text-white/40">Upload up to 3 high-quality images. These will slide on your Dibs card.</p>

                <div className="grid grid-cols-3 gap-4">
                    {formData.gallery_images.map((img: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                            <img src={img} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleRemoveImage(idx)} className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {formData.gallery_images.length < 3 && (
                        <button onClick={handleMockUpload} className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-electric-teal/50 hover:bg-electric-teal/5 transition-all flex flex-col items-center justify-center gap-2 text-white/40 hover:text-electric-teal group">
                            <Camera size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Add Image</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4 bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe size={16} className="text-electric-teal" /> Basic Details
                </h4>

                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Business Name</label>
                        <input name="business_name" value={formData.business_name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-electric-teal outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 flex justify-between">
                            <span>Tagline (The Hook)</span>
                            <span className={formData.tagline.length > 100 ? 'text-red-400' : 'text-gray-500'}>
                                {formData.tagline.length}/100
                            </span>
                        </label>
                        <input name="tagline" value={formData.tagline} onChange={handleChange} maxLength={100} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-electric-teal outline-none" />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-1 pt-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Business Category</label>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`
                                    w-full bg-white/5 border transition-all duration-300 rounded-xl px-4 py-3 text-white text-left focus:outline-none flex items-center justify-between group
                                    ${isDropdownOpen ? 'border-electric-teal/50' : 'border-white/10 hover:border-white/20'}
                                `}
                            >
                                <span className="text-sm font-bold">
                                    {CATEGORIES.find(c => c.id === formData.category)?.label || 'Select Category'}
                                </span>
                                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 text-electric-teal' : 'rotate-0'}`} />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden z-[400] shadow-2xl p-1"
                                    >
                                        <div className="max-h-60 overflow-y-auto no-scrollbar">
                                            {CATEGORIES.map(cat => {
                                                const isActive = formData.category === cat.id;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, category: cat.id }));
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className={`
                                                            w-full px-4 py-2.5 text-left rounded-xl transition-all duration-200 group/item flex items-center justify-between
                                                            ${isActive ? 'bg-electric-teal text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                                                        `}
                                                    >
                                                        <span className="text-xs font-bold uppercase tracking-widest">
                                                            {cat.label}
                                                        </span>
                                                        {isActive && <CheckCircle2 size={12} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Vibe Tags */}
                    <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest flex items-center justify-between">
                            <span className="flex items-center gap-2"><Tag size={12} className="text-electric-teal" /> Vibe Tags (Max 5)</span>
                            <span>{formData.vibe_tags.length}/5</span>
                        </label>
                        {/* Preset Tags based on Category */}
                        <div className="flex flex-wrap gap-2 py-2">
                            {PRESET_TAGS[formData.category || 'Courts']?.map(tag => {
                                const isSelected = formData.vibe_tags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => isSelected ? handleRemoveTag(tag) : handleAddPresetTag(tag)}
                                        disabled={!isSelected && formData.vibe_tags.length >= 5}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected
                                            ? 'bg-electric-teal border-electric-teal text-black'
                                            : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-2 gap-2 focus-within:border-electric-teal/50 transition-colors">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                disabled={formData.vibe_tags.length >= 5}
                                placeholder={formData.vibe_tags.length >= 5 ? "Limit reached" : "Add custom tag..."}
                                className="flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/20 outline-none min-w-0"
                            />
                            <button
                                onClick={() => handleAddTag()}
                                disabled={!tagInput.trim() || formData.vibe_tags.length >= 5}
                                className="w-10 h-10 shrink-0 bg-white/5 hover:bg-electric-teal hover:text-black disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-white rounded-xl flex items-center justify-center transition-colors text-white"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <AnimatePresence>
                                {formData.vibe_tags.filter(t => !PRESET_TAGS[formData.category || 'Courts']?.includes(t)).map((tag: string) => (
                                    <motion.div
                                        key={tag}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="group flex items-center gap-2 px-3 py-1.5 bg-electric-teal/10 border border-electric-teal/30 rounded-xl text-xs font-bold text-electric-teal"
                                    >
                                        <span>{tag}</span>
                                        <button onClick={() => handleRemoveTag(tag)} className="opacity-50 hover:opacity-100 hover:text-white transition-opacity">
                                            <X size={12} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location & Maps */}
            <div className="space-y-4 bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin size={16} className="text-pink-500" /> Location Setup
                </h4>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 px-1">Display Address</label>
                        <div className="relative group">
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 pr-14 text-sm text-white focus:border-electric-teal outline-none transition-all"
                                placeholder="Business Address..."
                            />
                            <button
                                onClick={() => setShowMap(true)}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${formData.lat ? 'bg-electric-teal text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                title="Pin on Map"
                            >
                                <MapPin size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500 px-1">Google Maps Address Link</label>
                        <input
                            name="google_maps_link"
                            value={formData.google_maps_link}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:border-electric-teal outline-none transition-all"
                            placeholder="https://maps.google.com/..."
                        />
                    </div>

                    {showMap && (
                        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                                onClick={() => setShowMap(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative w-full max-w-2xl h-[500px] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden"
                            >
                                <div className="absolute top-4 right-4 z-[160]">
                                    <button onClick={() => setShowMap(false)} className="p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <MapPicker
                                    initialCoords={formData.lat ? { latitude: formData.lat, longitude: formData.lng! } : undefined}
                                    onSelect={(coords, addr) => {
                                        setFormData({ ...formData, location: addr, lat: coords.latitude, lng: coords.longitude });
                                        setShowMap(false);
                                    }}
                                    onClose={() => setShowMap(false)}
                                />
                            </motion.div>
                        </div>
                    )}

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">
                            {formData.lat ? `Precise location pinned at ${formData.lat.toFixed(4)}, ${formData.lng?.toFixed(4)}` : "No precise location set. Pin your location to help users find you better."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact & Hours */}
            <div className="space-y-4 bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock size={16} className="text-yellow-500" /> Operaions
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Operating Hours</label>
                        <input name="operating_hours" value={formData.operating_hours} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-electric-teal outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Contact Number</label>
                        <input name="contact_number" value={formData.contact_number} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-electric-teal outline-none" />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <GradientButton onClick={handleSave} icon={<Save size={16} />}>
                    Save Changes
                </GradientButton>
            </div>
        </div>
    );
};

export default BusinessProfileEditor;
