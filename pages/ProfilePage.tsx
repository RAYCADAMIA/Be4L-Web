import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileScreen from '../components/ProfileScreen';
import { useNavigate, useParams } from 'react-router-dom';
import { CommandCenter } from '../components/CommandCenter';
import { supabaseService } from '../services/supabaseService';

export const ProfilePage: React.FC = () => {
    const { user: currentUser, login, logout } = useAuth();
    const navigate = useNavigate();
    const { userId } = useParams();
    const [targetUser, setTargetUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUserData = async () => {
            if (!userId || userId === currentUser?.id) {
                setTargetUser(currentUser);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabaseService.profiles.getProfile(userId);
                if (data) setTargetUser(data);
                else {
                    // Fallback to mock or error
                    console.error("User not found", error);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, currentUser]);

    const handleLegacyNavigate = (tab: string) => {
        if (tab === 'HOME') navigate('/app/home');
    };

    if (loading || !targetUser) return (
        <div className="flex-1 flex items-center justify-center bg-deep-black min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-electric-teal/20 border-t-electric-teal rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Syncing Profile...</p>
            </div>
        </div>
    );

    return (
        <ProfileScreen
            user={targetUser}
            currentUserId={currentUser?.id}
            theme={'dark'}
            onToggleTheme={() => { }}
            onBack={() => navigate(-1)}
            onLogout={() => {
                logout();
                navigate('/');
            }}
            onOpenPostDetail={(p) => console.log("Post", p)}
            onOpenQuest={(q) => console.log("Quest", q)}
            onOpenUser={(u) => navigate(u.id === currentUser?.id ? '/app/myprofile' : `/app/profile/${u.id}`)}
            onProfileUpdate={(u) => login(u)}
            onOpenChat={(id, name) => console.log("Chat", id)}
            onNavigate={handleLegacyNavigate}
        />
    );
};
