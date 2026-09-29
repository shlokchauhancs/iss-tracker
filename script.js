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

setupPanel();