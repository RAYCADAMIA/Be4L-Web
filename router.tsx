import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PlatformLayout } from './components/layouts/PlatformLayout';
import { PublicLayout } from './components/layouts/PublicLayout';
import { FeedPage } from './pages/FeedPage';
import { QuestPage } from './pages/QuestPage';
import { ChatPage } from './pages/ChatPage';
import { BookPage } from './pages/BookPage';
import OperatorProfileScreen from './components/Dibs/OperatorProfileScreen';
import { ProfilePage } from './pages/ProfilePage';
import QuestDetailScreen from './components/Quest/QuestDetailScreen';
import { LorePage } from './pages/LorePage';

const OperatorProfileScreenWrapper = () => <OperatorProfileScreen />; // Wrap if needed or use directly
import OperatorDashboard from './components/Dibs/OperatorDashboard';
import AdminDashboard from './components/Dibs/AdminDashboard';


import { HomePage } from './components/HomePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import { AnimationOrchestrator } from './components/Landing/AnimationOrchestrator';

// New Static & Partner Pages
import { PartnerPitchPage } from './pages/Partner/PartnerPitchPage';
import { PartnerApplyPage } from './pages/Partner/PartnerApplyPage';
import { PartnerPendingPage } from './pages/Partner/PartnerPendingPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { TeamPage } from './pages/TeamPage';

// Auth & Onboarding
import { AuthWrapper } from './components/Auth/AuthWrapper';
import { OnboardingPage } from './pages/OnboardingPage';

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
                element: <LandingPage />
            },
            {
                path: 'onboarding',
                element: <AuthWrapper><OnboardingPage /></AuthWrapper>
            },
            {
                path: 'partner',
                element: <PartnerPitchPage />
            },
            {
                path: 'partner/apply',
                element: <PartnerApplyPage />
            },
            {
                path: 'partner/pending',
                element: <PartnerPendingPage />
            },
            {
                path: 'about',
                element: <AboutPage />
            },
            {
                path: 'privacy',
                element: <PrivacyPage />
            },
            {
                path: 'terms',
                element: <TermsPage />
            },
            {
                path: 'team',
                element: <TeamPage />
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
                element: <HomePage />
            },
            {
                path: 'feed',
                element: <Navigate to="/app/home" replace />
            },
            {
                path: 'quests',
                element: <QuestPage />
            },
            {
                path: 'lore',
                element: <LorePage />
            },
            {
                path: 'quest/:questId',
                element: <QuestDetailScreen />
            },
            {
                path: 'chat',
                element: <ChatPage />
            },
            {
                path: 'dibs',
                element: <BookPage />
            },
            {
                path: 'book',
                element: <Navigate to="/app/dibs" replace />
            },
            {
                path: 'shop/:slug',
                element: <OperatorProfileScreenWrapper />
            },
            {
                path: 'dashboard/*',
                element: <OperatorDashboard />
            },
            {
                path: 'admin',
                element: <AdminDashboard />
            },
            {
                path: 'myprofile',
                element: <ProfilePage />
            },
            {
                path: 'profile/:userId',
                element: <ProfilePage />
            }
        ]
    }
]);
