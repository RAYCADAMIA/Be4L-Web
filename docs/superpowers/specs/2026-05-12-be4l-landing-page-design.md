# Be4L Coming Soon Landing Page Design
**Date**: May 12, 2026  
**Status**: Approved

---

## Overview

A hero-focused coming soon landing page for be4l.app featuring vibrant gradients, animated visual flourishes, and interactive elements. The page tells Be4L's story of adventure and discovery while capturing email signups for launch notifications.

---

## Visual Direction

- **Style**: Vibrant Gradient (purple, pink, cyan) on dark starfield background
- **Aesthetic**: Modern, energetic, Apple-like elegance with Linktree personality
- **Feel**: Alive, interactive, immersive
- **Color Palette**:
  - **Primary Gradient**: #EC4899 (pink) → #8B5CF6 (purple) → #06B6D4 (cyan)
  - **Dark Base**: #0F172A to #1A1F3A (dark blue-black starfield)
  - **Accent**: #A78BFA (light purple) for text highlights
  - **Text**: #FFFFFF (primary), #D1D5DB (secondary)

---

## Page Structure

### Hero Section (Full Height, Centered)

**Logo**
- Be4L wordmark, prominent and centered
- Text color: Vibrant gradient (purple → pink → cyan)
- Font: Bold, large, 48-64px size
- Effect: Smooth entry animation

**Primary Tagline**
- Text: **"Chase the lore"**
- Size: 32-40px, bold
- Color: White (#FFFFFF)
- Position: Below logo, centered
- Effect: Fade in after logo

**Subtext**
- Text: **"Conquer Side Quests. Collect Lores To Tell. Discover Experiences"**
- Size: 16-18px
- Color: #D1D5DB (secondary gray)
- Position: Below primary tagline
- Line height: Relaxed for readability
- Effect: Staggered fade-in

**Email Signup Input**
- Placeholder: "your@email.com"
- Width: ~280px (desktop), responsive (mobile)
- Height: 48-56px
- Styling:
  - Border: 2px solid #8B5CF6 (purple)
  - Background: rgba(139, 92, 246, 0.1) (transparent purple tint)
  - Border radius: 8px
  - Backdrop filter: slight blur for glassmorphism effect
- Focus state: Glowing border (cyan glow), enhanced background
- Text color: White, placeholder lighter gray
- Button: Integrated (submit on Enter, or separate button)

**Launch Message**
- Text: **"Launching on a random tuesday"** (casual, playful)
- Size: 12-13px
- Color: #A78BFA (light purple)
- Position: Below email input
- Effect: Gentle pulse or animated text

### Visual Flourishes (Background)

- **Animated Glowing Orbs**: Soft circular gradients in background
  - Colors: Pink (#EC4899), Purple (#8B5CF6), Cyan (#06B6D4)
  - Opacity: 10-15% for subtlety
  - Movement: Continuous gentle float animation
  - Parallax: Slight response to cursor movement (very subtle)

- **Starfield/Particle Effect**: 
  - Twinkling stars or small particles in background
  - Creates depth and atmosphere
  - Subtle animation, low opacity

- **Overall Motion**: Everything feels alive without being distracting

### Footer (Minimal, Sticky or Absolute Bottom)

**Social Links**
- Icon links: Instagram, Twitter, TikTok (or relevant platforms)
- Styling: Icon-only, muted color (#6B7280), hover reveals gradient color
- Effects: Scale up slightly on hover, smooth transition

**Copyright/Contact**
- Text: "© 2026 Be4L" or minimal branding
- Size: 12px
- Color: #6B7280 (muted)
- Optional: "Questions? hello@be4l.app" or similar contact link

---

## Interactive Behavior

| Element | Default | Hover | Focus |
|---------|---------|-------|-------|
| Email Input | Subtle border | Glowing cyan border, enhanced glow | Same as hover |
| Social Icons | Muted gray | Gradient color, slight scale-up | Gradient color |
| Floating Orbs | Gentle float | Respond to mouse movement (parallax) | N/A |
| Overall Page | Static animations | Responsive to interactions | N/A |

---

## Animation Details

- **Logo entry**: Fade in + subtle scale (300ms)
- **Tagline entry**: Fade in (400ms, staggered 200ms after logo)
- **Subtext entry**: Fade in (400ms, staggered 200ms after tagline)
- **Email input entry**: Fade in + slide up (400ms, staggered)
- **Floating orbs**: Continuous loop animation (6-8 second cycle), responsive to cursor
- **Particles/Starfield**: Subtle twinkle, slow movement
- **Input focus glow**: Smooth color transition (200ms)
- **Social hover**: Scale 1 → 1.1, color fade (150ms)

---

## Responsive Design

- **Desktop**: Full hero hero section, centered content
- **Tablet**: Hero section adapts, input width responsive
- **Mobile**: 
  - Logo smaller (36-40px)
  - Tagline and subtext adjust size
  - Input full width with padding
  - Footer content stacked or icons only
  - Floating elements less prominent (reduced opacity)

---

## Technical Stack

- **Framework**: React + Vite
- **Styling**: Tailwind CSS + custom CSS for animations
- **Animations**: CSS animations + small JS for parallax/cursor effects (Framer Motion optional)
- **Email Service**: Integration point (TBD - could use EmailJS, Supabase, etc.)

---

## Accessibility

- Email input has proper label (visually hidden or floating label)
- Social links have aria-labels
- Color contrast meets WCAG standards
- Focus states are visible
- No animations interfere with prefers-reduced-motion

---

## Feature Flag Implementation

This page will be deployed using a feature flag:
- `.env.production`: `VITE_SHOW_LANDING_PAGE=true`
- `.env.local`: `VITE_SHOW_LANDING_PAGE=false` (for development)
- Conditional render in App.tsx or main entry point

---

## Success Criteria

- Page loads in under 2 seconds
- Animations are smooth (60fps)
- Email signup works and stores emails
- Social links point to correct profiles
- Mobile responsive and touch-friendly
- Visual hierarchy is clear
- Parallax effects enhance but don't distract
