
(function(){
  const saved=localStorage.r4Theme||'dark';
  document.documentElement.dataset.theme=saved;
  window.toggleTheme=function(){
    const next=document.documentElement.dataset.theme==='light'?'dark':'light';
    document.documentElement.dataset.theme=next;
    localStorage.r4Theme=next;
    const b=document.getElementById('themeToggle');
    if(b) b.textContent=next==='light'?'🌙 Dark':'☀️ Light';
  };
  document.addEventListener('DOMContentLoaded',function(){
    const header=document.querySelector('header');
    if(header && !document.getElementById('themeToggle')){
      const b=document.createElement('button');
      b.id='themeToggle';
      b.className='theme-toggle';
      b.type='button';
      b.onclick=window.toggleTheme;
      b.textContent=(document.documentElement.dataset.theme==='light')?'🌙 Dark':'☀️ Light';
      header.appendChild(b);
    }
  });
})();

const OWNER_NUMBER='9929562585';
const OWNER_PASSWORD='NEHA@#LOBE';
const UPI_ID='9929562585@ptyes';

const CUSTOMER_TEMP_PASSWORD='WELCOME';
const RIDER_TEMP_PASSWORD='R4X2002';

const BASE_KM=3;
const CUSTOMER_BASE=50;
const PLATFORM_FEE=10;
const CUSTOMER_EXTRA=15;
const RIDER_BASE=38;
const RIDER_EXTRA=12;
const COMPANY_EXTRA=3;
const SHARING_CHARGE=25;
const WAITING_FREE_MIN=5;
const WAITING_PER_MIN=2;
const RADIUS=3;
const CASH_RIDE_LIMIT=3;
const SETTLEMENT_HOURS=24;

const $=id=>document.getElementById(id);
const money=n=>'₹'+Math.round(Number(n)||0);
const get=(k,d)=>JSON.parse(localStorage[k]||JSON.stringify(d));
const set=(k,v)=>localStorage[k]=JSON.stringify(v);

function users(){return get('r4Users',{})}
function saveUsers(v){set('r4Users',v)}
function rides(){return get('r4Rides',[])}
function saveRides(v){set('r4Rides',v)}
function apps(){return get('r4Apps',[])}
function saveApps(v){set('r4Apps',v)}
function issues(){return get('r4Issues',[])}
function saveIssues(v){set('r4Issues',v)}
function settlements(){return get('r4Settlements',[])}
function saveSettlements(v){set('r4Settlements',v)}
function reviews(){return get('r4Reviews',[])}
function saveReviews(v){set('r4Reviews',v)}
function counters(){return get('r4Counters',{order:0})}
function saveCounters(v){set('r4Counters',v)}

function seed(){
  let us=users();
  us[OWNER_NUMBER]={name:'Owner',mobile:OWNER_NUMBER,role:'admin',password:OWNER_PASSWORD,approved:true,passwordChanged:true};
  saveUsers(us);
  if(!localStorage.r4Rides) saveRides([]);
  if(!localStorage.r4Apps) saveApps([]);
  if(!localStorage.r4Issues) saveIssues([]);
  if(!localStorage.r4Settlements) saveSettlements([]);
  if(!localStorage.r4Reviews) saveReviews([]);
}
seed();

function nextOrderNo(){
  const c=counters();
  c.order=(c.order||0)+1;
  saveCounters(c);
  return '#'+String(c.order).padStart(3,'0');
}

function session(){
  const m=localStorage.r4Session;
  const u=users()[m];
  if(!u){location.href='index.html';return null}
  return u;
}
function logout(){localStorage.removeItem('r4Session');location.href='index.html'}

function togglePass(id){
  const el=$(id);
  if(!el)return;
  el.type=el.type==='password'?'text':'password';
}

function passwordStrong(p,temp){
  if(!p || p.length<6) return 'Password kam se kam 6 character ka hona chahiye.';
  if(temp && p===temp) return 'Temporary password same nahi rakh sakte.';
  if(!/[A-Za-z]/.test(p)) return 'Password me kam se kam 1 alphabet hona chahiye.';
  if(!(/[0-9]/.test(p)||/[^A-Za-z0-9]/.test(p))) return 'Password me kam se kam 1 number ya symbol hona chahiye.';
  return '';
}

function login(){
  const m=$('mobile').value.trim();
  const p=$('password').value;
  if(!m||!p)return alert('Mobile number aur password डालो');

  let us=users();
  let u=us[m];

  if(m===OWNER_NUMBER){
    if(p!==OWNER_PASSWORD)return alert('Wrong mobile/password');
    us[m]={name:'Owner',mobile:m,role:'admin',password:OWNER_PASSWORD,approved:true,passwordChanged:true};
    saveUsers(us);
    localStorage.r4Session=m;
    return location.href='admin.html';
  }

  if(u){
    if(u.password!==p)return alert('Wrong mobile/password');
    if(u.blacklisted)return alert('Your account is blocked. Contact admin.');
    localStorage.r4Session=m;
    if(!u.passwordChanged)return location.href='change-password.html';
    return location.href=u.role+'.html';
  }

  if(p===CUSTOMER_TEMP_PASSWORD){
    us[m]={name:'Customer '+m.slice(-4),mobile:m,role:'customer',password:CUSTOMER_TEMP_PASSWORD,approved:true,passwordChanged:false};
    saveUsers(us);
    localStorage.r4Session=m;
    alert('Customer account created. Ab password change karna mandatory hai.');
    return location.href='change-password.html';
  }

  if(p===RIDER_TEMP_PASSWORD){
    us[m]={name:'Rider '+m.slice(-4),mobile:m,role:'rider',password:RIDER_TEMP_PASSWORD,approved:false,passwordChanged:false,online:false,vehicle:'Bike'};
    saveUsers(us);
    let a=apps();
    if(!a.some(x=>x.mobile===m)){
      a.unshift({id:Date.now(),name:'Rider '+m.slice(-4),mobile:m,role:'rider',status:'pending',date:new Date().toLocaleString()});
      saveApps(a);
    }
    localStorage.r4Session=m;
    alert('Rider account pending admin approval. Password change mandatory hai.');
    return location.href='change-password.html';
  }

  alert('Wrong mobile/password');
}

function signup(){
  let name=$('suName').value.trim(), mobile=$('suMobile').value.trim(), role=$('suRole').value;
  if(!name||!mobile)return alert('Name/mobile डालो');
  let us=users();
  if(us[mobile])return alert('This mobile number is already registered. Please login.');
  let a=apps();
  a.unshift({id:Date.now(),name,mobile,role,status:role==='customer'?'auto-approved':'pending',date:new Date().toLocaleString()});
  saveApps(a);

  if(role==='customer'){
    us[mobile]={name,mobile,role:'customer',password:CUSTOMER_TEMP_PASSWORD,approved:true,passwordChanged:false};
    saveUsers(us);
    alert('Customer account created. Temporary Password: WELCOME. First login ke baad password change mandatory.');
  }else{
    us[mobile]={name,mobile,role:'rider',password:RIDER_TEMP_PASSWORD,approved:false,passwordChanged:false,online:false,vehicle:'Bike'};
    saveUsers(us);
    const msg=`New Rider Signup Request
Name: ${name}
Mobile: ${mobile}
Status: Pending Approval
Temporary password owner will share privately.`;
    window.open(`https://wa.me/91${OWNER_NUMBER}?text=${encodeURIComponent(msg)}`,'_blank');
    alert('Rider request saved. Owner approval ke baad rides milengi.');
  }
}

function changePassword(){
  let u=session(), us=users();
  const n=$('newPass').value, c=$('confirmPass').value;
  const temp=u.role==='rider'?RIDER_TEMP_PASSWORD:CUSTOMER_TEMP_PASSWORD;
  const err=passwordStrong(n,temp);
  if(err)return alert(err);
  if(n!==c)return alert('Password match nahi');
  us[u.mobile].password=n;
  us[u.mobile].passwordChanged=true;
  saveUsers(us);
  alert('Password changed.');
  location.href=u.role+'.html';
}

function fare(km){
  return (km<=BASE_KM?CUSTOMER_BASE:CUSTOMER_BASE+(km-BASE_KM)*CUSTOMER_EXTRA)+PLATFORM_FEE;
}
function riderPay(km){
  return km<=BASE_KM?RIDER_BASE:RIDER_BASE+(km-BASE_KM)*RIDER_EXTRA;
}
function rideType(){return localStorage.r4BookingType||'bike'}
function waitingMinutes(){return Math.max(0,Number($('waitingMin')?.value||0))}
function waitingCharge(min=waitingMinutes()){return Math.max(0,min-WAITING_FREE_MIN)*WAITING_PER_MIN}
function baseFareByType(km,type=rideType()){
  if(type==='sharing')return SHARING_CHARGE;
  return fare(km);
}
function finalFare(km,type=rideType()){return baseFareByType(km,type)+waitingCharge()}
function finalRiderPay(km,type=rideType()){return type==='sharing'?SHARING_CHARGE:riderPay(km)}
function companyMargin(km,type=rideType()){return finalFare(km,type)-finalRiderPay(km,type)}
function rideLabel(type=rideType()){
  return type==='sharing'?'Friendly Route / Sharing':type==='delivery'?'Delivery: Backpack-size parcel up to 5–7 KG':'Bike Ride';
}

function dist(a,b){
  const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLng=(b.lng-a.lng)*Math.PI/180;
  const x=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
function hashDigits(s){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h+s.charCodeAt(i))|0}return Math.abs(h)}
function customerOtp(m,type){const base=type==='drop'?7000:3000;return String(base+(hashDigits(m+type)%2999))}
function getOtpPair(m){return {pickup:customerOtp(m,'pickup'),drop:customerOtp(m,'drop')}}
function updateOtpUI(){
  const u=session(); if(!u)return;
  const o=getOtpPair(u.mobile);
  if($('pickupOtp'))$('pickupOtp').textContent=o.pickup;
  if($('dropOtp'))$('dropOtp').textContent=o.drop;
}

let map, pickup={lat:31.1048,lng:77.1734,name:'Current Location'}, drop=null, routeLine=null, markers=[];

function initMap(){
  if(!$('map'))return;
  map=L.map('map').setView([pickup.lat,pickup.lng],13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  locate();
  renderRiders();
}
function locate(){
  if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{
    pickup={lat:p.coords.latitude,lng:p.coords.longitude,name:'Current Location'};
    map.setView([pickup.lat,pickup.lng],15);
    draw();
  },()=>draw());
  else draw();
}
async function searchDrop(){
  let q=$('drop').value.trim();
  if(!q)return;
  let r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
  let j=await r.json();
  if(!j[0])return alert('Location nahi mili');
  drop={lat:+j[0].lat,lng:+j[0].lon,name:j[0].display_name};
  draw();
  calcRoute();
}
function clearMarkers(){markers.forEach(m=>map.removeLayer(m));markers=[]}
function draw(){
  if(!map)return;
  clearMarkers();
  markers.push(L.marker([pickup.lat,pickup.lng]).addTo(map).bindPopup('Pickup'));
  if(drop)markers.push(L.marker([drop.lat,drop.lng]).addTo(map).bindPopup('Drop'));
  renderRiders(false);
}
async function calcRoute(){
  if(!drop)return;
  let km=dist(pickup,drop);
  try{
    let r=await fetch(`https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`);
    let j=await r.json();
    if(j.routes&&j.routes[0]){
      km=j.routes[0].distance/1000;
      if(routeLine)map.removeLayer(routeLine);
      routeLine=L.geoJSON(j.routes[0].geometry,{style:{weight:5}}).addTo(map);
      map.fitBounds(routeLine.getBounds(),{padding:[20,20]});
    }
  }catch(e){}
  if($('distance'))$('distance').textContent=km.toFixed(2)+' KM';
  if($('fare'))$('fare').textContent=money(finalFare(km));
  localStorage.r4LastKm=km;
  updateWaitingCharge();
  nearbyRiderStats();
}
function renderRiders(){
  if(!map)return;
  const us=users();
  Object.values(us).filter(u=>u.role==='rider'&&u.approved&&u.online&&u.lat).forEach(r=>{
    let near=dist(pickup,{lat:r.lat,lng:r.lng});
    let icon=L.divIcon({html:'🏍️',className:'',iconSize:[28,28]});
    markers.push(L.marker([r.lat,r.lng],{icon}).addTo(map).bindPopup(`${r.name} - ${near.toFixed(1)} KM`));
  });
  nearbyRiderStats();
}
function nearbyRiderStats(){
  const us=users();
  const online=Object.values(us).filter(u=>u.role==='rider'&&u.approved&&u.online&&u.lat);
  const nearby=online.map(r=>({...r,near:dist(pickup,{lat:r.lat,lng:r.lng})})).filter(r=>r.near<=RADIUS).sort((a,b)=>a.near-b.near);
  if($('nearbyCount'))$('nearbyCount').textContent=nearby.length;
  if($('eta'))$('eta').textContent=nearby[0]?Math.max(2,Math.round(nearby[0].near*4))+' min':'--';
  return nearby;
}
function selectBookingType(type){
  localStorage.r4BookingType=type;
  ['Bike','Sharing','Delivery'].forEach(n=>{$('opt'+n)?.classList.remove('active')});
  $(type==='bike'?'optBike':type==='sharing'?'optSharing':'optDelivery')?.classList.add('active');
  $('deliveryInfo')?.classList.toggle('hidden',type!=='delivery');
  if($('swipe'))$('swipe').querySelector('span').textContent=type==='sharing'?'Swipe to book friendly route':type==='delivery'?'Swipe to book delivery':'Swipe bike to book';
  if(drop)calcRoute(); else updateWaitingCharge();
}
function updateWaitingCharge(){
  if($('waitingCharge'))$('waitingCharge').textContent=money(waitingCharge());
  const km=+(localStorage.r4LastKm||0);
  if(km && $('fare'))$('fare').textContent=money(finalFare(km));
}

function isActiveStatus(s){return ['searching','accepted','started','on_the_way'].includes(s)}
function customerHasActiveRide(m){return rides().some(r=>r.customer===m&&isActiveStatus(r.status))}
function hasExtraApproval(m){const u=users()[m];return u&&u.extraBookingUntil&&Date.now()<u.extraBookingUntil}
function blockUntilActive(m){const u=users()[m];return u&&u.blockUntil&&Date.now()<u.blockUntil}

function bookRide(){
  if(!drop)return alert('Drop location select करो');
  const u=session(), us=users();
  if(us[u.mobile]?.blacklisted)return alert('Your account is blocked. Contact admin.');
  if(blockUntilActive(u.mobile))return alert('You are blocked for 24 hours. WhatsApp admin for approval.');
  if(customerHasActiveRide(u.mobile)&&!hasExtraApproval(u.mobile))return alert('Your ride is already active. New booking ke liye WhatsApp admin approval चाहिए.');

  const km=+(localStorage.r4LastKm||dist(pickup,drop));
  const otp=getOtpPair(u.mobile);
  const now=Date.now(), orderNo=nextOrderNo();
  const ride={
    id:now,createdTs:now,orderNo,customer:u.mobile,customerName:u.name,pickup,drop,km,
    rideType:rideType(),rideLabel:rideLabel(),amount:finalFare(km),riderPay:finalRiderPay(km),companyAmount:companyMargin(km),
    waitingMin:waitingMinutes(),waitingCharge:waitingCharge(),pickupOtp:otp.pickup,dropOtp:otp.drop,
    payment:$('payment').value,forWhom:$('forWhom').value,receiver:$('receiver').value,
    status:'searching',created:new Date().toLocaleString(),activity:['Booked: '+new Date().toLocaleString(),'Order '+orderNo,'Pickup OTP: '+otp.pickup,'Drop OTP: '+otp.drop]
  };
  let rr=rides(); rr.unshift(ride); saveRides(rr);
  alert(`Ride booked. Order ${orderNo} | Pickup OTP: ${otp.pickup} | Drop OTP: ${otp.drop}. Nearby riders ko alert jayega.`);
  location.reload();
}
function setupSwipe(){
  const s=$('swipe'),k=$('knob'); if(!s||!k)return;
  let down=false,start=0;
  const move=x=>{
    let w=s.clientWidth-62,pos=Math.max(0,Math.min(w,x-start));
    k.style.transform=`translateX(${pos}px)`;
    if(pos>w*.82){down=false;bookRide()}
  };
  k.onpointerdown=e=>{down=true;start=e.clientX};
  window.onpointermove=e=>{if(down)move(e.clientX)};
  window.onpointerup=()=>{down=false;k.style.transform='translateX(0)'};
}

function loadCustomer(){
  let u=session();
  if(!u.passwordChanged)return location.href='change-password.html';
  if($('hello'))$('hello').textContent='Hi, '+u.name;
  updateOtpUI();
  initMap();
  setupSwipe();
  selectBookingType(localStorage.r4BookingType||'bike');
  renderCustomerHistory();
  renderReviewBox();
}
function renderCustomerHistory(){
  const u=session();
  let my=rides().filter(r=>r.customer===u.mobile);
  if($('history'))$('history').innerHTML=my.map(r=>`<div class=item><b>${r.orderNo||('#'+r.id)} • ${r.pickup.name.split(',')[0]} → ${r.drop.name.split(',')[0]}</b><br>${r.rideLabel||'Bike Ride'} • ${r.km.toFixed(1)} KM • ${money(r.amount)} • ${r.status}<br>Pickup OTP: ${r.pickupOtp||getOtpPair(u.mobile).pickup} • Drop OTP: ${r.dropOtp||getOtpPair(u.mobile).drop}</div>`).join('')||'<p class=hint>No rides yet</p>';
}
function renderReviewBox(){
  const u=session();
  const done=rides().find(r=>r.customer===u.mobile&&r.status==='completed'&&!reviews().some(v=>v.rideId===r.id));
  if(!$('reviewBox'))return;
  if(!done){$('reviewBox').innerHTML='<p class=hint>Completed ride ke baad feedback option yahan aayega.</p>';return}
  $('reviewBox').innerHTML=`<div class=item><b>${done.orderNo} Review</b><div class=field><label>Rating</label><select id=reviewRating><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div><div class=field><label>Comment</label><textarea id=reviewComment placeholder="Rider/service feedback"></textarea></div><button onclick="submitReview(${done.id})">Submit Review</button></div>`;
}
function submitReview(id){
  const r=rides().find(x=>x.id===id), u=session();
  if(!r)return;
  const v={id:Date.now(),rideId:id,orderNo:r.orderNo,customer:u.mobile,rider:r.rider,rating:$('reviewRating').value,comment:$('reviewComment').value,date:new Date().toLocaleString()};
  let all=reviews(); all.unshift(v); saveReviews(all);
  alert('Review submitted.');
  renderReviewBox();
}

function beep(){try{let a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=.08;o.start();setTimeout(()=>{o.stop();a.close()},450)}catch(e){}}

function cashCompletedByRider(m){return rides().filter(r=>r.rider===m&&r.status==='completed'&&r.payment==='Cash'&&!r.settled)}
function settlementAmountForRides(list){return list.reduce((s,r)=>s+(r.amount-r.riderPay),0)}
function settlementDeadlineExpired(m){
  const list=cashCompletedByRider(m);
  if(list.length<CASH_RIDE_LIMIT)return false;
  const oldest=list.slice(-CASH_RIDE_LIMIT)[0]||list[list.length-1];
  const t=oldest.completedAt||oldest.createdTs||oldest.id||Date.now();
  return Date.now()-t>SETTLEMENT_HOURS*3600*1000;
}
function autoBlockSettlement(m){
  const us=users(), u=us[m]; if(!u||u.role!=='rider')return false;
  const pending=cashCompletedByRider(m);
  if(pending.length>=CASH_RIDE_LIMIT&&settlementDeadlineExpired(m)){
    u.blockedReason='Settlement pending after 3 cash rides';
    u.settlementBlocked=true;
    u.approved=false;
    u.online=false;
    saveUsers(us);
    return true;
  }
  return false;
}
function rankingList(){
  const us=users(), rr=rides();
  return Object.values(us).filter(u=>u.role==='rider').map(u=>{
    const completed=rr.filter(r=>r.rider===u.mobile&&r.status==='completed');
    const rating=reviews().filter(x=>x.rider===u.mobile);
    const avg=rating.length?rating.reduce((s,x)=>s+Number(x.rating||0),0)/rating.length:0;
    const score=completed.length*10+Math.round(avg*2);
    return {...u,rideCount:completed.length,score,avgRating:avg};
  }).sort((a,b)=>b.rideCount-a.rideCount||b.score-a.score);
}

function loadRider(){
  let u=session();
  if(!u.passwordChanged)return location.href='change-password.html';
  if($('riderName'))$('riderName').textContent=u.name;
  autoBlockSettlement(u.mobile);
  u=users()[u.mobile];

  if(u.settlementBlocked||u.blockedReason){
    if($('ringBox'))$('ringBox').innerHTML='<b>ID Blocked</b><p class=hint>'+(u.blockedReason||'Account blocked')+'</p><button class=ghost onclick="sendSupport(\\'rider\\')">WhatsApp Admin</button>';
  }else if(!u.approved){
    if($('ringBox'))$('ringBox').innerHTML='<b>Pending Approval</b><p class=hint>Admin approval ke bina ride/order nahi milegi.</p>';
  }

  if(navigator.geolocation)navigator.geolocation.watchPosition(p=>{
    let us=users(); if(us[u.mobile]){us[u.mobile].lat=p.coords.latitude;us[u.mobile].lng=p.coords.longitude;saveUsers(us)}
  });
  showRiderOrders();
  setInterval(showRiderOrders,3000);
}
function setOnline(v){
  let u=session(); autoBlockSettlement(u.mobile);
  let us=users();
  if(!us[u.mobile].approved||us[u.mobile].settlementBlocked||us[u.mobile].blockedReason)return alert('Admin approval ya settlement clear hone ke bina online nahi ho sakte.');
  us[u.mobile].online=v; saveUsers(us); showRiderOrders();
}
function showRiderOrders(){
  let u=session(), rr=rides(), me=users()[u.mobile]; if(!me)return;
  autoBlockSettlement(u.mobile); me=users()[u.mobile];
  const activeOk=me.approved&&!me.settlementBlocked&&!me.blockedReason&&me.online&&me.lat;
  let pending=activeOk?rr.filter(r=>r.status==='searching'&&dist({lat:me.lat,lng:me.lng},r.pickup)<=RADIUS)
    .sort((a,b)=>dist({lat:me.lat,lng:me.lng},a.pickup)-dist({lat:me.lat,lng:me.lng},b.pickup)).slice(0,5):[];

  if(pending.length){$('ringBox')?.classList.add('ring'); beep(); if(navigator.vibrate)navigator.vibrate([300,150,300])}
  else $('ringBox')?.classList.remove('ring');

  if($('orders'))$('orders').innerHTML=pending.map(r=>`<div class=item><b>${r.orderNo||('#'+r.id)} • New Order</b><br>${r.rideLabel||'Bike Ride'}<br>${r.pickup.name.split(',')[0]} → ${r.drop.name.split(',')[0]}<br>${r.km.toFixed(1)} KM • Your earning ${money(r.riderPay)}<br>Customer payment: ${r.payment}<br><button onclick="acceptRide(${r.id})">Accept First</button></div>`).join('')||'<p class=hint>No nearby ride</p>';

  const mine=rr.filter(r=>r.rider===u.mobile);
  const cashPending=cashCompletedByRider(u.mobile);
  if($('earn'))$('earn').textContent=money(mine.reduce((s,r)=>s+r.riderPay,0));
  if($('done'))$('done').textContent=mine.filter(r=>r.status==='completed').length;
  if($('pendingSettle'))$('pendingSettle').textContent=money(settlementAmountForRides(cashPending));
  if($('cashRides'))$('cashRides').textContent=cashPending.length;
  if($('riderScore'))$('riderScore').textContent=(rankingList().find(x=>x.mobile===u.mobile)?.score||0);
  if($('riderRides'))$('riderRides').innerHTML=mine.map(r=>`<div class=item><b>${r.orderNo||('#'+r.id)}</b> • ${r.status}<br>${r.rideLabel||'Bike Ride'}<br>${r.pickup.name.split(',')[0]} → ${r.drop.name.split(',')[0]}<br>${r.km.toFixed(1)} KM • Your earning ${money(r.riderPay)}<br>Payment: ${r.payment}<br>${r.status==='accepted'?`<button onclick="startRideWithOtp(${r.id})">Start with Pickup OTP</button> `:''}${r.status==='started'?`<button onclick="completeRideWithOtp(${r.id})">Complete with Drop OTP</button> `:''}<button class=ghost onclick="window.open('https://www.google.com/maps/dir/?api=1&origin=${r.pickup.lat},${r.pickup.lng}&destination=${r.drop.lat},${r.drop.lng}&travelmode=driving','_blank')">Open Map</button></div>`).join('')||'<p class=hint>No rides assigned</p>';
  if($('rankings'))$('rankings').innerHTML=rankingList().slice(0,10).map((r,i)=>`<div class=item><b>#${i+1} ${r.name}</b><br>Rides: ${r.rideCount} • Points: ${r.score}${i===0?' • 🎁 Offer Prize Eligible':''}</div>`).join('')||'<p class=hint>No ranking yet</p>';
}
function acceptRide(id){
  let rr=rides(), u=session(), accepted=false;
  rr=rr.map(r=>{
    if(r.id!==id)return r;
    if(r.status!=='searching'){alert('Ye ride kisi rider ko mil chuki hai.'); return r}
    accepted=true;
    return {...r,status:'accepted',rider:u.mobile,riderName:u.name,acceptedAt:Date.now(),activity:[...(r.activity||[]),'Accepted by '+u.name+': '+new Date().toLocaleString()]};
  });
  saveRides(rr);
  if(accepted)alert('Ride accepted. Pickup OTP verify karo.');
  showRiderOrders();
}
function startRideWithOtp(id){
  const otp=prompt('Customer Pickup OTP डालो');
  let ok=false;
  let rr=rides().map(r=>{
    if(r.id===id&&r.pickupOtp===otp&&r.status==='accepted'){
      ok=true;
      return {...r,status:'started',startedAt:Date.now(),activity:[...(r.activity||[]),'Pickup OTP verified: '+new Date().toLocaleString()]};
    }
    return r;
  });
  saveRides(rr);
  if(!ok)return alert('Wrong OTP ya ride already started');
  alert('Ride started. Google Maps open ho raha hai.');
  const r=rides().find(x=>x.id===id);
  if(r)window.open(`https://www.google.com/maps/dir/?api=1&origin=${r.pickup.lat},${r.pickup.lng}&destination=${r.drop.lat},${r.drop.lng}&travelmode=driving`,'_blank');
  showRiderOrders();
}
function completeRideWithOtp(id){
  const otp=prompt('Customer Drop OTP डालो');
  let u=session(), ok=false;
  let rr=rides().map(r=>{
    if(r.id===id&&r.dropOtp===otp&&(r.status==='started'||r.status==='accepted')){
      ok=true;
      return {...r,status:'completed',completedAt:Date.now(),activity:[...(r.activity||[]),'Drop OTP verified & completed: '+new Date().toLocaleString()]};
    }
    return r;
  });
  saveRides(rr);
  autoBlockSettlement(u.mobile);
  if(!ok)return alert('Wrong OTP ya ride complete nahi ho sakti');
  alert('Ride completed. Cash settlement ledger update ho gaya.');
  showRiderOrders();
}
function submitSettlement(){
  const u=session(), pending=cashCompletedByRider(u.mobile).slice(0,CASH_RIDE_LIMIT);
  if(!pending.length)return alert('No pending cash settlement.');
  const txn=$('txnId')?.value.trim(), amt=Number($('settleAmount')?.value||0);
  if(!txn)return alert('UPI Transaction ID जरूरी है');
  const need=settlementAmountForRides(pending);
  const st={id:Date.now(),rider:u.mobile,riderName:u.name,orderIds:pending.map(r=>r.orderNo||('#'+r.id)).join(', '),amount:amt,required:need,txn,status:'pending',date:new Date().toLocaleString()};
  let all=settlements(); all.unshift(st); saveSettlements(all);
  let text=`Rider4XR UPI Settlement Proof
Rider: ${u.name}
Rider ID/Mobile: ${u.mobile}
Order IDs: ${st.orderIds}
Required Amount: ₹${Math.round(need)}
Submitted Amount: ₹${Math.round(amt)}
Transaction ID: ${txn}
Status: Pending Verification
Please attach payment screenshot.`;
  window.open(`https://wa.me/91${OWNER_NUMBER}?text=${encodeURIComponent(text)}`,'_blank');
  alert('Settlement request saved. WhatsApp par screenshot attach karke bhejo.');
  if($('txnId'))$('txnId').value='';
}

function sendSupport(type){
  const u=session(); if(!u)return;
  const rr=rides();
  const current=type==='customer'?rr.find(r=>r.customer===u.mobile&&isActiveStatus(r.status)):rr.find(r=>r.rider===u.mobile&&isActiveStatus(r.status));
  const issueType=type==='customer'?($('customerIssue')?.value||'Other'):($('riderIssue')?.value||'Other');
  const msgBox=type==='customer'?$('customerIssueMsg'):$('riderIssueMsg');
  const detail=msgBox?msgBox.value.trim():'';
  const ticket={id:Date.now(),type,user:u.name,mobile:u.mobile,issueType,detail,status:'open',rideId:current?current.id:null,date:new Date().toLocaleString()};
  const all=issues(); all.unshift(ticket); saveIssues(all);
  let text=`Rider4XR ${type.toUpperCase()} ISSUE
Name: ${u.name}
Mobile: ${u.mobile}
Issue: ${issueType}
Detail: ${detail||'-'}
Ride ID: ${current?(current.orderNo||current.id):'No active ride'}
Date: ${ticket.date}`;
  window.open(`https://wa.me/91${OWNER_NUMBER}?text=${encodeURIComponent(text)}`,'_blank');
  alert('Issue saved. WhatsApp admin ko send karo.');
}

function approve(m,n,role){
  let us=users(), a=apps();
  const temp=role==='rider'?RIDER_TEMP_PASSWORD:CUSTOMER_TEMP_PASSWORD;
  us[m]={...(us[m]||{}),name:n,mobile:m,role,password:(us[m]&&us[m].password)||temp,approved:true,passwordChanged:(us[m]&&us[m].passwordChanged)||false,online:(us[m]&&us[m].online)||false};
  delete us[m].blockedReason; us[m].settlementBlocked=false; us[m].blacklisted=false;
  saveUsers(us);
  a=a.map(x=>x.mobile===m?{...x,status:'approved'}:x); saveApps(a);
  alert('Approved. Temporary password: '+temp);
  loadAdmin();
}
function adminResolveIssue(id){saveIssues(issues().map(x=>x.id===id?{...x,status:'resolved'}:x));loadAdmin()}
function adminBlockCustomer(m,h=24){let us=users();if(us[m]){us[m].blockUntil=Date.now()+h*3600*1000;saveUsers(us)}alert('24 hour block done');loadAdmin()}
function adminApproveExtra(m,h=24){let us=users();if(us[m]){us[m].extraBookingUntil=Date.now()+h*3600*1000;saveUsers(us)}alert('Extra booking approved for 24 hours');loadAdmin()}
function adminBlacklist(m){let us=users();if(us[m]){us[m].blacklisted=true;us[m].approved=false;us[m].online=false;saveUsers(us)}alert('Blacklisted');loadAdmin()}
function adminUnblock(m){let us=users();if(us[m]){delete us[m].blockUntil;delete us[m].blockedReason;us[m].settlementBlocked=false;us[m].blacklisted=false;us[m].approved=true;saveUsers(us)}alert('Unblocked');loadAdmin()}
function updateRideStatus(id,status){
  saveRides(rides().map(r=>r.id===id?{...r,status,completedAt:status==='completed'?Date.now():r.completedAt,activity:[...(r.activity||[]),'Admin status '+status+': '+new Date().toLocaleString()]}:r));
  loadAdmin();
}
function approveSettlement(id,success=true){
  let all=settlements(), st=all.find(x=>x.id===id);
  if(!st)return;
  st.status=success?'success':'reject';
  st.checkedAt=new Date().toLocaleString();
  if(success){
    let ids=st.orderIds.split(',').map(x=>x.trim());
    saveRides(rides().map(r=>ids.includes(r.orderNo||('#'+r.id))?{...r,settled:true,settledAt:Date.now()}:r));
    let us=users(); if(us[st.rider]){us[st.rider].settlementBlocked=false;us[st.rider].approved=true;delete us[st.rider].blockedReason;saveUsers(us)}
  }
  saveSettlements(all);
  loadAdmin();
}

function loadAdmin(){
  let u=session(); if(u.mobile!==OWNER_NUMBER)return location.href='index.html';
  let rr=rides(), a=apps(), us=users(), iss=issues(), st=settlements(), rev=reviews();
  $('totalOrders').textContent=rr.length;
  $('collection').textContent=money(rr.reduce((s,r)=>s+r.amount,0));
  $('payout').textContent=money(rr.reduce((s,r)=>s+r.riderPay,0));
  $('margin').textContent=money(rr.reduce((s,r)=>s+r.amount-r.riderPay,0));
  $('apps').innerHTML=a.map(x=>`<div class=item><b>${x.name}</b> ${x.role}<br>${x.mobile} • ${x.status}<br><button onclick="approve('${x.mobile}','${x.name}','${x.role}')">Approve + Temp Password</button> <button class=ghost onclick="adminBlacklist('${x.mobile}')">Blacklist</button></div>`).join('')||'<p class=hint>No applications</p>';
  $('allRides').innerHTML=rr.map(r=>`<div class=item><b>${r.orderNo||('#'+r.id)}</b> ${r.customerName} • ${r.status}<br>${r.rideLabel||'Bike Ride'}<br>${r.pickup.name.split(',')[0]} → ${r.drop.name.split(',')[0]}<br>${r.km.toFixed(1)} KM • Customer ${money(r.amount)} • Rider ${money(r.riderPay)} • Company ${money(r.amount-r.riderPay)} • ${r.payment}<br>Pickup OTP: ${r.pickupOtp||'-'} • Drop OTP: ${r.dropOtp||'-'}<br><small>${(r.activity||[]).join(' | ')}</small><br><button onclick="updateRideStatus(${r.id},'started')">Started</button> <button onclick="updateRideStatus(${r.id},'completed')">Complete</button> <button class=ghost onclick="updateRideStatus(${r.id},'admin_cancelled')">Admin Cancel</button></div>`).join('')||'<p class=hint>No rides</p>';
  $('riderDash').innerHTML=Object.values(us).filter(x=>x.role==='rider').map(r=>`<div class=item><b>${r.name}</b><br>${r.mobile}<br>Status: ${r.approved?'Approved':'Pending/Blocked'} ${r.settlementBlocked?'• Settlement blocked':''} ${r.blockedReason?'• '+r.blockedReason:''}<br>Cash pending: ${money(settlementAmountForRides(cashCompletedByRider(r.mobile)))}<br><button onclick="approve('${r.mobile}','${r.name}','rider')">Approve</button> <button class=ghost onclick="adminBlacklist('${r.mobile}')">Block</button> <button class=ghost onclick="adminUnblock('${r.mobile}')">Unblock</button></div>`).join('')||'<p class=hint>No riders</p>';
  $('customerDash').innerHTML=Object.values(us).filter(x=>x.role==='customer').map(c=>`<div class=item><b>${c.name}</b><br>${c.mobile}<br>Password: ${c.password}<br>Rides: ${rr.filter(r=>r.customer===c.mobile).length}<br>Reviews: ${rev.filter(v=>v.customer===c.mobile).length}</div>`).join('')||'<p class=hint>No customers</p>';
  $('settlements').innerHTML=st.map(s=>`<div class=item><b>Settlement ${s.status}</b><br>Rider: ${s.riderName} (${s.rider})<br>Orders: ${s.orderIds}<br>Required: ${money(s.required)} • Submitted: ${money(s.amount)}<br>UPI Txn: ${s.txn}<br><button onclick="approveSettlement(${s.id},true)">Success</button> <button class=ghost onclick="approveSettlement(${s.id},false)">Reject</button></div>`).join('')||'<p class=hint>No settlements</p>';
  $('rankingsAdmin').innerHTML=rankingList().map((r,i)=>`<div class=item><b>#${i+1} ${r.name}</b><br>${r.mobile}<br>Completed rides: ${r.rideCount} • Points: ${r.score} ${i===0?'• Prize eligible':''}</div>`).join('')||'<p class=hint>No rankings yet</p>';
  $('issues').innerHTML=iss.map(x=>`<div class=item><b>${x.type.toUpperCase()} Issue</b> • ${x.status}<br>${x.user} (${x.mobile})<br>${x.issueType}<br>${x.detail||''}<br>Ride ID: ${x.rideId||'-'}<br><button onclick="adminResolveIssue(${x.id})">Mark Resolved</button> <button class=ghost onclick="adminApproveExtra('${x.mobile}',24)">Approve Extra 24h</button></div>`).join('')||'<p class=hint>No issues</p>';
  $('reviewsAdmin').innerHTML=rev.map(v=>`<div class=item><b>${v.orderNo}</b> Rating: ${v.rating}/5<br>Customer: ${v.customer}<br>Rider: ${v.rider||'-'}<br>${v.comment||''}</div>`).join('')||'<p class=hint>No reviews yet</p>';
  const allUsers=Object.values(us).filter(x=>x.role!=='admin');
  $('controls').innerHTML=allUsers.map(x=>`<div class=item><b>${x.name}</b> ${x.role}<br>${x.mobile}<br>Status: ${x.blacklisted?'Blacklisted':x.approved?'Approved':'Not approved'} ${x.settlementBlocked?'• Settlement Blocked':''} ${x.blockedReason?'• '+x.blockedReason:''}<br>${!x.approved?`<button onclick="approve('${x.mobile}','${x.name}','${x.role}')">Approve</button> `:''}<button onclick="adminApproveExtra('${x.mobile}',24)">Extra Booking 24h</button> <button class=ghost onclick="adminBlockCustomer('${x.mobile}',24)">Block 24h</button> <button class=ghost onclick="adminBlacklist('${x.mobile}')">Blacklist</button> <button class=ghost onclick="adminUnblock('${x.mobile}')">Unblock</button></div>`).join('')||'<p class=hint>No users</p>';
}
