**Status:** Phase 3 complete — live ISS data, real-time map tracking, orbital physics, and full state handling all working. Ready for final polish and deployment.

**Live demo:** (coming after deployment)

**Features:**
- Cinematic space scene with distant sun, starfield, and Earth's horizon
- Realistic ISS SVG that slides across the sky by real longitude
- Satellite map (Esri World Imagery) that recenters on the ISS every 5 seconds
- Live ISS coordinates from Open Notify (with WhereTheISS.at fallback)
- Real orbital physics: velocity and period computed via the vis-viva equation
- Pulsing map marker, clickable telemetry panel
- Loading, live, stale, error, and offline states handled gracefully
- Mobile-responsive layout

**Tech stack:**
- HTML, CSS, JavaScript (vanilla)
- Leaflet.js + Esri World Imagery
- Open Notify + WhereTheISS.at APIs
- Google Fonts: Space Grotesk + IBM Plex Mono