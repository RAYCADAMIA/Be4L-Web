import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CreateQuestScreen from '../components/CreateQuestScreen';

export const CreateQuestPage: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return null;
    if (!user) {
        navigate('/auth');
        return null;
    }

    return (
        <CreateQuestScreen
            currentUser={user}
            onClose={() => navigate(-1)}
            onQuestCreated={(id) => navigate(`/app/quests?questId=${id}`)}
        />
    );
};

export default CreateQuestPage;
