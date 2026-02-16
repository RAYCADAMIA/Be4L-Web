import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookScreen from '../components/BookScreen';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const BookPage: React.FC = () => {
    useDocumentTitle('Dibs');
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const handleLegacyNavigate = (tab: string) => {
        if (tab === 'HOME') navigate('/app/home');
    };

    if (loading) return <div>Loading...</div>;

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
