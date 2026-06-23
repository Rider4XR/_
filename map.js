let map;
let pickup = { ...CONFIG.defaultLocation };
let drop = null;
let pickupMarker = null;
let dropMarker = null;
let routeLine = null;
let currentDistanceKm = 0;
let mapClickMode = null;

function setMapStatus(message) {
  const box = document.getElementById("mapStatus");
  if (box) box.textContent = message;
}

function initBookingMap() {
  const startTime = Date.now();

  const waitForLeaflet = setInterval(() => {
    if (window.L) {
      clearInterval(waitForLeaflet);
      createMap();
    }

    if (Date.now() - startTime > 6000) {
      clearInterval(waitForLeaflet);
      setMapStatus("Map library did not load. Check internet, then refresh. On GitHub Pages it should work.");
    }
  }, 100);
}

function createMap() {
  try {
    map = L.map("map", {
      zoomControl: true
    }).setView([pickup.lat, pickup.lng], 13);

    const tileLayers = [
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    ];

    L.tileLayer(tileLayers[0], {
      maxZoom: 19,
      attribution: "© OpenStreetMap © CARTO"
    }).addTo(map);

    map.on("click", event => {
      if (!mapClickMode) {
        setMapStatus("Tap Pickup or Tap Drop button first, then tap on the map.");
        return;
      }

      const point = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        name: mapClickMode === "pickup" ? "Pinned Pickup" : "Pinned Drop"
      };

      if (mapClickMode === "pickup") {
        pickup = point;
        document.getElementById("pickupName").value = point.name;
      } else {
        drop = point;
        document.getElementById("dropSearch").value = point.name;
      }

      mapClickMode = null;
      document.getElementById("mapModeText").textContent = "Map tap mode: none";
      drawMap();
      if (drop) calculateRoute();
    });

    document.getElementById("pickupName").value = pickup.name;
    drawMap();
    setMapStatus("Map ready. Auto current location starting...");
    setTimeout(() => useCurrentLocation(false), 700);
  } catch (error) {
    console.error(error);
    setMapStatus("Map failed to start. Refresh page or upload to GitHub Pages HTTPS.");
  }
}

function setMapClickMode(mode) {
  mapClickMode = mode;
  document.getElementById("mapModeText").textContent = "Map tap mode: " + mode.toUpperCase();
  setMapStatus("Now tap on map to set " + mode + " location.");
}

function useCurrentLocation(showAlert = true) {
  if (!window.isSecureContext) {
    setMapStatus("Current location is blocked because this page is not HTTPS. Upload to GitHub Pages or use Tap Pickup.");
    if (showAlert) alert("Current location works only on HTTPS. Use GitHub Pages link or tap pickup manually on map.");
    return;
  }

  if (!navigator.geolocation) {
    setMapStatus("Location is not supported on this device. Use Tap Pickup.");
    if (showAlert) alert("Location is not supported on this device.");
    return;
  }

  setMapStatus("Requesting location permission...");

  navigator.geolocation.getCurrentPosition(position => {
    pickup = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      name: "Current Location"
    };

    document.getElementById("pickupName").value = pickup.name;
    drawMap();
    if (drop) calculateRoute();
    setMapStatus("Current location set as pickup.");
  }, error => {
    let message = "Location permission denied. Use Tap Pickup.";
    if (error.code === 2) message = "Location unavailable. Turn on GPS and try again, or use Tap Pickup.";
    if (error.code === 3) message = "Location request timed out. Use Tap Pickup.";
    setMapStatus(message);
    if (showAlert) alert(message);
  }, {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0
  });
}

async function searchDropLocation() {
  const query = document.getElementById("dropSearch").value.trim();

  if (!query) {
    alert("Enter drop location.");
    return;
  }

  setMapStatus("Searching location...");

  try {
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(query);
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    });
    const results = await response.json();

    if (!results[0]) {
      setMapStatus("Location not found. Try full address or tap drop on map.");
      alert("Location not found. Try a clearer location name or use Tap Drop.");
      return;
    }

    drop = {
      lat: Number(results[0].lat),
      lng: Number(results[0].lon),
      name: results[0].display_name
    };

    drawMap();
    calculateRoute();
  } catch (error) {
    console.error(error);
    setMapStatus("Search failed. You can use Tap Drop on map.");
    alert("Search failed. Use Tap Drop manually on map.");
  }
}

function swapPickupDrop() {
  if (!drop) {
    alert("Search drop location first.");
    return;
  }

  const oldPickup = pickup;
  pickup = drop;
  drop = oldPickup;

  document.getElementById("pickupName").value = pickup.name;
  document.getElementById("dropSearch").value = drop.name;

  drawMap();
  calculateRoute();
}

function drawMap() {
  if (!map || !window.L) return;

  if (pickupMarker) map.removeLayer(pickupMarker);
  if (dropMarker) map.removeLayer(dropMarker);

  pickupMarker = L.marker([pickup.lat, pickup.lng]).addTo(map).bindPopup("Pickup");

  if (drop) {
    dropMarker = L.marker([drop.lat, drop.lng]).addTo(map).bindPopup("Drop");
    map.fitBounds([[pickup.lat, pickup.lng], [drop.lat, drop.lng]], { padding: [40, 40] });
  } else {
    map.setView([pickup.lat, pickup.lng], 13);
  }
}

async function calculateRoute() {
  if (!drop) return;

  let distanceKm = distanceBetween(pickup, drop);
  setMapStatus("Calculating route...");

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes[0]) {
      distanceKm = data.routes[0].distance / 1000;

      if (routeLine) map.removeLayer(routeLine);

      routeLine = L.geoJSON(data.routes[0].geometry, {
        style: { weight: 5, color: "#ff3030" }
      }).addTo(map);

      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
      setMapStatus("Route ready.");
    } else {
      setMapStatus("Road route not found. Direct distance is used.");
    }
  } catch (error) {
    console.log("Route service failed. Direct distance is used.", error);
    setMapStatus("Route service failed. Direct distance is used.");
  }

  currentDistanceKm = Math.max(1, distanceKm);

  if (typeof updateFarePreview === "function") {
    updateFarePreview();
  }
}
