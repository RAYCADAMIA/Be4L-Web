import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PlatformLayout } from './components/layouts/PlatformLayout';
import { PublicLayout } from './components/layouts/PublicLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnimationOrchestrator } from './components/Landing/AnimationOrchestrator';
import { AuthWrapper } from './components/Auth/AuthWrapper';

import { HeartbeatLoader } from './components/HeartbeatLoader';
import { useParams } from 'react-router-dom';

import { StrictPublicRoute } from './components/Auth/StrictPublicRoute';

// Lazy Load Components
const FeedPage = lazy(() => import('./pages/FeedPage').then(module => ({ default: module.FeedPage })));
const QuestPage = lazy(() => import('./pages/QuestPage').then(module => ({ default: module.QuestPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(module => ({ default: module.ChatPage })));
const BookPage = lazy(() => import('./pages/BookPage').then(module => ({ default: module.BookPage })));
const OperatorProfileScreen = lazy(() => import('./components/Dibs/OperatorProfileScreen'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const LorePage = lazy(() => import('./pages/LorePage').then(module => ({ default: module.LorePage })));
const OperatorDashboard = lazy(() => import('./components/Dibs/OperatorDashboard'));
const AdminDashboard = lazy(() => import('./components/Dibs/AdminDashboard'));
const CreateQuestPage = lazy(() => import('./pages/CreateQuestPage'));
const CreateQuestScreen = lazy(() => import('./components/CreateQuestScreen'));
const LandingPage = lazy(() => import('./components/LandingPage').then(module => ({ default: module.LandingPage })));
const BookScreen = lazy(() => import('./components/BookScreen'));
const PartnerPage = lazy(() => import('./pages/PartnerPage'));
const PartnerApplyPage = lazy(() => import('./pages/Partner/PartnerApplyPage').then(module => ({ default: module.PartnerApplyPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then(module => ({ default: module.TeamPage })));
const PartnerPendingPage = lazy(() => import('./pages/Partner/PartnerPendingPage').then(module => ({ default: module.PartnerPendingPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(module => ({ default: module.OnboardingPage })));
const VerifyBooking = lazy(() => import('./components/Dibs/VerifyBooking'));
const HomePage = lazy(() => import('./components/HomePage').then(module => ({ default: module.HomePage })));
const GuestHome = lazy(() => import('./components/Guest/GuestHome').then(module => ({ default: module.GuestHome })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));
const CreatorProgramPage = lazy(() => import('./pages/CreatorProgramPage'));
const CreatorApplyPage = lazy(() => import('./pages/CreatorApplyPage'));
const Be4LAdminHub = lazy(() => import('./pages/Be4LAdminHub'));

export const router = createBrowserRouter([
    {
        path: '/',
        element: <PublicLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            // Strict Public Routes (Redirect to /app if logged in)
            {
                element: <StrictPublicRoute><PlatformLayout /></StrictPublicRoute>,
                children: [
                    {
                        index: true,
                        element: <Suspense fallback={<HeartbeatLoader />}><GuestHome /></Suspense>
                    },
                    {
                        path: 'quests',
                        element: <Suspense fallback={<HeartbeatLoader />}><QuestPage /></Suspense>
                    },
                    {
                        path: 'dibs',
                        element: <Suspense fallback={<HeartbeatLoader />}><BookPage /></Suspense>
                    },
                    {
                        path: 'lore',
                        element: <Navigate to="/" replace />
                    },
                    {
                        path: 'about',
                        element: <Suspense fallback={<HeartbeatLoader />}><AnimationOrchestrator bypassSplash={true}><LandingPage bypassSplash /></AnimationOrchestrator></Suspense>
                    },
                    {
                        path: 'auth',
                        element: <Suspense fallback={<HeartbeatLoader />}><AuthPage /></Suspense>
                    }
                ]
            },
            // Partner Pages (Public)
            {
                path: 'partner',
                children: [
                    {
                        index: true,
                        element: <Suspense fallback={<HeartbeatLoader />}><PartnerPage /></Suspense>
                    },
                    {
                        path: 'apply',
                        element: <Suspense fallback={<HeartbeatLoader />}><PartnerApplyPage /></Suspense>
                    },
                    {
                        path: 'pending',
                        element: <Suspense fallback={<HeartbeatLoader />}><PartnerPendingPage /></Suspense>
                    }
                ]
            },
            {
                path: 'team',
                element: <Suspense fallback={<HeartbeatLoader />}><TeamPage /></Suspense>
            },
            {
                path: 'Careers/Creator-Program',
                element: <Suspense fallback={<HeartbeatLoader />}><CreatorProgramPage /></Suspense>
            },
            {
                path: 'Careers/Creator-Program/apply',
                element: <Suspense fallback={<HeartbeatLoader />}><CreatorApplyPage /></Suspense>
            },
            // Public Verify Route
            {
                path: 'verify/:bookingId',
                element: <Suspense fallback={<HeartbeatLoader />}><VerifyBooking /></Suspense>
            },
            {
                path: 'onboarding',
                element: <Suspense fallback={<HeartbeatLoader />}><OnboardingPage /></Suspense>
            },
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
                path: 'quests',
                element: <Suspense fallback={<HeartbeatLoader />}><QuestPage /></Suspense>
            },
            {
                path: 'quests/create',
                element: <Suspense fallback={<HeartbeatLoader />}><CreateQuestPage /></Suspense>
            },

            {
                path: 'lore',
                element: <Navigate to="/app/home" replace />
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
                path: 'shop/:slug',
                element: <Suspense fallback={<HeartbeatLoader />}><OperatorProfileScreen /></Suspense>
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
                path: ':userId',
                element: <Suspense fallback={<HeartbeatLoader />}><ProfilePage /></Suspense>
            }
        ]
    },
    {
        path: '/be4l-admin',
        element: <Suspense fallback={<HeartbeatLoader />}><Be4LAdminHub /></Suspense>,
        errorElement: <ErrorBoundary />
    }
]);
