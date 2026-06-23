function formatMoney(value) {
  return CONFIG.currency + Math.round(Number(value) || 0);
}

function shortText(text, limit = 72) {
  if (!text) return "";
  return text.length > limit ? text.slice(0, limit) + "..." : text;
}

function hashString(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index++) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function makeOtpPair(mobile, seed = "") {
  const hash = hashString(String(mobile) + String(seed));
  return {
    pickupOtp: String(3000 + (hash % 5000)),
    dropOtp: String(7000 + ((hash + 937) % 2000))
  };
}

function openGoogleMapsRoute(from, to) {
  const url = `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`;
  window.open(url, "_blank");
}

function openGoogleMapsPoint(point) {
  const url = `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
  window.open(url, "_blank");
}

function distanceBetween(pointA, pointB) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(value));
}

function toRadians(value) {
  return value * Math.PI / 180;
}
