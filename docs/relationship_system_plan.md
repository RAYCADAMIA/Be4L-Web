# Be4L — Full User Relationship System
## Implementation Plan
**Prepared:** 2026-02-22 | **Target:** MVP Launch

---

## Current Reality (Honest State)

| Feature | Frontend Code | DB Table/Column | Actually Works |
|---|---|---|---|
| Follow/Unfollow (user-user) | ✅ Written | ❌ `follows` table MISSING | ❌ |
| Mutual/Friends detection | ✅ Written | ❌ depends on `follows` | ❌ |
| Follow status check | ✅ Written | ❌ | ❌ |
| Friends-only quest filter | ✅ Written | ❌ | ❌ |
| Friends feed filter | ✅ Written | ❌ | ❌ |
| Operator follow | ❌ Stubbed (returns `true`) | ❌ | ❌ |
| `followers_count` on profiles | ✅ Type + UI | ❌ Column not in DB | ❌ |
| `following_count` on profiles | ✅ Type + UI | ❌ Column not in DB | ❌ |
| `increment_followers` RPC | ✅ Called in code | ❌ Function doesn't exist | ❌ |
| `increment_following` RPC | ✅ Called in code | ❌ Function doesn't exist | ❌ |
| Followers list modal | ❌ State exists, no UI | N/A | ❌ |
| Following list modal | ❌ State exists, no UI | N/A | ❌ |
| User Search (People) | ❌ Search only queries mocks | N/A | ❌ |
| Follow from Search results | ❌ | N/A | ❌ |

---

## Architecture Decision

We use a **single unified `follows` table** for BOTH user-user and user-operator relationships.
- `follower_id` = always a `profiles.id` (UUID)
- `following_id` = either a `profiles.id` (user) OR `operators.user_id` (operator/brand)
- `type` column differentiates: `'user'` | `'operator'`

**"Friends" = derived concept** — not a separate table. Two users who mutually follow each other are friends. The `getMutualFollows()` function already implements this correctly.

No friend requests. No blocking. Just clean follow/unfollow with mutual detection. This is the right model for Be4L.

---

## Phase 1 — Database (Supabase) 
**No code changes. Pure SQL migrations.**

### Step 1A — Create `follows` table

```sql
CREATE TABLE public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL, -- TEXT to support both UUID users and operator IDs
  type TEXT NOT NULL DEFAULT 'user' CHECK (type IN ('user', 'operator')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (follower_id, following_id) -- prevent duplicate follows
);

-- Indexes for fast lookups
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_follows_type ON public.follows(type);
```

### Step 1B — Add count columns to `profiles`

```sql
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0 NOT NULL;
```

### Step 1C — Create RPC functions for atomic counter updates

```sql
-- Increment followers on the target user
CREATE OR REPLACE FUNCTION increment_followers(user_id UUID)
RETURNS VOID AS $$
  UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Decrement followers (floor at 0)
CREATE OR REPLACE FUNCTION decrement_followers(user_id UUID)
RETURNS VOID AS $$
  UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Increment following count on the actor
CREATE OR REPLACE FUNCTION increment_following(user_id UUID)
RETURNS VOID AS $$
  UPDATE public.profiles SET following_count = following_count + 1 WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Decrement following count on the actor
CREATE OR REPLACE FUNCTION decrement_following(user_id UUID)
RETURNS VOID AS $$
  UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;
```

### Step 1D — Enable RLS on `follows` table

```sql
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Anyone can see follow relationships (public social graph)
CREATE POLICY "follows_select" ON public.follows
  FOR SELECT USING (true);

-- Users can only create follows as themselves
CREATE POLICY "follows_insert" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can only delete their own follows
CREATE POLICY "follows_delete" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);
```

---

## Phase 2 — Service Layer (`supabaseService.ts`)
**Update `profiles` namespace + add new service functions.**

### Step 2A — Fix `followUser` (user → user)
Already written correctly. Just needs the DB to exist. Verify it:
- Inserts into `follows` with `type: 'user'`
- Calls `increment_following` on follower
- Calls `increment_followers` on the target
- Returns `true` on duplicate (error code `23505` = already following, that's correct)

**Action:** ✅ No change needed. DB creation in Phase 1 fixes it.

### Step 2B — Fix `unfollowUser` (user → user)
Already written correctly. Just needs the DB.
**Action:** ✅ No change needed.

### Step 2C — Replace `followOperator` stub

Current (broken):
```ts
followOperator: async (id: string) => true,   // stub
unfollowOperator: async (id: string) => true,  // stub
```

Replace with real implementation:
```ts
followOperator: async (operatorId: string): Promise<boolean> => {
  const { data: { user: au } } = await supabase.auth.getUser();
  if (!au) return false;
  const { error } = await supabase.from('follows').insert({
    follower_id: au.id,
    following_id: operatorId,
    type: 'operator'
  });
  if (!error) {
    await supabase.rpc('increment_following', { user_id: au.id });
  }
  return !error || error.code === '23505'; // 23505 = already following
},

unfollowOperator: async (operatorId: string): Promise<boolean> => {
  const { data: { user: au } } = await supabase.auth.getUser();
  if (!au) return false;
  const { error } = await supabase.from('follows').delete()
    .match({ follower_id: au.id, following_id: operatorId, type: 'operator' });
  if (!error) {
    await supabase.rpc('decrement_following', { user_id: au.id });
  }
  return !error;
},

getOperatorFollowStatus: async (operatorId: string): Promise<boolean> => {
  const { data: { user: au } } = await supabase.auth.getUser();
  if (!au) return false;
  const { data } = await supabase.from('follows').select('id')
    .match({ follower_id: au.id, following_id: operatorId, type: 'operator' }).single();
  return !!data;
},
```

### Step 2D — Add `getFollowersList` and `getFollowingList`

These are needed for the followers/following modal. Add to `profiles` namespace:

```ts
getFollowersList: async (uid: string): Promise<User[]> => {
  if (!isValidUUID(uid)) return OTHER_USERS.slice(0, 3); // mock fallback
  const { data } = await supabase
    .from('follows')
    .select('follower:profiles!follower_id(*)')
    .eq('following_id', uid)
    .eq('type', 'user')
    .order('created_at', { ascending: false });
  return ((data || []).map((d: any) => d.follower).filter(Boolean)) as User[];
},

getFollowingList: async (uid: string): Promise<User[]> => {
  if (!isValidUUID(uid)) return OTHER_USERS.slice(0, 2); // mock fallback
  const { data } = await supabase
    .from('follows')
    .select('profile:profiles!following_id(*)')
    .eq('follower_id', uid)
    .eq('type', 'user')
    .order('created_at', { ascending: false });
  return ((data || []).map((d: any) => d.profile).filter(Boolean)) as User[];
},
```

### Step 2E — Add `searchUsers` to service

Currently `SearchScreen.tsx` only queries mocks. Add real user search:

```ts
searchUsers: async (query: string): Promise<User[]> => {
  if (!query || query.length < 2) return [];
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(20);
  return (data || []) as User[];
},
```

---

## Phase 3 — UI Components

### Step 3A — `UserListModal` (New Reusable Component)
**File:** `components/UserListModal.tsx`

A reusable modal that displays a list of users (used for both Followers and Following views). Each row shows:
- Avatar
- Name + @handle
- "Follow / Following" button (for non-self entries)
- Tapping a row opens that user's profile

**Props interface:**
```ts
interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // "Followers" | "Following"
  userId: string;
  type: 'followers' | 'following';
  currentUserId?: string;
  onOpenProfile: (user: User) => void;
}
```

**Behavior:**
- Fetches the list on open via `supabaseService.profiles.getFollowersList()` or `getFollowingList()`
- Shows a loading skeleton while fetching
- Shows empty state if no results
- Follow button in each row calls `followUser` / `unfollowUser`

### Step 3B — Wire `UserListModal` into `ProfileScreen.tsx`

`ProfileScreen.tsx` already has `showFollowers` and `showFollowing` state, and `onShowFollowers` / `onShowFollowing` handlers are already passed to `ProfileHeader`. 

**Action:** Import `UserListModal` and render it conditionally:
```tsx
<UserListModal
  isOpen={showFollowers}
  onClose={() => setShowFollowers(false)}
  title="Followers"
  userId={user.id}
  type="followers"
  currentUserId={currentUserId}
  onOpenProfile={(u) => onOpenUser?.(u)}
/>
<UserListModal
  isOpen={showFollowing}
  onClose={() => setShowFollowing(false)}
  title="Following"
  userId={user.id}
  type="following"
  currentUserId={currentUserId}
  onOpenProfile={(u) => onOpenUser?.(u)}
/>
```

### Step 3C — Operator Follow Button in `OperatorProfileScreen`
**File:** `components/Dibs/OperatorProfileScreen.tsx`

Currently no follow button on the operator's public profile view. Add:
- `isFollowing` state initialized by `getOperatorFollowStatus()`  
- A Follow button in the top action area (below hero banner)
- `followers_count` pulled from operator data and shown
- Real-time UI update on click (optimistic update)

### Step 3D — Upgrade `SearchScreen` to Search Real Users
**File:** `components/SearchScreen.tsx`

Add a "People" tab to search results that queries real users from `supabaseService.profiles.searchUsers()`. Each result card shows:
- Avatar, name, @handle, Aura score
- Follow button (inline)
- Tap to open profile

---

## Phase 4 — Enforcement / Logic Gates

### Step 4A — Friends-Only Quest Visibility (Fix)
**File:** `supabaseService.ts` → `quests.getQuests()`

Currently all discoverable quests are shown. For `visibility_scope: 'FRIENDS'`, the quest should only appear in the feed of mutual followers.

The fix: After fetching discoverable quests, filter out friends-only ones where `currentUserMutuals` doesn't include the `host_id`:

```ts
// After fetching quests...
const friendIds = await supabaseService.profiles.getMutualFollows(cid);
return quests.filter(q => {
  if (q.visibility_scope === QuestVisibilityScope.FRIENDS) {
    return friendIds.includes(q.host_id);
  }
  return true;
});
```

### Step 4B — Friends-Only Lore Feed (Fix)
**File:** `supabaseService.ts` → `captures.getFeed()`

When `type === 'friends'`, the feed currently doesn't filter properly. After fixing the `follows` table:

```ts
if (type === 'friends') {
  const friendIds = await supabaseService.profiles.getMutualFollows(cid);
  return all.filter(c => friendIds.includes(c.user_id) || c.user_id === cid);
}
```

---

## Implementation Order (Recommended)

```
Day 1 (Today):
├── Phase 1A — Create `follows` table in Supabase  ← 5 min
├── Phase 1B — Add followers/following columns     ← 2 min  
├── Phase 1C — Create 4 RPC functions              ← 5 min
├── Phase 1D — Enable RLS                          ← 3 min
├── Phase 2C — Fix operator follow stubs           ← 15 min
├── Phase 2D — Add getFollowersList/getFollowingList ← 20 min
├── Phase 2E — Add searchUsers                     ← 10 min
├── Phase 3A — Build UserListModal component       ← 45 min
├── Phase 3B — Wire UserListModal into ProfileScreen ← 15 min
├── Phase 3C — Operator Follow Button              ← 30 min
├── Phase 3D — Upgrade SearchScreen                ← 30 min
├── Phase 4A — Friends-only quest gate             ← 15 min
└── Phase 4B — Friends-only feed filter            ← 10 min

Total estimated time: ~3.5 hours
```

---

## What We Are Explicitly NOT Building (Kept Clean for Later)

- ❌ **Friend requests / pending state** — mutual follow model is cleaner for Be4L
- ❌ **Blocking / reporting** — post-launch
- ❌ **Follow notifications** (push/in-app) — post-launch  
- ❌ **Suggested friends / people you may know** — post-launch
- ❌ **Follow activity feed** (X-style "X followed Y") — post-launch

---

## Files to be Modified

| File | What Changes |
|---|---|
| Supabase (SQL) | Create `follows` table, add columns, create 4 RPCs, enable RLS |
| `services/supabaseService.ts` | Fix operator stubs, add `getFollowersList`, `getFollowingList`, `searchUsers` |
| `components/ProfileScreen.tsx` | Wire in `UserListModal` for followers/following |
| `components/Dibs/OperatorProfileScreen.tsx` | Add follow button + real follow count |
| `components/SearchScreen.tsx` | Add People tab, real user search, follow from search |
| `components/UserListModal.tsx` | **NEW FILE** — reusable follower/following list |

Total: **1 new file + 5 file modifications + 4 SQL operations**
