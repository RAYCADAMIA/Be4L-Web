import { useRef, useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

export const useScrollBehavior = () => {
    const { headerTranslateY, setIsHeaderVisible } = useNavigation();
    const lastScrollY = useRef(0);

    const handleScroll = (e: React.UIEvent<HTMLElement> | Event) => {
        // Desktop check - disable scroll hiding on larger screens
        if (window.innerWidth >= 768) {
            headerTranslateY.set(0);
            setIsHeaderVisible(true);
            return;
        }

        const target = e.target as HTMLElement;
        const currentScrollY = target.scrollTop;
        if (target.scrollHeight <= target.clientHeight) return; // Don't hide if not scrollable

        const delta = currentScrollY - lastScrollY.current;

        // Dynamic offset based on mobile header + tabs height (~140px safe buffer)
        const HIDE_OFFSET = -140;

        // Sticky at Top: lock visible within 10px
        if (currentScrollY <= 10) {
            headerTranslateY.set(0);
            setIsHeaderVisible(true);
        } else if (delta > 5 && currentScrollY > 50) {
            // Scroll Down (Hide) - requires some existing scroll
            headerTranslateY.set(HIDE_OFFSET);
            setIsHeaderVisible(false);
        } else if (delta < -10) {
            // Scroll Up (Reveal) immediately with slight threshold
            headerTranslateY.set(0);
            setIsHeaderVisible(true);
        }

        lastScrollY.current = currentScrollY;
    };

    return { handleScroll };
};
