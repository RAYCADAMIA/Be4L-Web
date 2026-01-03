import React, { useState } from 'react';
import { X, Calendar, Users, DollarSign, MapPin, Tag, ArrowRight } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { QuestType } from '../types';
import { GradientButton } from './ui/AestheticComponents';
import { useToast } from './Toast';

interface CreateQuestScreenProps {
    onClose: () => void;
    onQuestCreated?: () => void;
}

const CreateQuestScreen: React.FC<CreateQuestScreenProps> = ({ onClose, onQuestCreated }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<string>('Social');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [maxParticipants, setMaxParticipants] = useState<number>(5);
    const [fee, setFee] = useState<number>(0);
    const [startTime, setStartTime] = useState<string>(''); // For now simple string input or HTML datetime-local

    const categories = ['Social', 'Adventure', 'Sports', 'Food', 'Gaming', 'Art', 'Music', 'Others'];

    const handleSubmit = async () => {
        if (!title || !description || !location || !startTime) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const success = await supabaseService.quests.createQuest({
                title,
                category,
                description,
                location,
                max_participants: maxParticipants,
                fee,
                start_time: new Date(startTime).toISOString(),
                type: QuestType.CASUAL // Default simple quest
            });

            if (success) {
                showToast('Quest Created Successfully!', 'success');
                if (onQuestCreated) onQuestCreated();
                onClose();
            } else {
                showToast('Failed to create quest', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('An unexpected error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-6 pt-12 flex justify-between items-center border-b border-white/10">
                <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Host a Quest</h2>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                    <X size={20} />
                </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Quest Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Midnight Ramen Run"
                        className="w-full bg-surface border border-white/10 rounded-xl p-4 text-white font-bold placeholder-gray-600 focus:border-primary outline-none transition-colors"
                    />
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${category === cat
                                    ? 'bg-primary text-black border-primary'
                                    : 'bg-surface text-gray-400 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">When?</label>
                    <div className="bg-surface border border-white/10 rounded-xl p-3 flex items-center gap-3">
                        <Calendar size={18} className="text-primary" />
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="bg-transparent w-full text-white font-bold outline-none [color-scheme:dark]"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Where?</label>
                    <div className="bg-surface border border-white/10 rounded-xl p-3 flex items-center gap-3">
                        <MapPin size={18} className="text-primary" />
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Location Name or Address"
                            className="bg-transparent w-full text-white font-bold outline-none placeholder-gray-600"
                        />
                    </div>
                </div>

                {/* Splits: Participants & Fee */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Max People</label>
                        <div className="bg-surface border border-white/10 rounded-xl p-3 flex items-center gap-3">
                            <Users size={18} className="text-primary" />
                            <input
                                type="number"
                                min={2}
                                max={50}
                                value={maxParticipants}
                                onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 2)}
                                className="bg-transparent w-full text-white font-bold outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fee (₱)</label>
                        <div className="bg-surface border border-white/10 rounded-xl p-3 flex items-center gap-3">
                            <DollarSign size={18} className="text-primary" />
                            <input
                                type="number"
                                min={0}
                                value={fee}
                                onChange={(e) => setFee(parseInt(e.target.value) || 0)}
                                className="bg-transparent w-full text-white font-bold outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">The Plan</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's the vibe? What do people need to bring?"
                        className="w-full h-32 bg-surface border border-white/10 rounded-xl p-4 text-white font-medium placeholder-gray-600 focus:border-primary outline-none transition-colors resize-none"
                    />
                </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-black safe-area-bottom">
                <GradientButton fullWidth onClick={handleSubmit} disabled={loading} icon={loading ? undefined : <ArrowRight size={18} />}>
                    {loading ? 'Creating Quest...' : 'Launch Quest'}
                </GradientButton>
            </div>
        </div>
    );
};

export default CreateQuestScreen;
