const customer = requireLogin("customer");
let couponApplied = false;

document.addEventListener("DOMContentLoaded", () => {
  if (!customer) return;
  document.getElementById("customerMobile").textContent = customer.mobile;
  onBookingTypeChange();
  initBookingMap();
  renderCustomerOrders();
});

function onBookingTypeChange() {
  const type = document.getElementById("bookingType").value;
  document.getElementById("typeNote").textContent =
    type === "parcel"
      ? "Parcel limit: up to 5 KG. Cake, liquid, glass, fragile, cash, jewellery and illegal items are not allowed."
      : "Bike ride booking with pickup and drop OTP.";
}

function applyCoupon() {
  const code = document.getElementById("couponInput").value.trim().toUpperCase();

  if (code !== CONFIG.couponCode) {
    couponApplied = false;
    document.getElementById("couponStatus").textContent = "Invalid coupon.";
    updateFarePreview();
    return;
  }

  const users = getUsers();
  const freshUser = users[customer.mobile];

  if (freshUser.couponUsed) {
    couponApplied = false;
    document.getElementById("couponStatus").textContent = "WELCOME10 already used on this account.";
  } else {
    couponApplied = true;
    document.getElementById("couponStatus").textContent = "WELCOME10 applied: 10% off.";
  }

  updateFarePreview();
}

function updateFarePreview() {
  if (!currentDistanceKm) return;

  const fare = calculateFare(currentDistanceKm, couponApplied);

  document.getElementById("distanceText").textContent = fare.distanceKm.toFixed(2) + " KM";
  document.getElementById("fareText").textContent = formatMoney(fare.customerFare);
  document.getElementById("riderPayText").textContent = formatMoney(fare.riderPay);
  document.getElementById("companyText").textContent = formatMoney(fare.companyAmount);
}

function createBooking() {
  if (!drop || !currentDistanceKm) {
    alert("Search drop location or use Tap Drop on map first.");
    return;
  }

  const bookingType = document.getElementById("bookingType").value;
  const parcelWeight = Number(document.getElementById("parcelWeight").value || 0);

  if (bookingType === "parcel" && parcelWeight > 5) {
    alert("Parcel is above 5 KG. Rider may cancel or request extra amount.");
  }

  const fare = calculateFare(currentDistanceKm, couponApplied);
  const otp = makeOtpPair(customer.mobile, Date.now());

  const ride = {
    id: Date.now(),
    orderId: getNextOrderId(),
    customerMobile: customer.mobile,
    customerName: customer.name,
    bookingType,
    bookingFor: document.getElementById("bookingFor").value,
    receiverDetails: document.getElementById("receiverDetails").value.trim(),
    parcelWeight,
    pickup,
    drop,
    distanceKm: fare.distanceKm,
    fare: fare.customerFare,
    riderPay: fare.riderPay,
    companyAmount: fare.companyAmount,
    discount: fare.discount,
    couponCode: couponApplied ? CONFIG.couponCode : "",
    pickupOtp: otp.pickupOtp,
    dropOtp: otp.dropOtp,
    paymentMode: "Cash/UPI to rider",
    status: "searching",
    riderMobile: "",
    riderName: "",
    createdAt: new Date().toLocaleString()
  };

  const rides = getRides();
  rides.unshift(ride);
  saveRides(rides);

  if (couponApplied) {
    const users = getUsers();
    users[customer.mobile].couponUsed = true;
    saveUsers(users);
    couponApplied = false;
  }

  document.getElementById("pickupOtpText").textContent = ride.pickupOtp;
  document.getElementById("dropOtpText").textContent = ride.dropOtp;

  alert(`Order booked: ${ride.orderId}\nPickup OTP: ${ride.pickupOtp}\nDrop OTP: ${ride.dropOtp}`);
  renderCustomerOrders();
}

function renderCustomerOrders() {
  const orders = getRides().filter(ride => ride.customerMobile === customer.mobile);

  document.getElementById("customerOrders").innerHTML = orders.map(ride => `
    <div class="item">
      <b>${ride.orderId} • ${ride.status.toUpperCase()}</b>
      ${ride.bookingType} • ${ride.distanceKm.toFixed(2)} KM • ${formatMoney(ride.fare)}<br>
      Pickup: ${shortText(ride.pickup.name)}<br>
      Drop: ${shortText(ride.drop.name)}<br>
      Pickup OTP: <b>${ride.pickupOtp}</b> Drop OTP: <b>${ride.dropOtp}</b><br>
      Rider: ${ride.riderName || "Searching..."}
      <div class="item-actions">
        <button class="ghost" onclick='openGoogleMapsPoint(${JSON.stringify(ride.pickup)})'>Pickup Map</button>
        <button class="ghost" onclick='openGoogleMapsPoint(${JSON.stringify(ride.drop)})'>Drop Map</button>
        <button class="ghost" onclick='openGoogleMapsRoute(${JSON.stringify(ride.pickup)}, ${JSON.stringify(ride.drop)})'>Route</button>
      </div>
    </div>
  `).join("") || `<p class="note">No orders yet.</p>`;
}
