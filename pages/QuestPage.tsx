import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import QuestsScreen from '../components/QuestsScreen';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const QuestPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleLegacyNavigate = (tab: string) => {
        if (tab === 'HOME') navigate('/app/home');
        if (tab === 'PROFILE') navigate('/app/myprofile');
    };

    const handleOpenQuest = (q: Quest) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('quest', q.id);
        setSearchParams(newParams);
    };

    if (!user) return <div>Loading Quests...</div>;

    return (
        <QuestsScreen
            onOpenQuest={handleOpenQuest}
            onOpenCompetition={(c) => console.log("Open Comp", c)}
            onOpenMyQuests={() => navigate('/app/myprofile')}
            onOpenProfile={() => navigate('/app/myprofile')}
            currentUser={user}
            onNavigate={handleLegacyNavigate}
            onReset={() => console.log("Reset")}
            onOpenQuestList={() => console.log("List")}
            onLaunchQuest={() => console.log("Launch")}
            refreshTrigger={0}
            hasUserPostedToday={false} // TODO
            onTimerZero={() => { }}
        />
    );
};
