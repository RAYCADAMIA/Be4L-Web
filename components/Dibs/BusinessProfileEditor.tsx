import React, { useState } from 'react';
import { Camera, MapPin, Clock, Save, Globe, Phone, Mail, Instagram, Facebook, X } from 'lucide-react';
import { GradientButton } from '../ui/AestheticComponents';
import MapPicker from '../MapPicker';
import { AnimatePresence, motion } from 'framer-motion';

interface BusinessProfileEditorProps {
    operator: any;
    onSave: (data: any) => void;
}

const BusinessProfileEditor: React.FC<BusinessProfileEditorProps> = ({ operator, onSave }) => {
    const [formData, setFormData] = useState({
        business_name: operator.business_name || 'My Venue',
        bio: operator.bio || 'Welcome to our space.',
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

            {/* Assets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Profile Picture</label>
                    <div className="bg-white/5 border border-white/10 rounded-2xl h-48 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera className="text-white" size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400">Upload Logo</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Cover Photo</label>
                    <div className="bg-white/5 border border-white/10 rounded-2xl h-48 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
                        <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                            <Camera className="text-white" size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 relative z-10">Upload Cover</span>
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe size={16} className="text-electric-teal" /> Basic Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Business Name</label>
                        <input name="business_name" value={formData.business_name} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-electric-teal outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Tagline / Bio</label>
                        <input name="bio" value={formData.bio} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-electric-teal outline-none" />
                    </div>
                </div>
            </div>

            {/* Location & Maps */}
            <div className="space-y-4 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
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
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3.5 pr-14 text-sm text-white focus:border-electric-teal outline-none transition-all"
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
            <div className="space-y-4 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock size={16} className="text-yellow-500" /> Operaions
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Operating Hours</label>
                        <input name="operating_hours" value={formData.operating_hours} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-electric-teal outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Contact Number</label>
                        <input name="contact_number" value={formData.contact_number} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-electric-teal outline-none" />
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
