# ISS Tracker

A cinematic live tracker for the International Space Station — real-time telemetry on a satellite view of Earth.

**Status:** Phase 2 complete — scene, satellite map, and telemetry panel built. Live data wiring begins in Phase 3.

**Live demo:** (coming after Phase 3)

**Tech stack:**
- HTML, CSS, JavaScript (vanilla)
- Leaflet.js + Esri World Imagery satellite tiles
- Open Notify / WhereTheISS.at APIs (Phase 3)
- Google Fonts: Space Grotesk + IBM Plex Mono

**Features so far:**
- Cinematic space scene with distant sun, starfield, and Earth's horizon curve
- Realistic ISS SVG floating in the sky, clickable
- Full-color satellite map centered on a test coordinate
- Pulsing cyan marker on the map
- Compact telemetry panel opens on ISS click, styled with the space palette

**Known limitations:**
- Marker is at a static test coordinate; live coordinates arrive in Phase 3
- Tab throttling in background tabs will slow the update loop once Phase 3 begins — expected browser behavior

**What's next:**
- Phase 3: live fetch loop, real ISS coordinates, sliding marker
- Phase 4: physics calculations (speed, altitude, orbital period) displayed live
- Phase 5: final styling polish, favicon, README screenshots
- Phase 6: cross-device testing
- Phase 7: GitHub Pages deployment