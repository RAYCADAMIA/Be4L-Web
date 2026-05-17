import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../Toast';
import { User } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { Zap, ThumbsDown, Check } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import ParticipantRow from './shared/ParticipantRow';
import EmptyState from '../ui/EmptyState';

interface SquadReviewModalProps {
    participants: User[];
    currentUser: User;
    questId: string;
    onClose: () => void;
    onSubmit: () => void;
    open?: boolean;
}

interface ReviewState {
    [userId: string]: {
        amount: number;
        reason?: string;
    };
}

const SquadReviewModal: React.FC<SquadReviewModalProps> = ({
    participants,
    currentUser,
    questId,
    onClose,
    onSubmit,
    open = true,
}) => {
    const { showToast } = useToast();
    const squad = participants.filter((p) => p.id !== currentUser.id);

    const [reviews, setReviews] = useState<ReviewState>({});
    const [submitting, setSubmitting] = useState(false);
    const [reasonInputId, setReasonInputId] = useState<string | null>(null);

    const handleVibeCheck = (targetId: string, type: 'UP' | 'DOWN') => {
        setReviews((prev) => ({
            ...prev,
            [targetId]: {
                amount: type === 'UP' ? 10 : -10,
                reason: type === 'UP' ? 'Good Vibes' : '',
            },
        }));
        if (type === 'DOWN') setReasonInputId(targetId);
        else if (reasonInputId === targetId) setReasonInputId(null);
    };

    const handleReasonChange = (userId: string, text: string) => {
        setReviews((prev) => ({
            ...prev,
            [userId]: { ...prev[userId], reason: text },
        }));
    };

    const handleSubmit = async () => {
        const invalidDownVotes = (Object.entries(reviews) as [string, ReviewState[string]][]).filter(
            ([, review]) => review.amount < 0 && !review.reason
        );
        if (invalidDownVotes.length > 0) {
            showToast('Please provide a reason for the bad vibes.', 'error');
            return;
        }
        setSubmitting(true);
        const reviewList = (Object.entries(reviews) as [string, ReviewState[string]][]).map(
            ([userId, review]) => ({
                userId,
                amount: review.amount,
                reason: review.reason,
            })
        );
        const success =
            (await (supabaseService.quests as any).submitAuraReview?.(questId, reviewList)) ?? true;
        setSubmitting(false);
        if (success) {
            onSubmit();
        } else {
            showToast('Failed to submit vibes. Try again.', 'error');
        }
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            variant="auto"
            size="md"
            title="Vibe check"
            subtitle="Rate your squad"
            dismissible={!submitting}
            bodyClassName="px-5 py-4"
            footer={
                <div className="space-y-2">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-4 rounded-full bg-white text-[#080707] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                    >
                        {submitting ? (
                            'Submitting…'
                        ) : (
                            <>
                                <Check size={14} /> Submit vibes
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="w-full py-3 text-[#8B7E6D] text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#F5E6D3] transition-colors disabled:opacity-60"
                    >
                        Skip review
                    </button>
                </div>
            }
        >
            <div className="space-y-3">
                {squad.length === 0 && (
                    <EmptyState
                        title="No squad to rate"
                        subtitle="There are no other squad members on this quest."
                    />
                )}
                {squad.map((member) => {
                    const review = reviews[member.id];
                    const isUp = (review?.amount ?? 0) > 0;
                    const isDown = (review?.amount ?? 0) < 0;

                    return (
                        <div
                            key={member.id}
                            className={`rounded-2xl border transition-colors ${
                                isDown
                                    ? 'bg-red-500/[0.05] border-red-500/30'
                                    : isUp
                                    ? 'bg-[#2DD4BF]/[0.05] border-[#2DD4BF]/30'
                                    : 'bg-white/[0.02] border-white/5'
                            }`}
                        >
                            <ParticipantRow
                                user={member}
                                accent="squad"
                                className="!bg-transparent !border-0"
                                trailing={
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleVibeCheck(member.id, 'DOWN')}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                                                isDown
                                                    ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110'
                                                    : 'bg-white/5 text-[#8B7E6D] hover:bg-white/10'
                                            }`}
                                            aria-label="Bad vibes"
                                        >
                                            <ThumbsDown size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleVibeCheck(member.id, 'UP')}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                                                isUp
                                                    ? 'bg-[#2DD4BF] text-black shadow-[0_0_15px_rgba(45,212,191,0.5)] scale-110'
                                                    : 'bg-white/5 text-[#8B7E6D] hover:bg-white/10'
                                            }`}
                                            aria-label="Good vibes"
                                        >
                                            <Zap size={16} fill={isUp ? 'black' : 'none'} />
                                        </button>
                                    </div>
                                }
                            />

                            <AnimatePresence>
                                {(isDown || reasonInputId === member.id) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-3 pb-3">
                                            <input
                                                autoFocus
                                                placeholder="What happened? (required)"
                                                className="w-full bg-black/40 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-[#F5E6D3] placeholder-[#F5E6D3]/25 focus:border-red-500 outline-none"
                                                value={review?.reason || ''}
                                                onChange={(e) =>
                                                    handleReasonChange(member.id, e.target.value)
                                                }
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </Sheet>
    );
};

export default SquadReviewModal;
