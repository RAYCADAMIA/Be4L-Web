# Be4L (Be For Life) - Comprehensive Product Documentation

> **Mission:** "Minimize screen time, maximize life time." | "Always For Life"

Be4L is a social utility platform conceptualized to encourage real-world, physical interactions while minimizing passive digital consumption. The application focuses on translating digital planning into tangible, offline experiences through features like side quests, event booking, and capturing authentic dual-camera moments.

Crucially, **Be4L is a multi-native application**. It leverages a unified web-first codebase wrapped in modern native bridging technologies to deploy seamlessly as both a Progressive Web App (PWA) and native mobile applications (iOS and Android).

---

## 1. Technical Architecture & Infrastructure

Be4L is built on a modern, robust, and highly scalable frontend architecture designed for cross-platform deployment from a single codebase.

### **Core Stack**
*   **Framework**: React 19 optimized with Vite for lightning-fast HMR and building.
*   **Language**: TypeScript (Strict mode) for strong type-safety and interface modeling across all entities.
*   **Routing**: `react-router-dom` utilizing a layout-driven architecture (`PlatformLayout`, `PublicLayout`) routing between public landing pages and authenticated application workspaces.
*   **Styling**: Tailwind CSS (PostCSS/Autoprefixer) coupled with `clsx` and `tailwind-merge` for utility-first, dynamic component styling. Integrates `tailwindcss-animate` and `framer-motion` for premium, buttery-smooth micro-interactions.
*   **State Management**: Context-driven architecture combined with robust localized state. Built with preparedness for Supabase integration (`@supabase/supabase-js`).
*   **Deployment & Analytics**: Vercel ecosystem (`@vercel/analytics`, `@vercel/speed-insights`).

### **Cross-Platform / Multi-Native System**
To fulfill the requirement of being simultaneously a web platform and a mobile app:
*   **Capacitor.js** (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`): Acts as the native runtime. It wraps the Vite build output (`dist/`) into native webviews, allowing the web app to access native device APIs (camera, geolocation, push notifications, exact file system) while maintaining a singular generic web-codebase.

### **Interactive & Specialized Libraries**
*   **Maps & Geolocation**: `leaflet` and `react-leaflet` to display dynamic discovery maps and quest locations.
*   **3D Elements**: `three.js`, `@react-three/fiber`, and `@react-three/drei` for rendering highly interactive models (like 3D trophys or immersive onboarding sequences).
*   **Media Editing**: `react-easy-crop` and `html-to-image` for in-app media manipulation.

---

## 2. Core Features & Modalities

### A. The Lore System (Dual Camera & Social Feed)
The primary method of social sharing is authentic and contextual.
*   **Dual Camera Capture**: Forces the user to capture both their reaction (front camera) and their exact view (back camera) simultaneously. 
*   **Contextual Metadata**: Posts ("Lores") automatically attach the current geographic location and can attach music context (e.g., Spotify track integration).
*   **Visibility Controls**: Posts can be public, friends-only, or private.
*   **Engagement**: A minimalist reaction ecosystem (e.g., fire, heart, muscle) overlaid seamlessly on media.

### B. Quests System (Real-World Activities)
The core driver of offline interaction.
*   **Side Quests**: Users can host or discover casual activities ("Sunset Bouldering", "Midnight Gallery Hop").
*   **Quest Modes**:
    *   *Sponty*: Immediate, ad-hoc hangouts.
    *   *Scheduled*: Planned future dates.
*   **Quest Lifecycles**: `DISCOVERABLE`, `ACTIVE`, `COMPLETED`, `CANCELLED`.
*   **Filtering**: By universal categories (Sports, Socials, Adventures, Travel, Train) or vibes ("Ladies Only", "Beginner Friendly").

### C. Dibs Marketplace & Event Booking
A full-suite booking and marketplace engine for partner operators.
*   **Items & Events**: Operators list tickets, courses (e.g., *Intro to Freediving* by Samal Freedive), or tournament slots (e.g., *SuperSmasher Night League*).
*   **Tiered Ticketing**: Events can have unlimited variations (e.g., "Standard Pax", "Barkada Bundle - VIP"), handling capacity limits and exact perks per tier.
*   **Verification**: Generates custom QR-code style booking confirmations allowing operators to verify attendees at the door via an `Event Check-in Screen`.

### D. Competitions Network
A hub for tracking larger structured events in the city.
*   Detailed breakdown of sports/social competitions (e.g., *Davao Open Pickleball*, *Barista Throwdown*).
*   Tracks Prize Pools, Location, Organizers, and Registration Status (`upcoming`, `registration_open`, `ongoing`).

### E. Chat & Connections (Echoes)
*   Integrated instant-messaging connecting users globally.
*   Contextual system allows attaching Quest Invitations or Event Links directly inside chat rooms.

---

## 3. Gamification, Progression & User Systems

Be4L utilizes behavioral psychology to encourage offline interactions through positive digital reinforcement.

*   **Aura Points (Reliability Score)**: Users earn 'Aura' by completing quests, showing up on time, and receiving positive peer reviews. They lose Aura for flaking or bad behavior. It tracks real-time karma.
*   **Life Exp & Leveling**: A literal RPG-style leveling system. Attending events and booking 'Dibs' grants Life Exp, leveling up the user's base identity.
*   **Streaks**: Utilizing generic gamification daily mechanisms ("Life Streak") based on the `dailyService` time-window to ensure users interact with the app consecutively, encouraging long-term retention.
*   **Identity Customization**: Custom profile pictures, cover photos, handles, and modular profile blocks.

---

## 4. Administrative & Ecosystem Management

### **Be4L Admin Hub**
A centralized dashboard for internal Be4L staff.
*   **Partner Leads**: Streamlined funnel viewing inquiries from the public `PartnerApplyPage`. Uses an "Inquiry -> Review -> Invite" workflow.
*   **Dashboard Oversight**: Manages platform vitals, user bans, and high-level platform overrides.
*   **Login Shorthand**: Features a robust command-line style admin bypass for developer / super-user access.

### Operator Dashboard
A specialized interface for Business Partners (e.g., Cloud29 Events, Samal Freedive).
*   **Lore Pushing**: The ability to post high-tier brand posts that integrate directly into user feeds.
*   **Event Sandbox**: A CMS for tweaking event details, capacities, ticket prices, and monitoring live check-ins.
*   **Analytics reporting**: Tracking event conversion metrics and follower engagement.

### Creator Program Portal
A dedicated funnel (`/Careers/Creator-Program`) designed specifically to onboard influencers and content creators.
*   **Application System**: Allows high-profile users to petition for specific Creator status.
*   **Monetization & Incentives**: Details paths for content monetization and brand alignments within the Be4L ecosystem.

---

## 5. Auxiliary Features & Platform Tooling

To support the core loop, several robust sub-systems are integrated:

*   **Global Discovery (Search)**: Handled by `SearchScreen.tsx`, driving organic discovery of users, brands, and public side-quests.
*   **System Notifications**: `NotificationsScreen.tsx` processes pushes for quest invites, reactions, comments, and booking approvals.
*   **Onboarding & Identity**:
    *   Immersive 3D/animation-heavy Splash screens and Onboarding flows (`SplashScreen.tsx`, `OnboardingPage.tsx`).
    *   Integrated `ImageCropper.tsx` (via `react-easy-crop`) allowing localized, aspect-ratio-locked profile and cover photo editing.
    *   **Account Recovery**: Fully modeled via `AccountRecoveryModal.tsx` for secure user retrieval.
*   **Corporate & Legal Architecture**:
    *   Static and beautifully styled informational pages (`TeamPage.tsx`, `AboutPage.tsx`).
    *   Required legals for App Store approval (`PrivacyPage.tsx`, `TermsPage.tsx`).
    *   Command Center (`CommandCenter.tsx`) for high-level technical diagnostic views.

---

## 6. File System & Architecture Layout

If you need to rebuild or heavily modify the system, here is the architectural map:

*   **`src/components/`**: The largest architectural slice containing specific domain features.
    *   `Auth/`: Authentication wrappers, login screens.
    *   `Camera/` & `Effects/`: Core of the Dual Camera system and media manipulation.
    *   `Dibs/`: The entire Booking marketplace, Operator profiles, Operator Dashboard, ticket generation.
    *   `Map/`: Geolocation components, custom MapPopups and Pickers (Leaflet).
    *   `Quest/`: Quest Cards, Creation screens, detailed views.
    *   `Profile/`: Leveling, badges, Aura history, and user settings.
    *   `ui/` & `layouts/`: Shared, generic UI tokens (Buttons, Modals, TopBars).
*   **`src/pages/`**: The top-level route aggregators (e.g., `FeedPage.tsx`, `BookPage.tsx`, `Be4LAdminHub.tsx`).
*   **`src/services/`**: Independent logic layers (e.g., `dailyService.ts` for time-tracking).
*   **`src/constants.ts`**: The absolute single source of truth for the Mock MVP environment. It contains all complex relational data (MOCK_USERS, MOCK_CAPTURES, MOCK_QUESTS, MOCK_PARTNER_POSTS) that structurally mimics how the SQL/Supabase backend will function.

---

## 7. MVP Considerations & The Path to Scalability

The current iteration relies heavily on `constants.ts` and React state mimicking a remote server. Before a mass production launch:
1.  **Backend Integration**: The entity mock models in `types.ts` strictly define the Supabase schema needed.
2.  **Native Compilation**: Execute Capacitor syncing (`npx cap sync android` / `npx cap sync ios`) frequently to test native plugin connections (like true hardware Camera APIs vs web `getUserMedia()`).
3.  **Performant 3D/Map Rendering**: Map re-rendering and 3D Canvas elements must be strictly memorized using React `useMemo` / `useCallback` to prevent memory leaks on lower-end mobile devices utilizing webviews.
