const admin = requireLogin("admin");

document.addEventListener("DOMContentLoaded", () => {
  if (!admin) return;
  document.getElementById("adminMobile").textContent = admin.mobile;
  renderAdminPanel();
});

function renderAdminPanel() {
  const rides = getRides();

  const totalCollection = rides.reduce((sum, ride) => sum + Number(ride.fare || 0), 0);
  const totalPayout = rides.reduce((sum, ride) => sum + Number(ride.riderPay || 0), 0);
  const totalCompany = rides.reduce((sum, ride) => sum + Number(ride.companyAmount || 0), 0);

  document.getElementById("totalOrders").textContent = rides.length;
  document.getElementById("totalCollection").textContent = formatMoney(totalCollection);
  document.getElementById("totalPayout").textContent = formatMoney(totalPayout);
  document.getElementById("totalCompany").textContent = formatMoney(totalCompany);

  document.getElementById("adminOrdersList").innerHTML = rides.map(ride => `
    <div class="item">
      <b>${ride.orderId} • ${ride.status.toUpperCase()}</b>
      Customer: ${ride.customerName} (${ride.customerMobile})<br>
      Rider: ${ride.riderName || "Not assigned"} ${ride.riderMobile ? "(" + ride.riderMobile + ")" : ""}<br>
      Type: ${ride.bookingType} • ${ride.distanceKm.toFixed(2)} KM<br>
      Fare: ${formatMoney(ride.fare)} • Rider: ${formatMoney(ride.riderPay)} • Company: ${formatMoney(ride.companyAmount)}<br>
      Pickup OTP: ${ride.pickupOtp} • Drop OTP: ${ride.dropOtp}
      <div class="item-actions">
        <button class="ghost" onclick="cancelOrder(${ride.id})">Cancel</button>
      </div>
    </div>
  `).join("") || `<p class="note">No orders yet.</p>`;

  renderStaffAdmins();
}

function cancelOrder(rideId) {
  const rides = getRides().map(ride => {
    if (ride.id === rideId) {
      return { ...ride, status: "cancelled_by_admin" };
    }
    return ride;
  });

  saveRides(rides);
  renderAdminPanel();
}

function addStaffAdmin() {
  const mobile = document.getElementById("staffMobile").value.trim();

  if (!mobile) {
    alert("Enter staff mobile.");
    return;
  }

  const staff = getStaffAdmins();

  staff.push({
    id: Date.now(),
    mobile,
    permissions: {
      riderApproval: document.getElementById("permRider").checked,
      documentVerification: document.getElementById("permDocs").checked,
      settlementVerification: document.getElementById("permSettlement").checked,
      customerSupport: document.getElementById("permSupport").checked,
      couponControl: document.getElementById("permCoupon").checked,
      blockUnblock: document.getElementById("permBlock").checked
    },
    status: "active",
    createdAt: new Date().toLocaleString()
  });

  saveStaffAdmins(staff);
  document.getElementById("staffMobile").value = "";
  renderStaffAdmins();
}

function renderStaffAdmins() {
  const staff = getStaffAdmins();

  document.getElementById("staffList").innerHTML = staff.map(item => `
    <div class="item">
      <b>${item.mobile} • ${item.status}</b>
      Rider approval: ${item.permissions.riderApproval ? "Yes" : "No"}<br>
      Docs: ${item.permissions.documentVerification ? "Yes" : "No"}<br>
      Settlement: ${item.permissions.settlementVerification ? "Yes" : "No"}<br>
      Support: ${item.permissions.customerSupport ? "Yes" : "No"}
    </div>
  `).join("") || `<p class="note">No staff admin added.</p>`;
}

function resetDemoData() {
  if (!confirm("Reset all Rider4XR demo data?")) return;
  resetAllDemoData();
  location.href = "index.html";
}
