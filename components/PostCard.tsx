import React from 'react';
import { Capture } from '../types';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';

interface PostCardProps {
    capture: Capture;
    onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ capture, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group flex flex-col w-full bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-electric-teal/30 transition-all duration-500 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-gradient-to-br from-white/[0.05] to-transparent"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                    src={capture.back_media_url || capture.back_image_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000'}
                    alt={capture.caption || 'Be4L Lore'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Secondary Cam Preview */}
                <div className="absolute top-4 left-4 w-12 h-16 rounded-xl overflow-hidden border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <img
                        src={capture.front_media_url || capture.front_image_url}
                        className="w-full h-full object-cover"
                        alt="front"
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Center Hover Action */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-electric-teal text-black flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_20px_rgba(45,212,191,0.5)]">
                        <ArrowRight size={20} strokeWidth={3} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col gap-2">
                <p className="text-white text-[11px] font-bold leading-tight line-clamp-2 min-h-[2.4em] px-1">
                    {capture.caption || 'No caption provided.'}
                </p>

                <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/5 px-1">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400">
                            <Heart size={12} className="text-red-500/80" />
                            <span>{capture.reaction_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400">
                            <MessageCircle size={10} className="text-electric-teal" />
                            <span>{capture.comment_count || 0}</span>
                        </div>
                    </div>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                        {new Date(capture.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
