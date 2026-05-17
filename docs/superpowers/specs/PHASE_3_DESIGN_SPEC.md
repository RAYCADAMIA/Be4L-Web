# Phase 3: Auth + Profile Shell — Design Specification

**Date:** April 24, 2026  
**Phase:** 3 of 6  
**Status:** Design Approved

---

## Overview

Phase 3 implements the authentication and profile shell using a **Linktree-inspired minimal aesthetic**. The design prioritizes clarity, simplicity, and intuitive navigation while maintaining a premium feel through subtle glassmorphic components and a sophisticated color palette.

---

## Global Design System

### Color Palette

| Role | Value | Usage |
|------|-------|-------|
| **Primary Brand** | `#2dd4bf` (Teal) | CTAs, active states, accents |
| **Dark BG** | `#08080f` | Primary background |
| **Dark BG (Alt)** | `#0f0f1a` | Gradient stops |
| **Dark BG (Alt 2)** | `#0a0a14` | Gradient stops |
| **Text Primary** | `#e2e8f0` | Body text |
| **Text Light** | `#f1f5f9` | Headings |
| **Text Muted** | `rgba(255,255,255,0.3)` | Secondary labels |
| **Border** | `rgba(255,255,255,0.06-0.1)` | Card and input borders |
| **Glass** | `rgba(255,255,255,0.03-0.08)` | Glassmorphic backgrounds |

### Typography

- **Font Family:** Inter, -apple-system, sans-serif
- **Headings:** 700 weight, -0.3px letter-spacing
- **Body:** 400 weight, 0.2-0.8px letter-spacing (varies by size)
- **Labels:** 500-600 weight, 0.5-0.8px letter-spacing, uppercase

### Background Pattern

**Global Background:** Linear gradient 135deg
```
#08080f 0% → #0f0f1a 50% → #0a0a14 100%
```

**Starfield Overlay:** 9 sparse radial gradients (1px white dots at 25-55% opacity)
- Positioned at: 12%, 45%, 78%, 25%, 72%, 88%, 35%, 60%, 15% on both axes
- Creates subtle depth without visual noise

---

## Auth Page

### Layout

**Centered Single-Column Layout**
- Max-width: 420px
- Full viewport height with centered content
- Removes split panels in favor of minimal, focused design

### Components

#### Brand Section
- **Logo:** "Be4L" (28px, 800 weight, teal "Be" accent)
- **Tagline:** "Discover. DIB. Experience." (13px, rgba(255,255,255,0.4))
- **Spacing:** 48px margin-bottom

#### Category Showcase
- **Grid:** 3 columns × 2 rows
- **Pill Style:** 
  - Background: rgba(255,255,255,0.03)
  - Border: 1px rgba(255,255,255,0.06)
  - Border-radius: 12px
  - Padding: 10px 8px
  - Gap: 8px
- **Content:** Icon (18px) + text (10px, uppercase, 0.4px letter-spacing)
- **Hover State:** 
  - Background → rgba(255,255,255,0.06)
  - Border → rgba(255,255,255,0.1)
  - Color → rgba(255,255,255,0.5)
- **Margin-bottom:** 40px

#### Glassmorphic Auth Box
- **Background:** rgba(255,255,255,0.05)
- **Border:** 1px rgba(255,255,255,0.1)
- **Border-radius:** 20px
- **Padding:** 32px 28px
- **Backdrop-filter:** blur(20px)
- **Box-shadow:** 0 8px 32px rgba(0,0,0,0.35)

**Toggle (Sign In / Create Account)**
- **Background:** rgba(255,255,255,0.03)
- **Border:** 1px rgba(255,255,255,0.07)
- **Border-radius:** 10px
- **Padding:** 2px
- **Active State:** rgba(255,255,255,0.08) background, #e2e8f0 text
- **Margin-bottom:** 26px

**Title & Subtitle**
- **Title:** 20px, 700, uppercase, -0.2px letter-spacing
- **Subtitle:** 11px, rgba(255,255,255,0.25), 0.3px letter-spacing
- **Spacing:** 24px margin-bottom

**Input Fields**
- **Background:** rgba(255,255,255,0.04)
- **Border:** 1px rgba(255,255,255,0.08)
- **Border-radius:** 10px
- **Padding:** 11px 12px (left 36px for icon)
- **Icon:** 13px, left-aligned, rgba(255,255,255,0.15)
- **Focus State:**
  - Border: rgba(45,212,191,0.3)
  - Background: rgba(45,212,191,0.03)
- **Placeholder:** 10px, rgba(255,255,255,0.15), uppercase, 0.8px letter-spacing
- **Margin-bottom:** 12px

**Password Field:** Icon + eye toggle (right-aligned, 13px, rgba(255,255,255,0.15))

**Primary Button (CTA)**
- **Background:** #2dd4bf
- **Color:** #08080f
- **Border-radius:** 10px
- **Padding:** 12px
- **Font:** 13px, 700, uppercase, 0.5px letter-spacing
- **Cursor:** pointer
- **Hover:** opacity 0.92
- **Margin-top:** 6px

**Divider**
- **Display:** Flex, gap 10px
- **Lines:** 1px rgba(255,255,255,0.06)
- **Text:** 9px, rgba(255,255,255,0.15), uppercase, 0.8px letter-spacing
- **Margin:** 14px 0

**Secondary Button (Coming Soon)**
- **Background:** rgba(255,255,255,0.03)
- **Border:** 1px rgba(255,255,255,0.07)
- **Color:** rgba(255,255,255,0.3)
- **Font:** 11px, 500
- **Cursor:** not-allowed
- **Badge:** 8px, rgba(255,255,255,0.08) bg, rounded 99px, 2px 6px padding

**Guest Button**
- **Background:** rgba(255,255,255,0.04)
- **Border:** 1px rgba(255,255,255,0.08)
- **Color:** rgba(255,255,255,0.45)
- **Font:** 11px, 600, uppercase, 0.7px letter-spacing
- **Border-radius:** 10px
- **Hover:** 
  - Background → rgba(255,255,255,0.07)
  - Border → rgba(255,255,255,0.12)

**Footer**
- **Text:** 10px, rgba(255,255,255,0.2), centered
- **Link:** #2dd4bf, 600 weight
- **Margin-top:** 18px

---

## Profile Page

### Layout

**Centered Single-Column Layout**
- Max-width: 560px
- Sticky top navigation (52px height)
- Scrollable content area

### Navigation Bar

- **Height:** 52px
- **Background:** rgba(8,8,15,0.7)
- **Backdrop-filter:** blur(20px)
- **Border-bottom:** 1px rgba(255,255,255,0.05)
- **Padding:** 0 20px

**Nav Buttons**
- **Size:** 34px × 34px circular
- **Background:** rgba(255,255,255,0.05)
- **Border:** 1px rgba(255,255,255,0.08)
- **Spacing:** Back arrow (left), 3-dot menu (right)
- **Cursor:** pointer

### Avatar Section

- **Outer Ring:** 3px border, gradient (teal → purple → pink)
- **Avatar:** 86px × 86px
  - Background: gradient teal to purple
  - Border: 3px solid #08080f
  - Font: 30px, 700
- **Edit Button:** 22px × 22px, teal, 10px font, positioned bottom-right
- **Margin-bottom:** 18px

### Profile Header

**Name**
- **Font:** 21px, 700, -0.3px letter-spacing
- **Color:** #f1f5f9
- **Margin-bottom:** 6px

**Handle**
- **Font:** 13px
- **Color:** rgba(255,255,255,0.35)
- **Margin-top:** 3px

**Bio**
- **Font:** 13px, 1.55 line-height
- **Color:** rgba(255,255,255,0.45)
- **Max-width:** 340px
- **Margin:** 12px auto 22px

### Stats Row

- **Layout:** Flex center, 40px gap
- **Number:** 19px, 700, #f1f5f9
- **Label:** 10px, rgba(255,255,255,0.3), uppercase, 0.8px letter-spacing
- **Margin-bottom:** 24px
- **Stat Pair:** Followers / Following

### Edit Profile Button

- **Width:** fit-content, centered
- **Background:** rgba(255,255,255,0.07)
- **Border:** 1px rgba(255,255,255,0.1)
- **Border-radius:** 10px
- **Padding:** 9px 32px
- **Font:** 13px, 500
- **Color:** rgba(255,255,255,0.7)
- **Cursor:** pointer
- **Margin:** 0 auto 32px

### Tabs

**Tab Container**
- **Display:** Flex
- **Border-bottom:** 1px rgba(255,255,255,0.07)
- **Margin-bottom:** 20px

**Individual Tab**
- **Flex:** 1
- **Padding:** 11px 0
- **Font:** 11px, 600, uppercase, 0.6px letter-spacing
- **Color (inactive):** rgba(255,255,255,0.3)
- **Color (active):** #2dd4bf
- **Active Indicator:** 2px solid teal underline (50% width, bottom-aligned, rounded)

**Tab Content**
- **Display:** None (hide inactive)
- **Display:** Block (show active)

### Dib Cards

**Card Container**
- **Background:** rgba(255,255,255,0.03)
- **Border:** 1px rgba(255,255,255,0.06)
- **Border-radius:** 14px
- **Padding:** 13px 15px
- **Display:** Flex, align-center, gap 13px
- **Cursor:** pointer
- **Hover:**
  - Background → rgba(255,255,255,0.05)
  - Border → rgba(45,212,191,0.18)
- **Gap-bottom:** 9px

**Thumbnail**
- **Size:** 46px × 46px
- **Border-radius:** 10px
- **Background:** gradient(rgba(45,212,191,0.2), rgba(139,92,246,0.2))
- **Display:** Flex center
- **Font:** 20px emoji
- **Flex-shrink:** 0

**Info Container**
- **Flex:** 1
- **Min-width:** 0

**Brand Label**
- **Font:** 10px, rgba(255,255,255,0.3), uppercase, 0.5px letter-spacing

**Title**
- **Font:** 13px, 500, #e2e8f0
- **Margin-top:** 2px
- **Overflow:** Hidden, ellipsis
- **White-space:** Nowrap

**Date**
- **Font:** 11px, rgba(255,255,255,0.25)
- **Margin-top:** 3px

**Status Pill**
- **Padding:** 3px 9px
- **Border-radius:** 99px
- **Font:** 10px, 600
- **Flex-shrink:** 0

**Status Variants**
- **Confirmed:** teal bg, teal text, teal border
- **Pending:** yellow bg, yellow text, yellow border
- **Redeemed:** muted bg, muted text, muted border
- **Rejected:** red bg, red text, red border

### Section Label

- **Font:** 10px, rgba(255,255,255,0.25), uppercase, 0.8px letter-spacing
- **Margin-bottom:** 10px

---

## Interaction Patterns

### Tab Switching
- Click tab → toggle `.active` class
- Hide all panels, show selected panel
- Update indicator underline position

### Status Indicators
- **Confirmed:** User has booked and payment verified
- **Pending:** Booking awaiting verification
- **Redeemed:** Past experience completed
- **Rejected:** Booking failed verification

### Guest Checkout
- Bypass sign-in, access full catalog
- No booking capability until authenticated
- Prompt to create account on first booking attempt

### Settings Access
- 3-dot menu in top-right nav
- Overlay menu with logout, profile edit, notifications, support
- Not shown in current spec (Phase 4+ feature)

---

## Typography Scale

| Element | Size | Weight | Letter-spacing |
|---------|------|--------|-----------------|
| Logo | 36px | 800 | -1px |
| Page Title | 20px | 700 | -0.2px |
| Card Title | 13px | 500 | — |
| Profile Name | 21px | 700 | -0.3px |
| Stat Number | 19px | 700 | — |
| Body | 13px | 400 | — |
| Label | 11-13px | 500-600 | 0.5-0.8px |
| Badge | 10px | 600 | — |
| Tagline | 13px | 400 | 0.2px |
| Metadata | 10px | 400 | 0.3-0.8px |

---

## Spacing Grid

- **Base Unit:** 2px
- **Common:** 4px, 6px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px

---

## Animation & Transitions

| Element | Duration | Easing |
|---------|----------|--------|
| Button hover | 150ms | linear |
| Input focus | 150ms | linear |
| Tab switch | 0ms | (instant) |
| Card hover | 150ms | linear |
| Opacity changes | 150ms | linear |

---

## Implementation Notes

### Auth Page
- Single-column centered layout eliminates visual clutter
- Category showcase helps users understand platform scope
- Glassmorphic box creates depth without complexity
- Guest option provides low-friction entry point

### Profile Page
- Sticky nav allows quick access to back/menu regardless of scroll
- Avatar gradient and edit button create personal touch
- My Dibs tab shows upcoming and pending bookings
- History tab shows redemption status and past experiences
- Stats (followers/following) enable social discovery
- Teal accent color creates visual consistency with auth page

### Design Principles
1. **Minimal:** Remove all non-essential elements
2. **Clear:** Hierarchy through size, color, opacity
3. **Smart:** Intuitive placement and labeling
4. **Consistent:** Uniform component styling and spacing
5. **Premium:** Glassmorphic cards and subtle gradients elevate perception

---

## Next Steps (Phase 4+)

- Settings menu (gear icon, logout, profile edit)
- Notification system (bell icon, badge counter)
- Category/search page
- Item detail page
- Booking flow (checkout, payment)
