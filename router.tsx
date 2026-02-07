import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PlatformLayout } from './components/layouts/PlatformLayout';
import { PublicLayout } from './components/layouts/PublicLayout';
// Lazy Load Components
const FeedPage = lazy(() => import('./pages/FeedPage').then(module => ({ default: module.FeedPage })));
const QuestPage = lazy(() => import('./pages/QuestPage').then(module => ({ default: module.QuestPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(module => ({ default: module.ChatPage })));
const BookPage = lazy(() => import('./pages/BookPage').then(module => ({ default: module.BookPage })));
const OperatorProfileScreen = lazy(() => import('./components/Dibs/OperatorProfileScreen'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const QuestDetailScreen = lazy(() => import('./components/Quest/QuestDetailScreen'));
const LorePage = lazy(() => import('./pages/LorePage').then(module => ({ default: module.LorePage })));
const OperatorDashboard = lazy(() => import('./components/Dibs/OperatorDashboard'));
const AdminDashboard = lazy(() => import('./components/Dibs/AdminDashboard'));
const LandingPage = lazy(() => import('./components/LandingPage'));

const OperatorProfileScreenWrapper = () => <OperatorProfileScreen />; // Wrap if needed or use directly


// import { HomePage } from './components/HomePage'; // Lazy loaded
import { ErrorBoundary } from './components/ErrorBoundary';
// import LandingPage from './components/LandingPage'; // Converted to lazy
import { AnimationOrchestrator } from './components/Landing/AnimationOrchestrator';

// New Static & Partner Pages
const PartnerPitchPage = lazy(() => import('./pages/Partner/PartnerPitchPage').then(module => ({ default: module.PartnerPitchPage })));
const PartnerApplyPage = lazy(() => import('./pages/Partner/PartnerApplyPage').then(module => ({ default: module.PartnerApplyPage })));
const PartnerPendingPage = lazy(() => import('./pages/Partner/PartnerPendingPage').then(module => ({ default: module.PartnerPendingPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(module => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(module => ({ default: module.TermsPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then(module => ({ default: module.TeamPage })));
const HomePage = lazy(() => import('./components/HomePage').then(module => ({ default: module.HomePage })));

// Auth & Onboarding
import { AuthWrapper } from './components/Auth/AuthWrapper';
import { OnboardingPage } from './pages/OnboardingPage';
import { HeartbeatLoader } from './components/HeartbeatLoader';
import { useParams } from 'react-router-dom';

const QuestRedirect = () => {
    const { questId } = useParams();
    return <Navigate to={`/app/quests?quest=${questId}`} replace />;
};

const ProfileRedirect = () => {
    const { userId } = useParams();
    return <Navigate to={`/app/profile/${userId}`} replace />;
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <PublicLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                index: true,
                element: <AnimationOrchestrator />
            },
            {
                path: 'login',
                element: <Suspense fallback={<HeartbeatLoader />}><LandingPage /></Suspense>
            },
            {
                path: 'onboarding',
                element: <AuthWrapper><OnboardingPage /></AuthWrapper>
            },
            {
                path: 'partner',
                element: <Suspense fallback={<HeartbeatLoader />}><PartnerPitchPage /></Suspense>
            },
            {
                path: 'partner/apply',
                element: <Suspense fallback={<HeartbeatLoader />}><PartnerApplyPage /></Suspense>
            },
            {
                path: 'partner/pending',
                element: <Suspense fallback={<HeartbeatLoader />}><PartnerPendingPage /></Suspense>
            },
            {
                path: 'about',
                element: <Suspense fallback={<HeartbeatLoader />}><AboutPage /></Suspense>
            },
            {
                path: 'privacy',
                element: <Suspense fallback={<HeartbeatLoader />}><PrivacyPage /></Suspense>
            },
            {
                path: 'terms',
                element: <Suspense fallback={<HeartbeatLoader />}><TermsPage /></Suspense>
            },
            {
                path: 'team',
                element: <Suspense fallback={<HeartbeatLoader />}><TeamPage /></Suspense>
            },
            {
                path: 'dashboard/*',
                element: <Navigate to="/app/dashboard" replace />
            },
            {
                path: 'profile/:userId',
                element: <ProfileRedirect />
            }
        ]
    },
    {
        path: '/app',
        element: <AuthWrapper><PlatformLayout /></AuthWrapper>,
        errorElement: <ErrorBoundary />,
        children: [
            {
                index: true,
                element: <Navigate to="/app/home" replace />
            },
            {
                path: 'home',
                element: <Suspense fallback={<HeartbeatLoader />}><HomePage /></Suspense>
            },
            {
                path: 'feed',
                element: <Navigate to="/app/home" replace />
            },
            {
                path: 'quests',
                element: <Suspense fallback={<HeartbeatLoader />}><QuestPage /></Suspense>
            },
            {
                path: 'lore',
                element: <Suspense fallback={<HeartbeatLoader />}><LorePage /></Suspense>
            },
            {
                path: 'quest/:questId',
                element: <QuestRedirect />
            },
            {
                path: 'chat',
                element: <Suspense fallback={<HeartbeatLoader />}><ChatPage /></Suspense>
            },
            {
                path: 'dibs',
                element: <Suspense fallback={<HeartbeatLoader />}><BookPage /></Suspense>
            },
            {
                path: 'book',
                element: <Navigate to="/app/dibs" replace />
            },
            {
                path: 'shop/:slug',
                element: <Suspense fallback={<HeartbeatLoader />}><OperatorProfileScreenWrapper /></Suspense>
            },
            {
                path: 'dashboard/*',
                element: <Suspense fallback={<HeartbeatLoader />}><OperatorDashboard /></Suspense>
            },
            {
                path: 'admin',
                element: <Suspense fallback={<HeartbeatLoader />}><AdminDashboard /></Suspense>
            },
            {
                path: 'myprofile',
                element: <Suspense fallback={<HeartbeatLoader />}><ProfilePage /></Suspense>
            },
            {
                path: 'profile/:userId',
                element: <Suspense fallback={<HeartbeatLoader />}><ProfilePage /></Suspense>
            }
        ]
    }
]);
