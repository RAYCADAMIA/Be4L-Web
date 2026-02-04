import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tabs, setTabsState] = React.useState<Tab[]>([]);
    const [activeTab, setActiveTabState] = React.useState<string>('');

    const setTabs = React.useCallback((newTabs: Tab[]) => {
        setTabsState(prev => {
            if (JSON.stringify(newTabs) !== JSON.stringify(prev)) {
                return newTabs;
            }
            return prev;
        });
    }, []);

    const setActiveTab = React.useCallback((tab: string) => {
        setActiveTabState(tab);
    }, []);

    const value = React.useMemo(() => ({
        tabs,
        setTabs,
        activeTab,
        setActiveTab
    }), [tabs, setTabs, activeTab, setActiveTab]);

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
