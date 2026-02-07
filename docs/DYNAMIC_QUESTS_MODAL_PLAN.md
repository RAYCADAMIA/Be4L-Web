# Plan: Dynamic Quest Modal Refactor

## Objective
TRANSFORM the full-screen Quest Details page into a **sleek, high-performance Modal Overlay**. 
This combines the **rich functionality** of the current detail screen (Tabs, Map, Squad Management) with the **minimalistic, streamlined UX** of the previous popup.

## The Vision
Instead of navigating explicitly to a new page, clicking a quest card will instant-load a **"Floating Command Center"** over your current feed. 

### Key Design Transitions
| Feature | Current (Full Page) | Target (Modal Overlay) |
| :--- | :--- | :--- |
| **Context** | User leaves the feed (Navigates away) | **User stays in flow** (Overlay on top of Home/Feed) |
| **Container** | Full viewport width/height | Compact, centered **Glass Card** (Max-width: `4xl`, Height: `85vh`) |
| **Navigation** | Browser Back Button | **One-click Close (`X`)** or Click-outside to dismiss |
| **Layout** | Sprawling 2-column grid | **Smart Vertical Stack** or **Compact Split** with sticky actions |
| **Experience** | "Web Page" feel | **"App-like" Control Panel** feel |

## Technical Implementation Steps

### 1. Revert Navigation Logic
We will switch the trigger back to using URL Search Params. This allows the modal to open immediately without a route change, preserving the background scroll position.
- **Action**: Update `HomePage.tsx` and `QuestPage.tsx`.
- **Change**: `navigate('/app/quest/123')`  -> `setSearchParams({ quest: '123' })`.

### 2. Supercharge `QuestOverlay.tsx`
We will migrate the logic from `QuestDetailScreen` into `QuestOverlay`.
- **Import Logic**: Bring over `tabs` state (Briefing, Plan, Essentials), `joinState`, and the `SmartMap` integration.
- **Structure**:
    - **Header**: Compact sticky header with Title, Host Avatar, and Live Indicator.
    - **Scrollable Body**: 
        - **Hero Section**: Description & Time/Place summary.
        - **Immersive Tabs**: The same 3-tab system (Briefing, Itinerary, Checklist).
    - **Footer**: A "floating" action dock at the bottom for the **Join/Start** button.

### 3. Aesthetic Refinements (The "Minimalistic" Touch)
- **Dimensions**: Constrain the modal to look like a pro-tool floating on the screen.
- **Backdrop**: Deep blurred `bg-black/60` to dim the noise behind.
- **Typography**: Tighter hierarchies. Smaller, punchier fonts.
- **Transitions**: Smooth `AnimatePresence` pop-in/pop-out scale effect.

## End Result
You get the best of both worlds:
- **Rich Data**: Full itinerary, map, and squad lists are still there.
- **Fast UX**: No page loads. Open, check details, join, close—all without losing your scroll position on the feed.

---
**Status**: Ready to execute. Awaiting your signal to begin the refactor.
