import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Quest } from '../types';
import QuestsScreen from '../components/QuestsScreen';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const QuestPage: React.FC = () => {
    useDocumentTitle('Quests');
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleLegacyNavigate = (tab: string) => {
        if (tab === 'HOME') navigate('/app/home');
        if (tab === 'PROFILE') navigate('/app/myprofile');
    };

    const handleOpenQuest = (q: Quest) => {
        setSearchParams({ quest: q.id });
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
