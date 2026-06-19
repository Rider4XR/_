const kmInput = document.getElementById('km');
const fareEl = document.getElementById('fare');
const calcBtn = document.getElementById('calcBtn');
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const whatsappBtn = document.getElementById('whatsappBtn');

function calculateFare() {
  const km = parseFloat(kmInput.value || 0);
  if (!km || km <= 0) {
    fareEl.textContent = '₹0';
    return 0;
  }
  const delivery = km <= 3 ? 80 : Math.round(km * 20);
  const total = delivery + 10;
  fareEl.textContent = `₹${total}`;
  const from = encodeURIComponent(fromInput.value || 'Pickup location');
  const to = encodeURIComponent(toInput.value || 'Drop location');
  const msg = `Hi Rider4XR, I want to book a rider.%0AFrom: ${from}%0ATo: ${to}%0ADistance: ${km} KM%0AEstimated Fare: ₹${total}`;
  whatsappBtn.href = `https://wa.me/919929562585?text=${msg}`;
  return total;
}

calcBtn.addEventListener('click', calculateFare);
[kmInput, fromInput, toInput].forEach(input => input.addEventListener('input', calculateFare));
