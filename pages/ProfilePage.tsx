import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileScreen from '../components/ProfileScreen';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseService } from '../services/supabaseService';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const ProfilePage: React.FC = () => {
    const { user: currentUser, login, logout } = useAuth();
    const navigate = useNavigate();
    const { userId } = useParams();
    const [targetUser, setTargetUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    useDocumentTitle(
        targetUser
            ? targetUser.id === currentUser?.id
                ? 'My Profile'
                : `${targetUser.display_name || targetUser.username}'s Profile`
            : 'Profile'
    );

    React.useEffect(() => {
        const fetchUserData = async () => {
            if (!userId || userId === currentUser?.id) {
                if (currentUser) {
                    setTargetUser(currentUser);
                    setLoading(false);
                    return;
                }
            }

            setLoading(true);
            try {
                // Fetch specific user profile
                const { data, error } = await supabaseService.profiles.getProfile(userId);

                if (data) {
                    setTargetUser(data);
                } else {
                    console.error("User profile not found:", userId, error);
                    // Fallback to current user if fetch fails
                    if (currentUser) setTargetUser(currentUser);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                if (currentUser) setTargetUser(currentUser);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, currentUser?.id]);

    const handleLegacyNavigate = (tab: any) => {
        if (tab === 'HOME') navigate('/app/home');
    };

    if (loading || !targetUser) return (
        <div className="flex-1 flex items-center justify-center bg-deep-black min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-electric-teal/20 border-t-electric-teal rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Decrypting Profile...</p>
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
            onOpenPostDetail={(p) => console.log("Post Detail", p)}
            onOpenQuest={(q) => navigate(`/app/quest/${q.id}`)}
            onOpenUser={(u) => navigate(u.id === currentUser?.id ? '/app/myprofile' : `/app/profile/${u.id}`)}
            onProfileUpdate={(u) => login(u)}
            onOpenChat={(id, name) => navigate('/app/chat')}
            onNavigate={handleLegacyNavigate}
        />
    );
};

export default ProfilePage;
