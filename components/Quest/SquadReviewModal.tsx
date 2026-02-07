import React, { useState } from 'react';
import { User, AuraTransaction } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { X, Zap, ThumbsDown, Check, AlertCircle } from 'lucide-react';
import { GradientButton } from '../ui/AestheticComponents';

interface SquadReviewModalProps {
    participants: User[];
    currentUser: User;
    questId: string;
    onClose: () => void;
    onSubmit: () => void;
}

interface ReviewState {
    [userId: string]: {
        amount: number;
        reason?: string;
    };
}

const SquadReviewModal: React.FC<SquadReviewModalProps> = ({ participants, currentUser, questId, onClose, onSubmit }) => {
    // Filter out self
    const squad = participants.filter(p => p.id !== currentUser.id);

    const [reviews, setReviews] = useState<ReviewState>({});
    const [submitting, setSubmitting] = useState(false);
    const [reasonInputId, setReasonInputId] = useState<string | null>(null); // Who we are typing reason for

    const handleVibeCheck = (targetId: string, type: 'UP' | 'DOWN') => {
        setReviews(prev => ({
            ...prev,
            [targetId]: {
                amount: type === 'UP' ? 10 : -10,
                reason: type === 'UP' ? 'Good Vibes' : '' // Default reason for Up, Empty for Down to force input
            }
        }));

        // If Down, open reason input immediately
        if (type === 'DOWN') {
            setReasonInputId(targetId);
        } else {
            if (reasonInputId === targetId) setReasonInputId(null);
        }
    };

    const handleReasonChange = (userId: string, text: string) => {
        setReviews(prev => ({
            ...prev,
            [userId]: { ...prev[userId], reason: text }
        }));
    };

    const handleSubmit = async () => {
        // Validate: All squad members must be reviewed? Or optional?
        // Let's make it mandatory for Vibe Kill to have a reason.

        const invalidDownVotes = (Object.entries(reviews) as [string, ReviewState[string]][]).filter(([userId, review]) => review.amount < 0 && !review.reason);
        if (invalidDownVotes.length > 0) {
            alert("Please provide a reason for the bad vibes.");
            return;
        }

        setSubmitting(true);
        const reviewList = (Object.entries(reviews) as [string, ReviewState[string]][]).map(([userId, review]) => ({
            userId,
            amount: review.amount,
            reason: review.reason
        }));

        const success = await supabaseService.quests.submitAuraReview(questId, reviewList);
        setSubmitting(false);
        if (success) {
            onSubmit();
        } else {
            alert("Failed to submit vibes. Try again.");
        }
    };

    return (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-md space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse">
                        Vibe Check
                    </h1>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                        Rate your Squad
                    </p>
                </div>

                {/* Squad List */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {squad.map(member => {
                        const review = reviews[member.id];
                        const isUp = review?.amount > 0;
                        const isDown = review?.amount < 0;

                        return (
                            <div key={member.id} className="bg-[#111] border border-white/10 rounded-2xl p-4 transition-all hover:border-white/20">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <img src={member.avatar_url} className="w-12 h-12 rounded-xl object-cover border border-white/5" />
                                        <div>
                                            <p className="text-white font-black text-lg uppercase leading-none">{member.username}</p>
                                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Squad Member</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleVibeCheck(member.id, 'DOWN')}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDown ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110' : 'bg-surface text-gray-500 hover:bg-white/10'}`}
                                        >
                                            <ThumbsDown size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleVibeCheck(member.id, 'UP')}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isUp ? 'bg-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.5)] scale-110' : 'bg-surface text-gray-500 hover:bg-white/10'}`}
                                        >
                                            <Zap size={18} fill={isUp ? "black" : "none"} />
                                        </button>
                                    </div>
                                </div>

                                {/* Reason Input for Bad Vibes */}
                                {((isDown) || reasonInputId === member.id) && (
                                    <div className="animate-in slide-in-from-top-2 fade-in">
                                        <input
                                            autoFocus
                                            placeholder="What happened? (Required)"
                                            className="w-full bg-black/50 border border-red-500/30 rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:border-red-500 outline-none"
                                            value={review?.reason || ''}
                                            onChange={(e) => handleReasonChange(member.id, e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {squad.length === 0 && (
                        <div className="text-center text-gray-500">No other squad members to rate.</div>
                    )}
                </div>

                {/* Footer */}
                <div className="space-y-3">
                    <GradientButton
                        fullWidth
                        onClick={handleSubmit}
                        disabled={submitting}
                        icon={submitting ? undefined : <Check size={18} />}
                    >
                        {submitting ? 'Submitting...' : 'Submit Vibes'}
                    </GradientButton>
                    <button onClick={onClose} className="w-full py-2 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                        Skip Review
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SquadReviewModal;
