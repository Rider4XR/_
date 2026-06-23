const rider = requireLogin("rider");

document.addEventListener("DOMContentLoaded", () => {
  if (!rider) return;
  document.getElementById("riderMobile").textContent = rider.mobile;
  if (localStorage.getItem("r4xr_beep_enabled") === "yes") riderBeepEnabled = true;
  if (typeof updateBeepStatus === "function") updateBeepStatus();
  if (typeof startOrderBeepLoop === "function") startOrderBeepLoop();
  renderRiderPanel();
});

function setOnline(isOnline) {
  const users = getUsers();
  users[rider.mobile].online = isOnline;
  saveUsers(users);
  renderRiderPanel();
}

function acceptRide(rideId) {
  const rides = getRides().map(ride => {
    if (ride.id !== rideId) return ride;

    if (ride.status !== "searching") {
      alert("This order is already accepted.");
      return ride;
    }

    return {
      ...ride,
      status: "accepted",
      riderMobile: rider.mobile,
      riderName: rider.name,
      acceptedAt: new Date().toLocaleString()
    };
  });

  saveRides(rides);
  alert("Order accepted. Ask customer for pickup OTP.");
  renderRiderPanel();
}

function startRide(rideId) {
  const enteredOtp = prompt("Enter Pickup OTP");
  let success = false;
  let activeRide = null;

  const rides = getRides().map(ride => {
    if (ride.id === rideId && ride.pickupOtp === enteredOtp && ride.status === "accepted") {
      success = true;
      activeRide = ride;
      return { ...ride, status: "started", startedAt: new Date().toLocaleString() };
    }
    return ride;
  });

  saveRides(rides);

  if (!success) {
    alert("Wrong pickup OTP.");
  } else {
    alert("Ride started.");
    openGoogleMapsRoute(activeRide.pickup, activeRide.drop);
  }

  renderRiderPanel();
}

function completeRide(rideId) {
  const enteredOtp = prompt("Enter Drop OTP");
  let success = false;

  const rides = getRides().map(ride => {
    if (ride.id === rideId && ride.dropOtp === enteredOtp && (ride.status === "started" || ride.status === "accepted")) {
      success = true;
      return { ...ride, status: "completed", completedAt: new Date().toLocaleString() };
    }
    return ride;
  });

  saveRides(rides);

  alert(success ? "Ride completed." : "Wrong drop OTP.");
  renderRiderPanel();
}

function renderRiderPanel() {
  const users = getUsers();
  const current = users[rider.mobile] || rider;
  const isOnline = Boolean(current.online);

  document.getElementById("onlineStatus").textContent = isOnline ? "Online" : "Offline";

  const newOrders = getRides().filter(ride => ride.status === "searching");
  const myOrders = getRides().filter(ride => ride.riderMobile === rider.mobile);

  document.getElementById("newOrdersCard").classList.toggle("ring", isOnline && newOrders.length > 0);
  if (isOnline && newOrders.length > 0 && typeof playRiderBeep === "function") playRiderBeep();

  document.getElementById("newOrders").innerHTML = (isOnline ? newOrders : []).map(ride => `
    <div class="item">
      <b>${ride.orderId} • New ${ride.bookingType}</b>
      ${ride.distanceKm.toFixed(2)} KM • Your Pay ${formatMoney(ride.riderPay)}<br>
      Pickup: ${shortText(ride.pickup.name)}<br>
      Drop: ${shortText(ride.drop.name)}
      <div class="item-actions">
        <button onclick="acceptRide(${ride.id})">Accept</button>
        <button class="ghost" onclick='openGoogleMapsRoute(${JSON.stringify(ride.pickup)}, ${JSON.stringify(ride.drop)})'>Map</button>
      </div>
    </div>
  `).join("") || `<p class="note">${isOnline ? "No new order." : "Go online to receive orders."}</p>`;

  document.getElementById("acceptedOrders").innerHTML = myOrders.map(ride => `
    <div class="item">
      <b>${ride.orderId} • ${ride.status.toUpperCase()}</b>
      ${ride.bookingType} • ${ride.distanceKm.toFixed(2)} KM • Your Pay ${formatMoney(ride.riderPay)}<br>
      Customer Fare: ${formatMoney(ride.fare)} • Company: ${formatMoney(ride.companyAmount)}
      <div class="item-actions">
        ${ride.status === "accepted" ? `<button onclick="startRide(${ride.id})">Start With Pickup OTP</button>` : ""}
        ${ride.status === "started" ? `<button onclick="completeRide(${ride.id})">Complete With Drop OTP</button>` : ""}
        <button class="ghost" onclick='openGoogleMapsRoute(${JSON.stringify(ride.pickup)}, ${JSON.stringify(ride.drop)})'>Google Maps</button>
      </div>
    </div>
  `).join("") || `<p class="note">No accepted orders yet.</p>`;

  const completed = myOrders.filter(ride => ride.status === "completed");
  const earning = completed.reduce((sum, ride) => sum + ride.riderPay, 0);
  const settlement = completed.reduce((sum, ride) => sum + ride.companyAmount, 0);

  document.getElementById("completedCount").textContent = completed.length;
  document.getElementById("earningText").textContent = formatMoney(earning);
  document.getElementById("settlementText").textContent = formatMoney(settlement);
}

function hasActiveNewOrders(){const users=getUsers();const current=users[rider.mobile]||rider;const isOnline=Boolean(current.online);const newOrders=getRides().filter(ride=>ride.status==="searching");return isOnline&&newOrders.length>0;}
