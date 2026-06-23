function readStore(key, fallback) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readStore(KEYS.users, {});
}

function saveUsers(users) {
  writeStore(KEYS.users, users);
}

function getRides() {
  return readStore(KEYS.rides, []);
}

function saveRides(rides) {
  writeStore(KEYS.rides, rides);
}

function getStaffAdmins() {
  return readStore(KEYS.staff, []);
}

function saveStaffAdmins(staff) {
  writeStore(KEYS.staff, staff);
}

function getCurrentMobile() {
  return localStorage.getItem(KEYS.session);
}

function setCurrentMobile(mobile) {
  localStorage.setItem(KEYS.session, mobile);
}

function getCurrentUser() {
  const mobile = getCurrentMobile();
  if (!mobile) return null;
  return getUsers()[mobile] || null;
}

function getNextOrderId() {
  const current = Number(localStorage.getItem(KEYS.orderCounter) || "0") + 1;
  localStorage.setItem(KEYS.orderCounter, String(current));
  return "#" + String(current).padStart(3, "0");
}

function resetAllDemoData() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}
