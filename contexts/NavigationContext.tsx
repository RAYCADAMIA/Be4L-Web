import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { useMotionValue, useSpring, MotionValue } from 'framer-motion';

interface Tab {
    label: string;
    value: string;
    icon?: React.ElementType;
}

interface NavigationContextType {
    tabs: Tab[];
    setTabs: (tabs: Tab[]) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    headerTranslateY: MotionValue<number>;
    headerSpringY: MotionValue<number>;
    isHeaderVisible: boolean;
    setIsHeaderVisible: (visible: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tabs, setTabsState] = useState<Tab[]>([]);
    const [activeTab, setActiveTabState] = useState<string>('');
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    const headerTranslateY = useMotionValue(0);
    const headerSpringY = useSpring(headerTranslateY, {
        damping: 30,
        stiffness: 300,
        mass: 0.5
    });

    const setTabs = useCallback((newTabs: Tab[]) => {
        setTabsState(prev => {
            if (JSON.stringify(newTabs) !== JSON.stringify(prev)) {
                return newTabs;
            }
            return prev;
        });
    }, []);

    const setActiveTab = useCallback((tab: string) => {
        setActiveTabState(tab);
    }, []);

    const value = useMemo(() => ({
        tabs,
        setTabs,
        activeTab,
        setActiveTab,
        headerTranslateY,
        headerSpringY,
        isHeaderVisible,
        setIsHeaderVisible
    }), [tabs, setTabs, activeTab, setActiveTab, headerTranslateY, headerSpringY, isHeaderVisible, setIsHeaderVisible]);

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
