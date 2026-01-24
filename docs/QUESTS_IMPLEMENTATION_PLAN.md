# Quest Page Implementation Plan

## Overview
Enhance the Quests Page to differentiate between user-created "Side Quests" and system-generated "Spontaneous Canon" events, aiming for a dynamic and "alive" feel.

## Key Features

### 1. Sponty Canon (Spontaneous Canon Events)
**Definition**: High-priority, system-generated events that appear natively in the feed/list. These are "Main Character" moments that everyone is alerted to.
- **Logic**: 
  - Enhance `questGenerator.ts` to output "Canon" quests.
  - Trigger randomly or on a schedule (e.g., "Flash Mob", "Sunset Chaser").
- **UI**: 
  - Distinct visual style (Gold/Glowing border).
  - "CANON EVENT" or "HAPPENING NOW" badge.
  - Pinned or prioritized at the top of the list.

### 2. Random Quest Generator 2.0
**Definition**: Improve the existing generator to create more varied and realistic content.
- **Improvements**:
  - More diverse categories and titles.
  - Realistic time-offsets (e.g., "Starting in 15 mins").
  - Auto-fill "participants" to make them look active/filling up fast.

### 3. Side Quests (User Generated)
**Definition**: Standard user-hosted activities.
- **UI**: 
  - Clean, card-based layout (already existing, but refine).
  - Clear distinction from Canon events.

## Technical Tasks
1.  **Modify `Quest` Type**: Add `is_canon` boolean field.
2.  **Update `questGenerator.ts`**: Implement logic to tag certain generated quests as `is_canon: true`.
3.  **Update `QuestCard.tsx`**: Add conditional styling for Canon events.
4.  **Update `QuestsScreen.tsx`**: Separate or sort the list to prioritize Canon events.
