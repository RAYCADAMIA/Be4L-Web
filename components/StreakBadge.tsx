import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  minimal?: boolean;
  active?: boolean; // True if user posted today
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ count, size = 'md', minimal = false, active = false }) => {
  let colorClass = 'text-slate-400'; // Default/Inactive (Silver-ish Gray)
  let glowClass = '';

  if (active) {
    if (count >= 100) {
      colorClass = 'text-primary'; // Gold/Primary for 100+ (optional: kept for high achievers)
      glowClass = 'drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]';
    } else {
      colorClass = 'text-orange-400'; // "Firy Bronze"
      glowClass = 'drop-shadow-[0_0_5px_rgba(251,146,60,0.4)]';
    }
  } else {
    // Not posted yet today -> Slate Silver
    colorClass = 'text-slate-300';
    glowClass = ''; // No glow or subtle
  }

  if (count === 0) return null;

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 18 : 32;
  const textSize = minimal ? 'text-[10px]' : size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-2xl';
  const gap = minimal ? 'gap-0.5' : 'gap-1';

  return (
    <div className={`flex items-center ${gap} ${colorClass} ${glowClass} font-bold transition-all duration-300`}>
      <Flame size={iconSize} fill={active && count > 0 ? "currentColor" : "none"} strokeWidth={active && count > 0 ? 0 : 2.5} />
      <span className={textSize}>{count}</span>
    </div>
  );
};

export default StreakBadge;
