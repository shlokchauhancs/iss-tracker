console.log("Phase 2.3 — starfield loaded");

/* ---------- Starfield ---------- */
function generateStars() {
  const container = document.getElementById("stars");
  if (!container) return;

  // Cap the count for mobile performance
  const isMobile = window.innerWidth < 600;
  const count = isMobile ? 80 : 150;

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";

    // Random size between 0.5px and 2.2px
    const size = Math.random() * 1.7 + 0.5;

    // Random position across the space zone
    const top = Math.random() * 100;
    const left = Math.random() * 100;

    // Random brightness (opacity baseline)
    const baseOpacity = Math.random() * 0.6 + 0.3;

    // Random twinkle timing so stars don't sync
    const duration = (Math.random() * 3 + 2.5).toFixed(2) + "s";
    const delay = (Math.random() * 4).toFixed(2) + "s";

    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.top = top + "%";
    star.style.left = left + "%";
    star.style.setProperty("--base-opacity", baseOpacity.toFixed(2));
    star.style.setProperty("--twinkle-duration", duration);
    star.style.setProperty("--twinkle-delay", delay);

    // A few "bright" stars get a glow
    if (Math.random() < 0.12) {
      star.classList.add("bright");
    }

    fragment.appendChild(star);
  }

  container.appendChild(fragment);
}

generateStars();

/* ---------- Leaflet Map ---------- */
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) {
    console.warn("Map container not found");
    return;
  }

  const map = L.map("map", {
    center: [20, 0],          // test center — Phase 3 will setView to live ISS coords
    zoom: 3,
    minZoom: 2,
    maxZoom: 6,
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
    worldCopyJump: true,
    fadeAnimation: true,
  });

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution:
        "Tiles © Esri — Source: Esri, USDA, USGS, and the GIS User Community",
    }
  ).addTo(map);

    // Test marker — Phase 3 will replace with live coordinates
  const testCoord = [20, 0]; // lat, lon

  const issIcon = L.divIcon({
    className: "iss-map-marker",
    html: '<div class="iss-map-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const issDot = L.marker(testCoord, {
    icon: issIcon,
    keyboard: false,
  }).addTo(map);

  // Expose so Phase 3 can update its position
  window.issDot = issDot;

  window.issMap = map;

  setTimeout(() => map.invalidateSize(), 150);

  console.log("Phase 2.7 — satellite map initialized");
}

initMap();
/* ---------- Panel toggle ---------- */
function setupPanel() {
  const iss = document.getElementById("iss");
  const panel = document.getElementById("panel");
  const closeBtn = document.getElementById("panel-close");

  if (!iss || !panel) return;

  function openPanel() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
  }

  function closePanel() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }

  // Click ISS to open
  iss.addEventListener("click", openPanel);

  // Keyboard: Enter or Space on the ISS button
  iss.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPanel();
    }
  });

  // Click the × to close
  closeBtn.addEventListener("click", closePanel);

  // Esc key closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });

  console.log("Phase 2.9 — panel toggle wired");
}
let lastOrbit = null;
setupPanel();
/* ---------- Panel population ---------- */
function setStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatCoord(value, axis) {
  const dir = axis === "lat"
    ? (value >= 0 ? "N" : "S")
    : (value >= 0 ? "E" : "W");
  return `${Math.abs(value).toFixed(4)}° ${dir}`;
}

function formatAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 2) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}
/* ---------- ISS data fetching ---------- */
const API_SOURCES = [
  {
    name: "Open Notify",
    url: "http://api.open-notify.org/iss-now.json",
    parse: (data) => ({
      lat: parseFloat(data.iss_position.latitude),
      lon: parseFloat(data.iss_position.longitude),
      timestamp: data.timestamp * 1000,
      altitude: 408,       // nominal km — Open Notify doesn't return altitude
      velocity: 7.66,      // nominal km/s
      source: "Open Notify",
    }),
  },
  {
    name: "WhereTheISS.at",
    url: "https://api.wheretheiss.at/v1/satellites/25544",
    parse: (data) => ({
      lat: data.latitude,
      lon: data.longitude,
      timestamp: data.timestamp * 1000,
      altitude: data.altitude,
      velocity: data.velocity / 3600, // km/h → km/s
      source: "WhereTheISS.at",
    }),
  },
];

async function fetchISS() {
  for (const source of API_SOURCES) {
    try {
      const res = await fetch(source.url, { cache: "no-store" });
      if (!res.ok) {
        console.warn(`${source.name} returned ${res.status}`);
        continue;
      }
      const raw = await res.json();
      const parsed = source.parse(raw);
      console.log(`✓ ${source.name}:`, parsed);
      return parsed;
    } catch (err) {
      console.warn(`${source.name} failed:`, err.message);
    }
  }
  console.error("All ISS data sources failed");
  return null;
}
/* ---------- Longitude → horizontal position ---------- */
function lonToXPercent(lon) {
  // Map -180°..+180° → 20%..80% of the space zone width
  // Keeps the ISS comfortably inside the viewport
  const minX = 20;
  const maxX = 80;
  return minX + ((lon + 180) / 360) * (maxX - minX);
}

function updateISSPosition(lon) {
  const iss = document.getElementById("iss");
  if (!iss) return;

  const prevLon = iss.dataset.lon ? parseFloat(iss.dataset.lon) : null;
  const xPercent = lonToXPercent(lon);

  // Detect antimeridian wrap: lon jumps from ~+180 to ~-180
  const wrapped = prevLon !== null && Math.abs(lon - prevLon) > 180;

  if (wrapped) {
    // Snap without transition to avoid a long slide across the screen
    iss.style.transition = "none";
    iss.style.left = xPercent + "%";
    void iss.offsetWidth;              // force reflow
    iss.style.transition = "";         // restore transition
  } else {
    iss.style.left = xPercent + "%";
  }

  iss.dataset.lon = lon;
}
/* ---------- State management ---------- */
const STATE = {
  LOADING: "loading",
  LIVE: "live",
  STALE: "stale",
  ERROR: "error",
};

let consecutiveFailures = 0;
const FAILURE_THRESHOLD = 3;   // after 3 fails → error state

function setPanelState(state, message) {
  const panel = document.getElementById("panel");
  if (!panel) return;
  panel.dataset.state = state;

  // Update status text
  const status = panel.querySelector(".panel-status");
  if (status) {
    const dot = status.querySelector(".status-pulse");
    status.textContent = "";
    if (dot) status.appendChild(dot);
    status.appendChild(document.createTextNode(
      state === STATE.LIVE ? " LIVE"
      : state === STATE.LOADING ? " ACQUIRING"
      : state === STATE.STALE ? " STALE"
      : " ERROR"
    ));
  }

  // Update error message text
  if (message) {
    const msg = document.getElementById("error-message");
    if (msg) msg.textContent = message;
  }
}
/* ---------- Orbital physics ---------- */
const PHYSICS = {
  GM_EARTH: 3.986e14,     // m³/s²
  R_EARTH: 6_371_000,     // m
  NOMINAL_ALTITUDE: 408_000, // m
};

function computeOrbit(altitudeKm) {
  const altitudeM = (altitudeKm || 408) * 1000;
  const r = PHYSICS.R_EARTH + altitudeM;

  // Orbital velocity (m/s → km/s)
  const v = Math.sqrt(PHYSICS.GM_EARTH / r) / 1000;

  // Orbital period (seconds → minutes)
  const T = 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / PHYSICS.GM_EARTH) / 60;

  // Distance covered per 5-second tick
  const distancePerTick = v * 5;

  return {
    velocityKmS: v,
    periodMin: T,
    distancePerTickKm: distancePerTick,
    altitudeKm: altitudeKm || 408,
    radiusKm: r / 1000,
  };
}

/* ---------- Update loop ---------- */
const UPDATE_INTERVAL_MS = 5000;
let updateCount = 0;
let lastData = null;

async function tick() {
  // Offline: count as a failure so we escalate to ERROR after the threshold
  if (!navigator.onLine) {
    consecutiveFailures++;
    if (consecutiveFailures >= FAILURE_THRESHOLD) {
      setPanelState(STATE.ERROR, "You're offline. Will retry when network returns.");
    } else {
      setPanelState(STATE.STALE, "You're offline. Waiting for network…");
    }
    return;
  }

  updateCount++;
  const data = await fetchISS();

  if (!data) {
    consecutiveFailures++;
    if (consecutiveFailures >= FAILURE_THRESHOLD) {
      setPanelState(STATE.ERROR, `Unable to reach ISS telemetry (${consecutiveFailures} tries).`);
    } else {
      setPanelState(STATE.STALE, "Temporary fetch failure. Retrying…");
    }
    return;
  }

  // Success — reset everything
  consecutiveFailures = 0;
  setPanelState(STATE.LIVE);
  lastData = data;

  console.log(`Tick #${updateCount} — ${data.lat.toFixed(4)}, ${data.lon.toFixed(4)} (${data.source})`);

  if (window.issDot) {
    window.issDot.setLatLng([data.lat, data.lon]);
  }

  if (window.issMap) {
    window.issMap.setView([data.lat, data.lon], window.issMap.getZoom(), {
      animate: true,
      duration: 4.5,
    });
  }

  updateISSPosition(data.lon);

  const orbit = computeOrbit(data.altitude);
  lastOrbit = orbit;

  setStat("stat-lat", formatCoord(data.lat, "lat"));
  setStat("stat-lon", formatCoord(data.lon, "lon"));
  setStat("stat-speed", `${orbit.velocityKmS.toFixed(2)} km/s`);
  setStat("stat-alt", `${data.altitude.toFixed(0)} km${data.source === "Open Notify" ? " (nominal)" : ""}`);
  setStat("stat-period", `${orbit.periodMin.toFixed(1)} min`);
  setStat("stat-updated", formatAgo(data.timestamp));
}

// First fetch immediately, then every 5 seconds
tick();
setInterval(tick, UPDATE_INTERVAL_MS);
/* ---------- Live "updated" ticker ---------- */
setInterval(() => {
  if (lastData) {
    setStat("stat-updated", formatAgo(lastData.timestamp));
  }
}, 1000);
/* ---------- Offline / online handling ---------- */
function updateOfflineNotice() {
  const notice = document.getElementById("offline-notice");
  if (!notice) return;
  if (navigator.onLine) {
    notice.classList.remove("show");
  } else {
    notice.classList.add("show");
    setPanelState(STATE.STALE, "You're offline. Waiting for network…");
  }
}

window.addEventListener("online", () => {
  updateOfflineNotice();
  tick(); // fetch immediately when back online
});
window.addEventListener("offline", updateOfflineNotice);
updateOfflineNotice();

/* ---------- Manual retry button ---------- */
document.getElementById("retry-btn")?.addEventListener("click", () => {
  consecutiveFailures = 0;
  setPanelState(STATE.LOADING);
  tick();
});

/* ---------- Refetch when tab becomes visible again ---------- */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.log("Tab returned — refetching immediately");
    tick();
  }
});

/* ---------- Initial state ---------- */
setPanelState(STATE.LOADING, "Acquiring signal…");