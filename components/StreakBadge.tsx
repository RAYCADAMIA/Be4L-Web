import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  minimal?: boolean;
  active?: boolean;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ count, size = 'md', minimal = false, active = false }) => {
  const [prevCount, setPrevCount] = useState(count);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  useEffect(() => {
    if (count > prevCount && active) {
      setIsLevelingUp(true);
      const timer = setTimeout(() => setIsLevelingUp(false), 2000);
      setPrevCount(count);
      return () => clearTimeout(timer);
    }
    setPrevCount(count);
  }, [count, active]);

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : 28;
  const textSize = minimal ? 'text-[9px]' : size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-[12px]' : 'text-2xl';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : size === 'md' ? 'px-3 py-1' : 'px-5 py-2';

  // Aesthetic Style: Neon Cyan/Green on Dark Grey
  // Aesthetic Style: Neon Orange/Amber on Dark Grey
  const activeColor = 'text-[#FF9F0A]'; // Apple-style Orange
  const inactiveColor = 'text-white/20';
  const glow = 'shadow-[0_0_15px_rgba(255,159,10,0.4)] border-[#FF9F0A]/30';

  return (
    <div className="relative">
      <motion.div
        animate={isLevelingUp ? { scale: [1, 1.1, 1] } : {}}
        className={`
          flex items-center gap-2 ${padding} rounded-lg
          bg-[#1A1A1A] border ${active && count > 0 ? glow : 'border-white/10'}
          ${active && count > 0 ? activeColor : inactiveColor} 
          font-mono transition-all duration-500
        `}
      >
        <div className="relative">
          <Flame
            size={iconSize}
            className={`transition-all duration-500 ${active && count > 0 ? 'opacity-100' : 'opacity-40'}`}
          />
          {active && count > 0 && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[#FF9F0A]/20 blur-sm rounded-full"
            />
          )}
        </div>

        <div className="relative overflow-hidden flex items-center">
          <span className={`${textSize} font-bold tracking-tighter`}>
            {active ? count : 0}
          </span>
          {isLevelingUp && (
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute text-[10px] right-[-14px] font-black text-green-400"
            >
              +1
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Shockwave Animation */}
      <AnimatePresence>
        {isLevelingUp && (
          <motion.div
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 border-2 border-[#FF9F0A] rounded-lg pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreakBadge;
