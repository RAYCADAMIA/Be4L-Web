import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Starfield } from '../Landing/LandingComponents';
import { User as UserType } from '../../types';

export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    const { user, loading: authLoading } = useAuth();
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            if (authLoading) return; // Wait for AuthProvider

            try {
                // 1. Check if we have a user from AuthContext (Mock or Real)
                if (user) {
                    processUserLogic(user);
                    return;
                }

                // 2. If no context user, check Supabase session directly (Fallback)
                const { data: { session } } = await supabase.auth.getSession();

                // If NO SESSION (Guest)
                if (!session) {
                    // Strict Protect: Chat, Profile, Admin, Book (if needed), Onboarding
                    const protectedPaths = ['/app/myprofile', '/app/admin', '/onboarding', '/app/dashboard'];
                    const isProtected = protectedPaths.some(path => location.pathname.startsWith(path));

                    if (isProtected) {
                        navigate('/'); // Or trigger auth modal? Better to redirect to Guest Home or Login
                        // User asked for "Open Auth Modal" on interaction, but if they direct link to /chat,
                        // maybe safe to just go to guest home.
                    } else if (location.pathname === '/app/home') {
                        // Redirect Guest attempting to reach Auth Home -> Guest Home
                        navigate('/');
                    }

                    // Otherwise allow (Quests, Dibs, Lore, GuestHome /)
                    setIsVerifying(false);
                    return;
                }

                // If real session, logic continues...
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (profile) {
                    processUserLogic(profile);
                } else {
                    // SESSION EXISTS but NO PROFILE -> Must be new user
                    if (location.pathname !== '/onboarding') {
                        navigate('/onboarding');
                    }
                    setIsVerifying(false);
                }

            } catch (error) {
                console.error('Auth Check Error:', error);
                setIsVerifying(false);
            }
        };

        const processUserLogic = async (profile: UserType | any) => {
            // Logic Tree
            // 1. Operator Logic
            if (profile.is_operator) {
                // If it's a MOCK user (non-UUID), we skip Supabase check for operator status
                if (!profile.id.includes('-')) {
                    if (!location.pathname.startsWith('/app')) navigate('/app/home');
                    setIsVerifying(false);
                    return;
                }

                const { data: operator } = await supabase
                    .from('operators')
                    .select('status')
                    .eq('user_id', profile.id)
                    .maybeSingle();

                if (operator?.status === 'pending') {
                    if (location.pathname !== '/partner/pending') navigate('/partner/pending');
                } else {
                    // Unified Experience: Operators now land on home feed, not dashboard
                    if (!location.pathname.startsWith('/app')) navigate('/app/home');
                }
                setIsVerifying(false);
                return;
            }

            // 2. Admin Logic - Unified Experience
            if (profile.is_admin) {
                if (location.pathname === '/app/admin') {
                    // Allow them to stay if they explicitly navigate there
                } else if (!location.pathname.startsWith('/app')) {
                    navigate('/app/home');
                }
                setIsVerifying(false);
                return;
            }

            // 3. Regular User Logic
            if (!profile.onboarding_completed) {
                // New User -> Onboarding
                if (location.pathname !== '/onboarding') {
                    navigate('/onboarding');
                }
            } else {
                // Active User -> Home
                // Prevent them from going back to onboarding or login if they are already set up
                if (location.pathname === '/auth' || location.pathname === '/' || location.pathname === '/onboarding') {
                    navigate('/app/home');
                }
            }
            setIsVerifying(false);
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                navigate('/');
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // checkSession(); // Let AuthContext handle this update usually
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate, location.pathname, user, authLoading]);

    if (authLoading || isVerifying) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <Starfield />
                <Loader2 className="text-electric-teal animate-spin" size={48} />
            </div>
        );
    }

    return <>{children}</>;
};
