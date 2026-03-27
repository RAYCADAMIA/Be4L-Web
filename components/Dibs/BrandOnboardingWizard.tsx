import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Tag, Sparkles, ChevronRight, ChevronLeft, Building2, Upload, X, ChevronDown, Pencil } from 'lucide-react';
import { GlassCard } from '../ui/AestheticComponents';
import { supabaseService } from '../../services/supabaseService';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Operator } from '../../types';
import { DIB_CATEGORIES } from './DibsFilters';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { useTheme } from '../../contexts/ThemeContext';
import OperatorCard from './OperatorCard';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

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

export const BrandOnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState<Partial<Operator>>({});
    const [error, setError] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [croppingIndex, setCroppingIndex] = useState<number | null>(null);
    const [addr1, setAddr1] = useState('');
    const [addrCity, setAddrCity] = useState('');
    const [addrState, setAddrState] = useState('');
    const [addrCountry, setAddrCountry] = useState('Philippines');
    const { theme } = useTheme();
    const isSunrise = theme === 'sunrise';

    useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));

    const CATEGORIES = DIB_CATEGORIES.filter(c => c.id !== 'All');

    useEffect(() => {
        const fetchDraft = async () => {
            if (!user) return;
            const ops = await supabaseService.dibs.getOperators();
            const myOp = ops.find(o => o.user_id === user.id);
            if (myOp) {
                setDraft({
                    ...myOp,
                    vibe_tags: myOp.vibe_tags || [],
                    gallery_images: myOp.gallery_images || []
                });

                // Parse address components from location_text if it looks like a comma-separated string
                if (myOp.location_text && myOp.location_text.includes(',')) {
                    const parts = myOp.location_text.split(',').map(s => s.trim());
                    if (parts[0]) setAddr1(parts[0]);
                    if (parts[1]) setAddrCity(parts[1]);
                    if (parts[2]) setAddrState(parts[2]);
                    if (parts[3]) setAddrCountry(parts[3]);
                } else if (myOp.location_text) {
                    setAddrCity(myOp.location_text);
                }
            }
            setLoading(false);
        };
        fetchDraft();
    }, [user]);

    const updateField = (field: keyof Operator, value: any) => {
        setDraft(prev => {
            const next = { ...prev, [field]: value };
            return next;
        });
    };

    const updateAddress = (street: string, city: string, state: string, country: string) => {
        setAddr1(street);
        setAddrCity(city);
        setAddrState(state);
        setAddrCountry(country);

        const fullAddr = [street, city, state, country].filter(Boolean).join(', ');

        setDraft(prev => ({
            ...prev,
            location_text: fullAddr
        }));
    };

    const toggleCategory = (catId: string) => {
        const currentCats = draft.categories || [];
        if (currentCats.includes(catId)) {
            const nextCats = currentCats.filter(id => id !== catId);
            setDraft(prev => ({
                ...prev,
                categories: nextCats,
                category: nextCats[0] || 'Courts'
            }));
        } else if (currentCats.length < 3) {
            const nextCats = [...currentCats, catId];
            setDraft(prev => ({
                ...prev,
                categories: nextCats,
                category: nextCats[0]
            }));
        }
    };

    const handleNext = async () => {
        if (step === 1 && !draft.business_name) return setError('Venue name is required.');
        if (step === 1 && (!draft.categories || draft.categories.length === 0)) return setError('Select at least one category.');
        if (step === 2 && !draft.location_text) return setError('Location address is required.');
        if (step === 3 && (!draft.tagline || draft.tagline.length > 100)) return setError('Valid tagline required (max 100 chars).');
        if (step === 4 && (!draft.gallery_images || draft.gallery_images.length === 0)) return setError('Upload at least 1 image.');

        setError('');
        setSaving(true);
        try {
            await supabaseService.dibs.updateOnboardingStep(draft);
            setStep(prev => prev + 1);
        } catch (err: any) {
            setError(err.message || 'Failed to save progress.');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        setError('');
        setStep(prev => Math.max(1, prev - 1));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageToCrop(reader.result as string);
            setCroppingIndex(index);
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = (_: any, pixels: any) => {
        setCroppedAreaPixels(pixels);
    };

    const applyCropAndUpload = async () => {
        if (!imageToCrop || !croppedAreaPixels || croppingIndex === null || !user) return;

        try {
            setUploadingIndex(croppingIndex);
            setCropModalOpen(false);
            setError('');

            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            if (!croppedBlob) throw new Error('Failed to crop image');

            const fileName = `brand-${user.id}-${Date.now()}-${croppingIndex}.jpg`;
            const filePath = `${fileName}`;

            let bucket = 'brand-assets';
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, croppedBlob, { contentType: 'image/jpeg' });

            if (uploadError) {
                bucket = 'avatars';
                const { error: fallbackError } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, croppedBlob, { contentType: 'image/jpeg' });

                if (fallbackError) throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            const existing = [...(draft.gallery_images || [])];
            existing[croppingIndex] = publicUrl;
            updateField('gallery_images', existing);
        } catch (err: any) {
            console.error('Upload Error:', err);
            setError('Upload failed. Please try again.');
        } finally {
            setUploadingIndex(null);
            setCroppingIndex(null);
            setImageToCrop(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleLaunch = async () => {
        setSaving(true);
        await supabaseService.dibs.updateOnboardingStep(draft);
        await supabaseService.dibs.publishBrand();
        setSaving(false);
        setStep(6);
        setTimeout(() => {
            onComplete();
            window.location.reload();
        }, 4000);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && (draft.vibe_tags?.length || 0) < 5) {
            updateField('vibe_tags', [...(draft.vibe_tags || []), tagInput.trim().toLowerCase()]);
            setTagInput('');
        }
    };

    const handleAddPresetTag = (tag: string) => {
        if ((draft.vibe_tags?.length || 0) < 5 && !draft.vibe_tags?.includes(tag)) {
            updateField('vibe_tags', [...(draft.vibe_tags || []), tag]);
        }
    };

    const handleRemoveTag = (tag: string) => {
        updateField('vibe_tags', (draft.vibe_tags || []).filter(t => t !== tag));
    };

    const handleMapsLinkChange = (link: string) => {
        updateField('google_maps_link', link);

        if (link && !draft.location_text) {
            const nameMatch = link.match(/\/(?:search|place)\/([^/@]+)/);
            if (nameMatch && nameMatch[1]) {
                const rawName = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '));
                const cleanName = rawName.split(',')[0].trim();
                if (cleanName) updateField('location_text', cleanName);
            }
        }
    };

    const removeImage = (idx: number) => {
        updateField('gallery_images', (draft.gallery_images || []).filter((_, i) => i !== idx));
    };

    if (loading) return (
        <div className="fixed inset-0 z-[300] bg-deep-black flex items-center justify-center">
            <Sparkles className="animate-pulse text-electric-teal" size={40} />
        </div>
    );

    return (
        <div className={`fixed inset-0 z-[300] flex flex-col items-center justify-center p-2 sm:p-4 ${isSunrise ? 'bg-[#FFFAF0]/80 backdrop-blur-3xl' : 'bg-deep-black'}`}>
            <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${isSunrise ? 'from-orange-500/10' : 'from-electric-teal/10'} to-transparent pointer-events-none`} />
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${isSunrise ? 'bg-orange-500/5' : 'bg-electric-teal/5'} rounded-full blur-[100px] pointer-events-none`} />

            <AnimatePresence mode="wait">
                {step === 6 ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center space-y-6 text-center z-10"
                    >
                        <div className="w-32 h-32 rounded-full bg-electric-teal/20 flex items-center justify-center shadow-[0_0_80px_rgba(45,212,191,0.4)]">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                            >
                                <Sparkles size={64} className="text-electric-teal drop-shadow-[0_0_20px_rgba(45,212,191,0.8)]" />
                            </motion.div>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric-teal to-blue-500 tracking-tighter uppercase">
                                You Are Live
                            </h1>
                            <p className="text-gray-400 text-sm uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                                The city is yours to curate. Welcome to the marketplace.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={`step-${step}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-lg z-10"
                    >
                        <div className="flex items-center justify-between mb-5 px-1">
                            <div className="flex space-x-1.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <div key={s} className={`h-1 rounded-full transition-all duration-300 ${s === step ? 'w-6 bg-electric-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]' : s < step ? 'w-3 bg-electric-teal/50' : 'w-3 bg-white/10'}`} />
                                ))}
                            </div>
                            <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">Step {step} of 5</span>
                        </div>

                        <GlassCard className={`p-5 sm:p-6 w-full border shadow-2xl relative overflow-visible ${isSunrise ? 'bg-white/95 border-orange-500/20 shadow-orange-500/5' : 'bg-zinc-950/80 border-white/10'}`}>
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${isSunrise ? 'bg-orange-500/10 text-orange-600' : 'bg-electric-teal/10 text-electric-teal'} flex items-center justify-center flex-shrink-0`}>
                                            <Building2 size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className={`text-lg font-black uppercase tracking-tight leading-tight ${isSunrise ? 'text-[#1A1A1A]' : 'text-white'}`}>Identity</h2>
                                            <p className={`text-[10px] uppercase font-bold tracking-wider ${isSunrise ? 'text-gray-500' : 'text-gray-500'}`}>Establish your brand name and category.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${isSunrise ? 'text-orange-950/60' : 'text-gray-400'}`}>Venue Name</label>
                                            <input
                                                type="text"
                                                value={draft.business_name || ''}
                                                onChange={e => updateField('business_name', e.target.value)}
                                                className={`w-full border rounded-2xl px-5 py-4 text-sm focus:outline-none transition-colors ${isSunrise ? 'bg-orange-50/50 border-orange-200 text-black focus:border-orange-500' : 'bg-black/40 border-white/10 text-white focus:border-electric-teal/50'}`}
                                                placeholder="Enter venue name"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] block ${isSunrise ? 'text-orange-950/60' : 'text-gray-500'}`}>
                                                Categories <span className="font-bold opacity-40 ml-1">(Up to 3, 1st is Primary)</span>
                                            </label>
                                            <div className="grid grid-cols-4 gap-1.5">
                                                {CATEGORIES.map(cat => {
                                                    const selectedIndex = (draft.categories || []).indexOf(cat.id);
                                                    const isSelected = selectedIndex !== -1;
                                                    const isPrimary = selectedIndex === 0;

                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => toggleCategory(cat.id)}
                                                            className={`
                                                                relative group flex flex-col items-center justify-center py-2.5 px-1 rounded-lg border transition-all duration-300 active:scale-95 overflow-hidden
                                                                ${isSelected
                                                                    ? isSunrise ? 'bg-orange-500 border-orange-500 text-white' : 'bg-electric-teal border-electric-teal text-black'
                                                                    : isSunrise ? 'bg-orange-50/50 border-orange-100 text-gray-400 hover:border-orange-300' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20 hover:bg-white/5'
                                                                }
                                                            `}
                                                        >
                                                            <span className={`text-[8px] font-black uppercase tracking-tight text-center leading-none`}>
                                                                {cat.label}
                                                            </span>
                                                            {isPrimary && (
                                                                <div className="absolute top-0 right-0 p-0.5">
                                                                    <div className={`w-1 h-1 rounded-full ${isSelected ? (isSunrise ? 'bg-white' : 'bg-black') : 'bg-transparent'}`} />
                                                                </div>
                                                            )}
                                                            {isSelected && !isPrimary && (
                                                                <div className="absolute top-0 right-0 p-0.5 opacity-50">
                                                                    <div className="text-[6px] font-bold">{selectedIndex + 1}</div>
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${isSunrise ? 'bg-orange-500/10 text-orange-600' : 'bg-electric-teal/10 text-electric-teal'} flex items-center justify-center flex-shrink-0`}>
                                            <MapPin size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className={`text-lg font-black uppercase tracking-tight leading-tight ${isSunrise ? 'text-[#1A1A1A]' : 'text-white'}`}>Signals</h2>
                                            <p className={`text-[10px] uppercase font-bold tracking-wider ${isSunrise ? 'text-gray-500' : 'text-gray-500'}`}>Map your brand on the marketplace feed.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                        <div>
                                            <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${isSunrise ? 'text-orange-950/60' : 'text-gray-400'}`}>Venue Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={draft.business_name || ''}
                                                onChange={e => updateField('business_name', e.target.value)}
                                                className={`w-full border rounded-2xl px-5 py-3 text-sm focus:outline-none transition-all ${isSunrise ? 'bg-orange-50/20 border-orange-200 text-black focus:border-orange-500' : 'bg-black/30 border-white/10 text-white focus:border-electric-teal/50'}`}
                                                placeholder="e.g. Aura Nightclub"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <label className={`text-[10px] font-bold uppercase tracking-wider block ${isSunrise ? 'text-orange-950/60' : 'text-gray-400'}`}>Street Address <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={addr1}
                                                    onChange={e => updateAddress(e.target.value, addrCity, addrState, addrCountry)}
                                                    className={`w-full border rounded-2xl px-5 py-3 text-sm focus:outline-none transition-all ${isSunrise ? 'bg-orange-50/20 border-orange-200 text-black focus:border-orange-500' : 'bg-black/30 border-white/10 text-white focus:border-electric-teal/50'}`}
                                                    placeholder="e.g. 123 Rizal St"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className={`text-[10px] font-bold uppercase tracking-wider block ${isSunrise ? 'text-orange-950/60' : 'text-gray-400'}`}>City <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    value={addrCity}
                                                    onChange={e => updateAddress(addr1, e.target.value, addrState, addrCountry)}
                                                    className={`w-full border rounded-2xl px-5 py-3 text-sm focus:outline-none transition-all ${isSunrise ? 'bg-orange-50/20 border-orange-200 text-black focus:border-orange-500' : 'bg-black/30 border-white/10 text-white focus:border-electric-teal/50'}`}
                                                    placeholder="e.g. Davao City"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2 relative">
                                                <label className={`text-[10px] font-bold uppercase tracking-wider block ${isSunrise ? 'text-orange-950/60' : 'text-gray-400'}`}>State/Province</label>
                                                <input
                                                    type="text"
                                                    value={addrState}
                                                    onChange={e => updateAddress(addr1, addrCity, e.target.value, addrCountry)}
                                                    className={`w-full border rounded-2xl px-5 py-3 text-sm focus:outline-none transition-all ${isSunrise ? 'bg-orange-50/20 border-orange-200 text-black focus:border-orange-500' : 'bg-black/30 border-white/10 text-white focus:border-electric-teal/50'}`}
                                                    placeholder="e.g. Davao del Sur"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className={`text-[10px] font-bold uppercase tracking-wider block ${isSunrise ? 'text-orange-950/60' : 'text-gray-400'}`}>Country <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <select
                                                        value={addrCountry}
                                                        onChange={e => updateAddress(addr1, addrCity, addrState, e.target.value)}
                                                        className={`w-full border rounded-2xl px-5 py-3 text-sm focus:outline-none appearance-none transition-all ${isSunrise ? 'bg-orange-50/20 border-orange-200 text-black focus:border-orange-500' : 'bg-black/30 border-white/10 text-white focus:border-electric-teal/50'}`}
                                                    >
                                                        <option>Philippines</option>
                                                        <option>United States</option>
                                                        <option>Singapore</option>
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className={`text-[9px] font-black uppercase tracking-widest ${isSunrise ? 'text-orange-900/40' : 'text-white/30'}`}>Live Map Pinning</label>
                                                <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${addrCity && addr1 ? (isSunrise ? 'bg-green-500/10 text-green-600' : 'bg-green-500/20 text-green-400') : 'bg-white/5 text-gray-500'}`}>
                                                    {addrCity && addr1 ? 'Location Linked' : 'Enter Address'}
                                                </div>
                                            </div>
                                            <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 shadow-2xl group">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${draft.business_name || ''} ${addr1} ${addrCity} ${addrCountry}`.trim())}&output=embed&z=15`}
                                                    className="w-full h-full grayscale-[20%] contrast-[110%] group-hover:grayscale-0 transition-all duration-700"
                                                />
                                                {!addrCity && !addr1 && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                                                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] flex flex-col items-center gap-2">
                                                            <MapPin size={20} className="opacity-20 animate-pulse" />
                                                            Waiting for Address Details
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${isSunrise ? 'bg-orange-500/10 text-orange-600' : 'bg-electric-teal/10 text-electric-teal'} flex items-center justify-center flex-shrink-0`}>
                                            <Sparkles size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className={`text-lg font-black uppercase tracking-tight leading-tight ${isSunrise ? 'text-[#1A1A1A]' : 'text-white'}`}>The Hook</h2>
                                            <p className={`text-[10px] uppercase font-bold tracking-wider ${isSunrise ? 'text-gray-500' : 'text-gray-500'}`}>A powerful tagline for your marketplace card.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <textarea
                                                value={draft.tagline || ''}
                                                onChange={e => updateField('tagline', e.target.value)}
                                                maxLength={100}
                                                className={`w-full border rounded-2xl px-5 py-5 text-sm focus:outline-none transition-colors resize-none h-32 ${isSunrise ? 'bg-orange-50/50 border-orange-200 text-black focus:border-orange-500' : 'bg-black/40 border-white/10 text-white focus:border-electric-teal/50'}`}
                                                placeholder="e.g. The premier underground electronic venue in the city."
                                            />
                                            <span className={`absolute bottom-5 right-5 text-[10px] font-mono ${draft.tagline?.length === 100 ? 'text-red-400' : 'text-gray-500'}`}>
                                                {draft.tagline?.length || 0}/100
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${isSunrise ? 'bg-orange-500/10 text-orange-600' : 'bg-electric-teal/10 text-electric-teal'} flex items-center justify-center flex-shrink-0`}>
                                            <Camera size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className={`text-lg font-black uppercase tracking-tight leading-tight ${isSunrise ? 'text-[#1A1A1A]' : 'text-white'}`}>Visuals</h2>
                                            <p className={`text-[10px] uppercase font-bold tracking-wider ${isSunrise ? 'text-gray-500' : 'text-gray-500'}`}>Upload at least 1 image to showcase on your card</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-2">
                                            {[0, 1, 2].map((idx) => {
                                                const imgUrl = draft.gallery_images?.[idx];
                                                return (
                                                    <div key={idx} className={`aspect-[4/5] rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group transition-all ${imgUrl ? (isSunrise ? 'border-orange-500' : 'border-electric-teal') : (isSunrise ? 'border-orange-200 hover:bg-orange-50/30' : 'border-white/10 hover:bg-white/5')}`}>
                                                        {imgUrl ? (
                                                            <>
                                                                <img src={imgUrl} alt="Gallery" className="w-full h-full object-cover" />
                                                                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => {
                                                                            setImageToCrop(imgUrl);
                                                                            setCroppingIndex(idx);
                                                                            setCropModalOpen(true);
                                                                        }}
                                                                        className="p-1.5 bg-black/60 rounded-full text-white backdrop-blur-md hover:bg-electric-teal/50 transition-colors"
                                                                    >
                                                                        <Pencil size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateField('gallery_images', (draft.gallery_images || []).filter((_, i) => i !== idx))}
                                                                        className="p-1.5 bg-black/60 rounded-full text-white backdrop-blur-md hover:bg-red-500/50 transition-colors"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setUploadingIndex(idx);
                                                                    fileInputRef.current?.click();
                                                                }}
                                                                disabled={uploadingIndex !== null}
                                                                className={`w-full h-full flex flex-col items-center justify-center transition-colors gap-2 ${isSunrise ? 'text-orange-950/40' : 'text-gray-500'}`}
                                                            >
                                                                {uploadingIndex === idx ? (
                                                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <Upload size={20} />
                                                                )}
                                                                <span className="text-[9px] font-bold uppercase tracking-wider">
                                                                    {uploadingIndex === idx ? 'Uploading...' : 'Upload'}
                                                                </span>
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-center flex-col items-center gap-2">
                                            <p className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 bg-white/5 rounded-full ${isSunrise ? 'text-orange-600/60' : 'text-white/20'}`}>
                                                Recommended Format: 4:5 Portrait
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 border-b pb-3 mb-2 justify-center">
                                        <div className={`w-8 h-8 rounded-lg ${isSunrise ? 'bg-orange-500/10 text-orange-600' : 'bg-electric-teal/10 text-electric-teal'} flex items-center justify-center flex-shrink-0`}>
                                            <Sparkles size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className={`text-lg font-black uppercase tracking-tight leading-tight ${isSunrise ? 'text-[#1A1A1A]' : 'text-white'}`}>Card Performance</h2>
                                            <p className={`text-[10px] uppercase font-bold tracking-wider ${isSunrise ? 'text-gray-500' : 'text-gray-500'}`}>This is how you appear on the marketplace feed.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="pt-2">
                                            <label className={`text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isSunrise ? 'text-orange-950/60' : 'text-gray-400'}`}><Tag size={12} /> Vibe Tags (Max 5)</label>

                                            <div className="flex gap-2 mb-4">
                                                <input
                                                    type="text"
                                                    value={tagInput}
                                                    onChange={e => setTagInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                                    disabled={(draft.vibe_tags?.length || 0) >= 5}
                                                    className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors disabled:opacity-50 ${isSunrise ? 'bg-orange-50/50 border-orange-200 text-black focus:border-orange-500' : 'bg-black/40 border-white/10 text-white focus:border-electric-teal/50'}`}
                                                    placeholder="Add custom tag..."
                                                />
                                                <button
                                                    onClick={handleAddTag}
                                                    disabled={(draft.vibe_tags?.length || 0) >= 5 || !tagInput.trim()}
                                                    className={`px-6 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${isSunrise ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                                >
                                                    Add
                                                </button>
                                            </div>

                                            <div className="flex gap-2 mb-4 flex-wrap">
                                                {(draft.vibe_tags || []).filter(t => !PRESET_TAGS[draft.category || 'Courts']?.includes(t)).map(tag => (
                                                    <span key={tag} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border ${isSunrise ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' : 'bg-white/10 border-white/10 text-white'}`}>
                                                        {tag}
                                                        <button onClick={() => updateField('vibe_tags', (draft.vibe_tags || []).filter(t => t !== tag))} className="hover:text-red-400 ml-1"><X size={12} /></button>
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                                {PRESET_TAGS[draft.category || 'Courts']?.map(tag => {
                                                    const isSelected = draft.vibe_tags?.includes(tag);
                                                    return (
                                                        <button
                                                            key={tag}
                                                            onClick={() => isSelected ? updateField('vibe_tags', (draft.vibe_tags || []).filter(t => t !== tag)) : handleAddPresetTag(tag)}
                                                            disabled={!isSelected && (draft.vibe_tags?.length || 0) >= 5}
                                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected
                                                                ? isSunrise ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-electric-teal border-electric-teal text-black shadow-[0_0_15px_rgba(45,212,191,0.3)]'
                                                                : isSunrise ? 'bg-orange-50/30 border-orange-200/50 text-gray-500 hover:border-orange-500 hover:text-orange-600' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'
                                                                }`}
                                                        >
                                                            {tag}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center py-2">
                                        <div className="w-full max-w-[280px] scale-90 sm:scale-100 transition-transform origin-center">
                                            <OperatorCard
                                                operator={{
                                                    user_id: user?.id || '',
                                                    business_name: draft.business_name || 'Your Brand',
                                                    slug: draft.slug || 'preview',
                                                    bio: draft.bio || '',
                                                    category: draft.category || 'Courts',
                                                    cover_photo_url: draft.gallery_images?.[0] || '',
                                                    logo_url: user?.avatar_url || '',
                                                    location_text: `${draft.business_name || 'Your Brand'}, ${addrCity || 'Davao City'}`,
                                                    is_verified: true,
                                                    tagline: draft.tagline,
                                                    vibe_tags: draft.vibe_tags,
                                                    gallery_images: draft.gallery_images,
                                                    google_maps_link: draft.google_maps_link,
                                                    followers_count: 0
                                                } as Operator}
                                                onClick={() => { }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleLaunch}
                                            disabled={saving}
                                            className={`w-full h-14 rounded-2xl font-black tracking-[0.2em] text-sm uppercase transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group shadow-xl ${isSunrise ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20' : 'bg-white text-black hover:bg-gray-100 shadow-white/10'}`}
                                        >
                                            PUSH TO LIVE <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>

                                        <button
                                            onClick={handleBack}
                                            disabled={saving}
                                            className={`w-full py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-30 ${isSunrise ? 'text-orange-950/40 hover:text-orange-600' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            Back to editor
                                        </button>
                                    </div>
                                    <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest">
                                        By launching, you agree to curator guidelines.
                                    </p>
                                </div>
                            )}

                        </GlassCard>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-4 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl text-center shadow-xl border border-white/10"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {step < 5 && (
                            <div className={`mt-8 pt-6 border-t flex items-center justify-between ${isSunrise ? 'border-orange-500/10' : 'border-white/10'}`}>
                                <button
                                    onClick={handleBack}
                                    disabled={step === 1 || saving}
                                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider disabled:opacity-30 transition-colors ${isSunrise ? 'text-orange-950/40 hover:text-orange-600' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Back
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={saving}
                                    className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${isSunrise ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20' : 'bg-electric-teal text-black hover:bg-teal-400 shadow-lg shadow-electric-teal/20'}`}
                                >
                                    {step === 4 ? (saving ? 'Saving...' : 'Review') : (saving ? 'Saving...' : 'Next')} <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                    if (uploadingIndex !== null) {
                        handleFileSelect(e, uploadingIndex);
                    }
                }}
            />

            <AnimatePresence>
                {cropModalOpen && imageToCrop && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                    >
                        <div className="relative w-full max-w-sm aspect-[4/5] bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 5}
                                onCropChange={setCrop}
                                onCropComplete={handleCropComplete}
                                onZoomChange={setZoom}
                                showGrid={false}
                            />
                        </div>

                        <div className="w-full max-w-xs mt-12 space-y-8 flex flex-col items-center">
                            <div className="w-full space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block text-center">Zoom & Position</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-electric-teal"
                                />
                            </div>

                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => {
                                        setCropModalOpen(false);
                                        setUploadingIndex(null);
                                        setCroppingIndex(null);
                                    }}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all font-fui"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyCropAndUpload}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-electric-teal text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all font-fui"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BrandOnboardingWizard;
