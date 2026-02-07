import React from 'react';
import { Users, Zap } from 'lucide-react';
import { Operator } from '../../types';
import { motion } from 'framer-motion';

interface Props {
    operator: Operator;
    onClick: (slug: string) => void;
}

const OperatorCard: React.FC<Props> = ({ operator, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(operator.slug)}
            style={{ contentVisibility: 'auto' } as any}
            className="group relative w-full aspect-square bg-deep-black rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer hover:border-primary/50 transition-[border-color,box-shadow] duration-500 shadow-xl will-change-transform"
        >
            {/* Cover Photo */}
            <div className="absolute inset-0">
                <img
                    src={operator.cover_photo_url}
                    alt={operator.business_name}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* Badge */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-black/60 border border-white/10 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-widest text-white">
                    {operator.category}
                </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                <div className="flex items-end gap-2 md:gap-3 translate-y-1 md:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {/* Avatar (Overlapping) */}
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-primary/50 overflow-hidden bg-black shrink-0 relative z-20">
                        <img
                            src={`https://ui-avatars.com/api/?name=${operator.business_name}&background=111&color=fff`}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 pb-0.5 md:pb-1">
                        <h3 className="text-sm md:text-xl font-black text-white uppercase tracking-tighter leading-none mb-0.5 md:mb-1 shadow-black drop-shadow-md truncate">
                            {operator.business_name}
                        </h3>
                        {operator.is_verified && (
                            <div className="flex items-center gap-1 text-primary text-[7px] md:text-[10px] font-bold uppercase tracking-wider">
                                <Zap size={8} className="fill-current md:w-[10px]" /> Verified
                            </div>
                        )}
                    </div>
                </div>

                {/* Followers (Fade In on Hover) */}
                <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-t border-white/10 pt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-bold">
                        <Users size={12} /> {operator.followers_count?.toLocaleString() || 0} Followers
                    </div>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest text-right">View Shop ➜</span>
                </div>
            </div>
        </motion.div>
    );
};

export default OperatorCard;
