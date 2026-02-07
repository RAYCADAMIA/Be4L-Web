import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoreFeed } from '../components/LoreFeed';
import { useNavigate } from 'react-router-dom';
import { HeartbeatLoader } from '../components/HeartbeatLoader';

export const FeedPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Mapping new Router navigation to the legacy "onNavigate" string signature
    // This allows us to reuse LoreFeed without rewriting it instantly.
    const handleLegacyNavigate = (tab: string) => {
        console.log("Navigating to", tab);
        if (tab === 'QUESTS') navigate('/app/quests');
        if (tab === 'HOME') navigate('/app/home');
        if (tab === 'PROFILE') navigate('/app/myprofile');
        // ... handle others
    };

    if (!user) return <HeartbeatLoader />;

    return (
        <LoreFeed
            currentUser={user}
            onNavigate={(tab) => handleLegacyNavigate(tab)}
            onOpenProfile={() => navigate('/app/myprofile')}
            onOpenPostDetail={(p) => console.log("Open Post", p)} // TODO: Implement Modal Route
            onUserClick={(u) => navigate(u.id === user.id ? '/app/myprofile' : `/app/profile/${u.id}`)} // Route to myprofile if self
            refreshTrigger={0}
            onLaunchCamera={() => console.log("Camera Launch")} // TODO: Global Camera Context
            hasUserPostedToday={false} // TODO: Calc from Helper
            onOpenQuestList={() => navigate('/app/quests')}
        />
    );
};
