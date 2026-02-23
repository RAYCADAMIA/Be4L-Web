# Implementation Plan: 3-Tier Quest Visibility

## Objective
Implement a multi-tier visibility system for quests: **Public**, **Followers**, and **Friends (Mutuals)**. This includes updating the data model, filtering logic, and the Quest Creation UI.

---

## 1. Data Model & Types
Update `QuestVisibilityScope` in `types.ts` to include the new tier.

- **File**: `types.ts`
- **Changes**:
  ```tsx
  export enum QuestVisibilityScope {
    PUBLIC = 'public',
    FOLLOWERS = 'followers',
    FRIENDS = 'friends'
  }
  ```

---

## 2. Service Layer Logic
Update `getQuests` in `supabaseService.ts` to handle the new filtering tier.

- **Logic**:
  - **Public**: Visible to everyone.
  - **Followers**: Visible if `currentUserId` follows `hostId`.
  - **Friends**: Visible if `currentUserId` and `hostId` follow each other mutually.
- **File**: `services/supabaseService.ts`
- **Actions**:
  - Add `getFollowerIds(uid)` to `profiles` service to fetch IDs of people the user follows.
  - Update `getQuests` filter block to check the user's relationship with the host.

---

## 3. Quest Creation UI (Stage 3)
Add a specialized control for visibility selection.

- **File**: `components/CreateQuestScreen.tsx`
- **UI Element**: A 3-option card-based selector or segmented control in Stage 3.
- **Fields**:
  - `PUBLIC`: "Visible to the entire sector."
  - `FOLLOWERS`: "Broadcasted to your followers."
  - `FRIENDS`: "Private to mutual follows only."

---

## 4. Quest Discovery UI (Cards)
Visual indicators to let users know *why* they are seeing a specific quest.

- **File**: `components/QuestCard.tsx`
- **Actions**:
  - Add a small icon/badge next to the category for constrained visibility.
  - `{scope === 'friends' && <Shield size={10} />} {scope === 'followers' && <Signal size={10} />}`

---

## 5. Security Check (Quest Overlay)
Ensure that even if someone has a direct link to a quest ID, the overlay will deny access if they don't meet the visibility requirements.

- **File**: `components/Quest/QuestOverlay.tsx`
- **Action**: Add a visibility check after the initial quest fetch. If requirements aren't met, show a "Confidential / Restricted Access" state.

---

## Implementation Phases
1. **Phase 1**: Type & DB Schema alignment (Updating Enum and Quest object).
2. **Phase 2**: Service layer updates (Relationship-based filtering).
3. **Phase 3**: Quest Creation UI (Adding the 3-tier selector).
4. **Phase 4**: Discovery Feed & Overlay polish.
