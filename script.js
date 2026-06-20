const form = document.getElementById('fareForm');
const fareResult = document.getElementById('fareResult');
const payBox = document.getElementById('paymentBox');
const payAmount = document.getElementById('payAmount');
const payLink = document.getElementById('payLink');
const waButton = document.getElementById('waButton');
const distanceInput = document.getElementById('distance');
const timeText = document.getElementById('timeText');
const routeStatus = document.getElementById('routeStatus');

const RIDER4XR_CONFIG = {
  phone: '919929562585',
  upiId: '9929562585@ptyes',
  payeeName: 'Rider4XR',
  googleMapsApiKey: 'PASTE_GOOGLE_MAPS_API_KEY_HERE'
};

function calcFare(km){
  if(!km || km <= 0) return 0;
  const platform = 10;
  const minimum = 50;
  if(km <= 2.5) return minimum + platform;
  return Math.round(minimum + ((km - 2.5) * 15) + platform);
}

function estimateTime(km){
  if(!km || km <= 0) return 0;
  return Math.max(8, Math.round(km * 7));
}

function updatePayment(total, km){
  const from = document.getElementById('from').value.trim();
  const to = document.getElementById('to').value.trim();
  const parcelType = document.getElementById('parcelType').value || 'Parcel';
  const note = `Rider4XR booking ${parcelType} ${from} to ${to} ${km || ''}KM`;
  const upi = `upi://pay?pa=${encodeURIComponent(RIDER4XR_CONFIG.upiId)}&pn=${encodeURIComponent(RIDER4XR_CONFIG.payeeName)}&am=${encodeURIComponent(total)}&cu=INR&tn=${encodeURIComponent(note)}`;
  const msg = `Hi Rider4XR, I want to book a rider.%0AFrom: ${encodeURIComponent(from || '-') }%0ATo: ${encodeURIComponent(to || '-') }%0AParcel: ${encodeURIComponent(parcelType)}%0ADistance: ${encodeURIComponent(km || '-') } KM%0AFare: ₹${encodeURIComponent(total)}`;

  payAmount.textContent = `₹${total}`;
  payLink.href = upi;
  waButton.href = `https://wa.me/${RIDER4XR_CONFIG.phone}?text=${msg}`;
  payBox.classList.add('show');
}

function showFare(km){
  const total = calcFare(km);
  const mins = estimateTime(km);
  if(timeText) timeText.textContent = mins ? `${mins} MIN` : '0 MIN';
  fareResult.innerHTML = `<span>Estimated Total</span><strong>₹${total}</strong><small>${km ? km + ' KM route • ₹50 minimum till 2.5 KM + ₹15/KM + ₹10 platform fee' : 'Enter or select Google route'}</small>`;
  if(total) updatePayment(total, km);
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const km = parseFloat(distanceInput.value);
  showFare(km);
});

function useCurrentLocation(targetId){
  if(!navigator.geolocation){
    routeStatus.textContent = 'Current location browser me support nahi hai.';
    return;
  }
  routeStatus.textContent = 'Current location fetch ho rahi hai...';
  navigator.geolocation.getCurrentPosition((pos)=>{
    const text = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
    document.getElementById(targetId).value = text;
    routeStatus.textContent = 'Current location add ho gayi. Google API key ke baad address auto-fill hoga.';
  },()=>{
    routeStatus.textContent = 'Location permission allow karo, fir try karo.';
  });
}

document.querySelectorAll('[data-current]').forEach(btn=>{
  btn.addEventListener('click',()=>useCurrentLocation(btn.dataset.current));
});

function loadGoogleMaps(){
  if(!RIDER4XR_CONFIG.googleMapsApiKey || RIDER4XR_CONFIG.googleMapsApiKey.includes('PASTE_')){
    routeStatus.textContent = 'Google location ready hai. script.js me Google Maps API key paste karni hai.';
    return;
  }
  const s = document.createElement('script');
  s.src = `https://maps.googleapis.com/maps/api/js?key=${RIDER4XR_CONFIG.googleMapsApiKey}&libraries=places&callback=initGoogleBooking`;
  s.async = true;
  document.head.appendChild(s);
}

window.initGoogleBooking = function(){
  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');
  const fromAuto = new google.maps.places.Autocomplete(fromInput, { componentRestrictions: { country: 'in' } });
  const toAuto = new google.maps.places.Autocomplete(toInput, { componentRestrictions: { country: 'in' } });
  const service = new google.maps.DistanceMatrixService();

  function calculateGoogleRoute(){
    const from = fromInput.value.trim();
    const to = toInput.value.trim();
    if(!from || !to) return;
    routeStatus.textContent = 'Google route calculate ho raha hai...';
    service.getDistanceMatrix({
      origins: [from], destinations: [to], travelMode: google.maps.TravelMode.DRIVING, unitSystem: google.maps.UnitSystem.METRIC
    }, (response, status)=>{
      if(status !== 'OK'){
        routeStatus.textContent = 'Route calculate nahi hua. Distance manual daal sakte ho.';
        return;
      }
      const element = response.rows[0].elements[0];
      if(element.status !== 'OK'){
        routeStatus.textContent = 'Route nahi mila. Address check karo.';
        return;
      }
      const km = +(element.distance.value / 1000).toFixed(1);
      distanceInput.value = km;
      routeStatus.textContent = `${element.distance.text} • approx ${element.duration.text}`;
      showFare(km);
    });
  }

  fromAuto.addListener('place_changed', calculateGoogleRoute);
  toAuto.addListener('place_changed', calculateGoogleRoute);
  fromInput.addEventListener('change', calculateGoogleRoute);
  toInput.addEventListener('change', calculateGoogleRoute);
  routeStatus.textContent = 'Google location connected.';
};

loadGoogleMaps();


const riderApplyForm = document.getElementById('riderApplyForm');
if(riderApplyForm){
  riderApplyForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('riderName').value.trim();
    const mobile = document.getElementById('riderMobile').value.trim();
    const city = document.getElementById('riderCity').value.trim();
    const vehicle = document.getElementById('vehicleType').value;
    const licence = document.getElementById('licenceNo').value.trim();
    const exp = document.getElementById('experience').value.trim();
    const msg = `Hi Rider4XR, I want to apply as a rider.%0AName: ${encodeURIComponent(name || '-')}%0AMobile: ${encodeURIComponent(mobile || '-')}%0AArea: ${encodeURIComponent(city || '-')}%0AVehicle: ${encodeURIComponent(vehicle)}%0ADriving Licence: ${encodeURIComponent(licence || '-')}%0AExperience: ${encodeURIComponent(exp || '-')}`;
    window.open(`https://wa.me/${RIDER4XR_CONFIG.phone}?text=${msg}`, '_blank');
  });
}
