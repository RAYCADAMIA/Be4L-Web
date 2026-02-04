import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookScreen from '../components/BookScreen';
import { useNavigate } from 'react-router-dom';

export const BookPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLegacyNavigate = (tab: string) => {
        if (tab === 'HOME') navigate('/app/home');
    };

    if (!user) return <div>Loading Dibs...</div>;

    return (
        <BookScreen
            currentUser={user}
            onOpenProfile={() => navigate('/app/myprofile')}
            onNavigate={(tab) => {
                if (tab === 'HOME') navigate('/app/home');
                if (tab === 'QUESTS') navigate('/app/quests');
                if (tab === 'CHATS') navigate('/app/chat');
                if (tab === 'BOOK') navigate('/app/dibs');
            }}
        />
    );
};
