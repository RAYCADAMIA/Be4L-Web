# Walkthrough: Geolocation & Map Integration

## Overview
We have integrated real GPS geolocation into the capture flow and added a map popup to view locations on posts.

## Changes

### 1. Types Update
- Updated `Capture` interface in `types.ts` to include `location_coords` ({ latitude, longitude }).

### 2. Capture Flow (App.tsx)
- Replaced mock location detection with `navigator.geolocation.getCurrentPosition`.
- Added reverse geocoding using OpenStreetMap (Nominatim) to fetch a city/area name.
- Falls back to coordinates or "Generic Location" if geocoding fails.
- Persists both the name and coordinates when a post is created.

### 3. Feed & Map View (DualCameraPost.tsx)
- Added a `showMap` state to the post component.
- clicking the location chip now opens a Map Modal.
- The modal uses an embeddable OpenStreetMap `iframe` centered on the capture's coordinates.
- Added a button to open external maps (Google Maps) for navigation.

## How to Test
1. **Capture**:
   - Open the Camera (`+` button).
   - Take a picture.
   - Click the "Location" icon button (Map Pin).
   - Allow location permission if prompted by the browser.
   - Verify it says "Detecting..." and then updates to your current city or area name.

2. **Feed**:
   - After posting, scroll to your new post.
   - Click the location chip (e.g., "Davao City").
   - A popup should appear showing a map pinned to that location.
   - Click "Open Maps" to verify the external link.
