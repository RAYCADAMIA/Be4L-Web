# Be4L Coming Soon Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a vibrant gradient hero landing page with email signup, animated flourishes, and social links. Deploy to production using a feature flag while keeping the existing app codebase safe.

**Architecture:** Create a standalone `LaunchLanding` component that conditionally renders at the App level based on a `VITE_SHOW_LANDING_PAGE` environment variable. The component uses Tailwind CSS + custom CSS animations for parallax/float effects. Email submissions are stored via Supabase (using existing service). Feature flag enables zero-downtime switching between landing page and full app.

**Tech Stack:** React, Vite, Tailwind CSS, CSS animations, Supabase (for email storage)

---

## File Structure

**Create:**
- `components/Landing/LaunchLanding.tsx` — Main landing page component
- `components/Landing/AnimatedOrbs.tsx` — Animated background orbs with parallax
- `components/Landing/SocialLinks.tsx` — Social links footer
- `styles/landing-animations.css` — Keyframe animations and transitions
- `.env.local` — Local development (flag = false)
- `.env.production` — Production (flag = true)

**Modify:**
- `App.tsx` — Add feature flag conditional rendering at root level
- `services/supabaseService.ts` — Add function to store landing page email signups
- `types.ts` — Add types for landing page email subscriptions

---

## Tasks

### Task 1: Set Up Feature Flag Infrastructure

**Files:**
- Modify: `App.tsx`
- Create: `.env.local`
- Create: `.env.production`

- [ ] **Step 1: Create .env.local**

Create file `c:\Users\Acer\Desktop\Be4L-Web\.env.local`:
```
VITE_SHOW_LANDING_PAGE=false
```

- [ ] **Step 2: Create .env.production**

Create file `c:\Users\Acer\Desktop\Be4L-Web\.env.production`:
```
VITE_SHOW_LANDING_PAGE=true
```

- [ ] **Step 3: Modify App.tsx to check feature flag**

Open `c:\Users\Acer\Desktop\Be4L-Web\App.tsx` (or main entry point that renders your app). At the top level of the App component, add:

```tsx
import { LaunchLanding } from './components/Landing/LaunchLanding'

export function App() {
  const showLanding = import.meta.env.VITE_SHOW_LANDING_PAGE === 'true'
  
  if (showLanding) {
    return <LaunchLanding />
  }
  
  // Your existing app code continues here
  return (
    // ... existing app JSX
  )
}
```

- [ ] **Step 4: Verify locally**

Run: `npm run dev`
Expected: App loads normally (landing page should NOT show because VITE_SHOW_LANDING_PAGE=false)

- [ ] **Step 5: Commit**

```bash
git add .env.local .env.production App.tsx
git commit -m "feat: add feature flag infrastructure for landing page"
```

---

### Task 2: Add Email Subscription Type & Supabase Function

**Files:**
- Modify: `types.ts`
- Modify: `services/supabaseService.ts`

- [ ] **Step 1: Add type to types.ts**

Open `c:\Users\Acer\Desktop\Be4L-Web\types.ts` and add:

```typescript
export interface LaunchEmailSignup {
  id?: string
  email: string
  created_at?: string
  source?: 'landing_page'
}
```

- [ ] **Step 2: Add Supabase function for email signup**

Open `c:\Users\Acer\Desktop\Be4L-Web\services\supabaseService.ts` and add this function at the end:

```typescript
export async function addLandingPageEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('landing_signups')
      .insert([{ email, source: 'landing_page' }])
      .select()

    if (error) {
      console.error('Error saving landing page email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error saving email:', err)
    return { success: false, error: 'Failed to save email' }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add types.ts services/supabaseService.ts
git commit -m "feat: add landing page email signup type and Supabase function"
```

---

### Task 3: Create Animated Orbs Background Component

**Files:**
- Create: `components/Landing/AnimatedOrbs.tsx`
- Create: `styles/landing-animations.css`

- [ ] **Step 1: Create landing-animations.css**

Create file `c:\Users\Acer\Desktop\Be4L-Web\styles\landing-animations.css`:

```css
/* Floating orb animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
}

@keyframes floatSlow {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-15px) translateX(-8px);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
}

.orb-1 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%);
  top: 20%;
  right: 10%;
  animation: float 6s ease-in-out infinite;
}

.orb-2 {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  bottom: 20%;
  left: 5%;
  animation: floatSlow 8s ease-in-out infinite;
}

.orb-3 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
  top: 50%;
  left: 15%;
  animation: float 7s ease-in-out infinite;
  animation-delay: 1s;
}

.starfield {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

.hero-content {
  animation: fadeInUp 0.8s ease-out;
}

.hero-content-stagger-1 {
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.hero-content-stagger-2 {
  animation: fadeInUp 0.8s ease-out 0.4s backwards;
}

.hero-content-stagger-3 {
  animation: fadeInUp 0.8s ease-out 0.6s backwards;
}

@media (prefers-reduced-motion: reduce) {
  .orb,
  .star,
  .hero-content,
  .hero-content-stagger-1,
  .hero-content-stagger-2,
  .hero-content-stagger-3 {
    animation: none !important;
  }
}
```

- [ ] **Step 2: Create AnimatedOrbs.tsx**

Create file `c:\Users\Acer\Desktop\Be4L-Web\components\Landing\AnimatedOrbs.tsx`:

```tsx
import React, { useState, useEffect } from 'react'

interface StarPosition {
  id: number
  left: number
  top: number
  delay: number
}

export function AnimatedOrbs() {
  const [stars, setStars] = useState<StarPosition[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Generate random stars
    const starArray = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
    }))
    setStars(starArray)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      {/* Starfield background */}
      <div className="starfield">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Animated orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </>
  )
}
```

- [ ] **Step 3: Import the CSS in App.tsx or main entry**

Open `c:\Users\Acer\Desktop\Be4L-Web\App.tsx` and add near the top:

```tsx
import '../styles/landing-animations.css'
```

- [ ] **Step 4: Commit**

```bash
git add components/Landing/AnimatedOrbs.tsx styles/landing-animations.css App.tsx
git commit -m "feat: add animated orbs and starfield background"
```

---

### Task 4: Create Social Links Component

**Files:**
- Create: `components/Landing/SocialLinks.tsx`

- [ ] **Step 1: Create SocialLinks.tsx**

Create file `c:\Users\Acer\Desktop\Be4L-Web\components\Landing\SocialLinks.tsx`:

```tsx
export function SocialLinks() {
  const socialLinks = [
    { name: 'Instagram', url: 'https://instagram.com/be4l.app', icon: '📸' },
    { name: 'Twitter', url: 'https://twitter.com/be4l_app', icon: '𝕏' },
    { name: 'TikTok', url: 'https://tiktok.com/@be4l.app', icon: '🎵' },
  ]

  return (
    <div className="flex gap-6 justify-center items-center">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          className="text-gray-500 hover:text-transparent hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-cyan-400 hover:bg-clip-text transition-colors duration-150 transform hover:scale-110"
        >
          <span className="text-2xl">{link.icon}</span>
        </a>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Landing/SocialLinks.tsx
git commit -m "feat: add social links component"
```

---

### Task 5: Create Main Landing Page Component

**Files:**
- Create: `components/Landing/LaunchLanding.tsx`

- [ ] **Step 1: Create LaunchLanding.tsx**

Create file `c:\Users\Acer\Desktop\Be4L-Web\components\Landing\LaunchLanding.tsx`:

```tsx
import React, { useState } from 'react'
import { AnimatedOrbs } from './AnimatedOrbs'
import { SocialLinks } from './SocialLinks'
import { addLandingPageEmail } from '../../services/supabaseService'

export function LaunchLanding() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email.trim()) {
      setError('Please enter a valid email')
      setLoading(false)
      return
    }

    const result = await addLandingPageEmail(email)

    if (result.success) {
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 5000)
    } else {
      setError(result.error || 'Failed to save email. Try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Animated background */}
      <AnimatedOrbs />

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-2xl">
        {/* Logo */}
        <h1 className="hero-content text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
          Be4L
        </h1>

        {/* Primary tagline */}
        <h2 className="hero-content-stagger-1 text-4xl md:text-5xl font-bold text-white mb-6">
          Chase the lore
        </h2>

        {/* Subtext */}
        <p className="hero-content-stagger-2 text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
          Conquer Side Quests. Collect Lores To Tell. Discover Experiences
        </p>

        {/* Email signup form */}
        <form onSubmit={handleSubmit} className="hero-content-stagger-3 mb-12">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="px-6 py-4 rounded-lg bg-purple-900/20 border-2 border-purple-500 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm w-full sm:w-auto"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Saving...' : 'Notify Me'}
            </button>
          </div>

          {/* Status messages */}
          {submitted && (
            <p className="mt-4 text-cyan-400 text-sm animate-pulse">
              ✓ Thanks! We'll let you know when we launch.
            </p>
          )}
          {error && (
            <p className="mt-4 text-red-400 text-sm">
              {error}
            </p>
          )}
        </form>

        {/* Launch message */}
        <p className="hero-content-stagger-3 text-purple-400 text-sm animate-pulse">
          Launching on a random tuesday
        </p>
      </div>

      {/* Footer with social links */}
      <div className="absolute bottom-8 w-full flex flex-col items-center gap-6">
        <SocialLinks />
        <p className="text-gray-600 text-xs">© 2026 Be4L</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test locally**

Run: `npm run dev`
Expected: App still shows normal app (landing page hidden by feature flag)

- [ ] **Step 3: Test feature flag by temporarily enabling it**

Open `.env.local` and change to:
```
VITE_SHOW_LANDING_PAGE=true
```

Run: `npm run dev` (you may need to restart)
Expected: Landing page shows with logo, tagline, email input, social links

Change it back to `false` after testing:
```
VITE_SHOW_LANDING_PAGE=false
```

- [ ] **Step 4: Commit**

```bash
git add components/Landing/LaunchLanding.tsx
git commit -m "feat: create main landing page component with email signup"
```

---

### Task 6: Create Supabase Table for Email Signups

**Files:**
- N/A (database schema change)

- [ ] **Step 1: Create table in Supabase**

Go to your Supabase dashboard → SQL Editor and run:

```sql
CREATE TABLE IF NOT EXISTS landing_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  source TEXT DEFAULT 'landing_page',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_landing_signups_email ON landing_signups(email);
```

- [ ] **Step 2: Enable Row Level Security (optional but recommended)**

In Supabase dashboard → landing_signups table → RLS → Enable RLS

Add policy:
```sql
CREATE POLICY "Allow public inserts" ON landing_signups
FOR INSERT WITH CHECK (true);
```

- [ ] **Step 3: Verify table is accessible**

No commit needed (database schema is managed separately), but document this step in your deployment notes.

---

### Task 7: Test Email Signup Flow End-to-End

**Files:**
- N/A (testing only)

- [ ] **Step 1: Test with feature flag disabled**

Ensure `.env.local` has:
```
VITE_SHOW_LANDING_PAGE=false
```

Run: `npm run dev`
Expected: App loads normally, no landing page visible

- [ ] **Step 2: Test with feature flag enabled locally**

Change `.env.local` to:
```
VITE_SHOW_LANDING_PAGE=true
```

Restart dev server (may need hard refresh)
Expected: Landing page displays

- [ ] **Step 3: Test email submission**

Enter an email (e.g., test@example.com) and click "Notify Me"
Expected: Success message appears ("Thanks! We'll let you know when we launch")

- [ ] **Step 4: Verify email in Supabase**

Go to Supabase dashboard → landing_signups table
Expected: New row with your test email visible

- [ ] **Step 5: Test error handling**

Try submitting without an email
Expected: Error message ("Please enter a valid email")

- [ ] **Step 6: Test responsive design**

Open DevTools (F12) → Toggle device toolbar
Test at: 320px (mobile), 768px (tablet), 1024px+ (desktop)
Expected: Layout responsive, readable at all sizes, no broken elements

- [ ] **Step 7: Revert feature flag for final commit**

Change `.env.local` back to:
```
VITE_SHOW_LANDING_PAGE=false
```

Restart dev server to verify app loads normally.

---

### Task 8: Build for Production & Verify Feature Flag

**Files:**
- Verify: `.env.production` has `VITE_SHOW_LANDING_PAGE=true`

- [ ] **Step 1: Build production bundle**

Run: `npm run build`
Expected: Build completes without errors, output in `dist/`

- [ ] **Step 2: Preview production build locally**

Run: `npm run preview`
Expected: Opens preview server (usually http://localhost:4173)
Navigate to URL and verify:
- Landing page displays (feature flag = true in .env.production)
- Animations smooth
- Email signup works
- No console errors

- [ ] **Step 3: Test email submission in preview**

Enter test email and submit
Expected: Email saves successfully (should appear in Supabase)

- [ ] **Step 4: Commit final state**

```bash
git status
git add -A
git commit -m "feat: complete landing page implementation with animations and email signup"
```

---

### Task 9: Deployment to be4l.app

**Files:**
- N/A (deployment configuration)

- [ ] **Step 1: Push code to remote**

Run: `git push origin main`
Expected: Code pushes successfully

- [ ] **Step 2: Deploy to production**

Trigger your deployment (Vercel/Netlify/Railroad):
- Vercel: Auto-deploys on push to main
- Netlify: Manual trigger or auto-deploy depending on setup
- Railway/Render: Manual or auto-deploy

Expected: Build completes, site live at be4l.app

- [ ] **Step 3: Verify live site**

Navigate to `https://be4l.app` in browser
Expected:
- Landing page displays (vibrant gradient, animated orbs)
- Logo and taglines visible
- Email input responsive and functional
- Social links work and open in new tabs
- No console errors in DevTools

- [ ] **Step 4: Test production email submission**

Enter test email on live site
Expected: Email saves to Supabase, success message displays

- [ ] **Step 5: Monitor**

Watch Supabase for incoming signups, monitor site performance
Expected: Site responsive, emails saving correctly

---

## Self-Review

**Spec Coverage:**
- ✓ Hero-focused layout with centered content
- ✓ Vibrant gradient (purple, pink, cyan) background
- ✓ Animated starfield/particles
- ✓ Logo with gradient text
- ✓ Tagline "Chase the lore" + subtext
- ✓ Email signup input with glow effect
- ✓ "Launching on a random tuesday" text
- ✓ Social links footer
- ✓ Animated floating orbs (parallax)
- ✓ Interactive hover effects
- ✓ Feature flag for production deployment
- ✓ Responsive design (mobile/tablet/desktop)
- ✓ Accessibility (prefers-reduced-motion)

**Placeholders:** None found

**Type Consistency:** LaunchEmailSignup type defined, supabase function uses it, component imports correctly

**Gaps:** None identified
