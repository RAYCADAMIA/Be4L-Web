# Architecture

## Technology Stack

### Frontend
- **Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: 
  - [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
  - `tailwind-merge` and `clsx` for dynamic class management.
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend / Services
- **BaaS**: [Supabase](https://supabase.com/) (Authentication, Database, Realtime)
- **Service Integration**: 
  - `supabaseService`: Handles Auth, DB interactions (Captures, Quests).
  - `audioService`: Handles audio related functionality.

## Project Structure

```
be4L v0.6/
├── components/         # Reusable UI components & Feature Screens
│   ├── Chat/          # Chat specific components
│   ├── BookScreen.tsx
│   ├── CreateQuestScreen.tsx
│   ├── ...
├── services/          # Service layers (API, Supabase)
├── docs/              # Project documentation (This folder)
├── App.tsx            # Main Application Application & Routing Logic
├── main.tsx           # Entry point
├── types.ts           # Shared TypeScript interfaces
├── constants.ts       # Global constants & Mock data
└── tailwind.config.js # Tailwind configuration
```

## Key Components

- **App.tsx**: Manages the main view state (Feed, Create, Quests, Profile) and navigation.
- **DualCameraPost**: Core component for displaying user captures.
- **CreateQuestScreen**: Multi-step wizard for creating new quests.
- **QuestDetailsScreen**: Detailed view for quest info and joining.
