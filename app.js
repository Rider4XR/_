
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
const OWNER_NUMBER='9929562585', OWNER_PASSWORD='NEHA@#LOBE', UPI_ID='9929562585@ptyes';
const BASE_KM=3, CUSTOMER_BASE=60, CUSTOMER_EXTRA=15, RIDER_BASE=40, RIDER_EXTRA=13, RADIUS=3;
const SHARING_CHARGE=25;
const $=id=>document.getElementById(id); const money=n=>'₹'+Math.round(n);
const get=(k,d)=>JSON.parse(localStorage[k]||JSON.stringify(d)); const set=(k,v)=>localStorage[k]=JSON.stringify(v);
function seed(){if(!localStorage.r4Users){set('r4Users',{[OWNER_NUMBER]:{name:'Owner',mobile:OWNER_NUMBER,role:'admin',password:OWNER_PASSWORD,approved:true,passwordChanged:true}})} if(!localStorage.r4Rides)set('r4Rides',[]); if(!localStorage.r4Apps)set('r4Apps',[]); if(!localStorage.r4Issues)set('r4Issues',[])} seed();

// Login fix: keep latest passwords even if old localStorage data exists in browser
const CUSTOMER_TEMP_PASSWORD = 'WELCOME';
const RIDER_TEMP_PASSWORD = 'R4X@2004';
(function migrateCredentials(){
  let us = users();
  us[OWNER_NUMBER] = {name:'Owner', mobile:OWNER_NUMBER, role:'admin', password:OWNER_PASSWORD, approved:true, passwordChanged:true};
  if(us['9000000001']){ us['9000000001'].password=CUSTOMER_TEMP_PASSWORD; us['9000000001'].role='customer'; us['9000000001'].approved=true; }
  if(us['9000000002']){ us['9000000002'].password=RIDER_TEMP_PASSWORD; us['9000000002'].role='rider'; us['9000000002'].approved=false; }
  saveUsers(us);
})();

function users(){return get('r4Users',{})} function saveUsers(u){set('r4Users',u)} function rides(){return get('r4Rides',[])} function saveRides(r){set('r4Rides',r)}
function fare(km){return km<=BASE_KM?CUSTOMER_BASE:CUSTOMER_BASE+(km-BASE_KM)*CUSTOMER_EXTRA} function riderPay(km){return km<=BASE_KM?RIDER_BASE:RIDER_BASE+(km-BASE_KM)*RIDER_EXTRA}
function rideType(){return (document.getElementById('rideType')?.value||'private')}
function finalFare(km,type=rideType()){return type==='sharing'?SHARING_CHARGE:fare(km)}
function finalRiderPay(km,type=rideType()){return type==='sharing'?SHARING_CHARGE:riderPay(km)}
function rideLabel(type=rideType()){return type==='sharing'?'Friendly Drive / Sharing':'Private Delivery'}
function dist(a,b){const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLng=(b.lng-a.lng)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
function session(){const m=localStorage.r4Session,u=users()[m]; if(!u){location.href='index.html';return null} return u} function logout(){localStorage.removeItem('r4Session');location.href='index.html'}
function login(){const m=$('mobile').value.trim(),p=$('password').value,u=users()[m]; if(!u||u.password!==p)return alert('Wrong mobile/password'); if(u.blacklisted)return alert('Your account is blocked. Contact admin.'); if(!u.approved && u.role==='customer')return alert('Customer account pending approval'); localStorage.r4Session=m; if(u.role==='admin') location.href='admin.html'; else if(!u.passwordChanged) location.href='change-password.html'; else location.href=u.role+'.html'}
function signup(){
  let app={id:Date.now(),name:$('suName').value.trim(),mobile:$('suMobile').value.trim(),role:$('suRole').value,status:'pending',date:new Date().toLocaleString()};
  if(!app.name||!app.mobile)return alert('Name/mobile डालो');
  let us=users();
  if(us[app.mobile])return alert('This mobile number is already registered. Please login.');
  let a=get('r4Apps',[]); a.push(app); set('r4Apps',a);
  if(app.role==='customer'){
    us[app.mobile]={name:app.name,mobile:app.mobile,role:'customer',password:'WELCOME',approved:true,passwordChanged:false};
    saveUsers(us);
    alert('Customer account created. Temporary Password: WELCOME. First login ke baad password change karna mandatory hai.');
  }else{
    us[app.mobile]={name:app.name,mobile:app.mobile,role:'rider',password:'R4X@2004',approved:false,passwordChanged:false,online:false,vehicle:'Bike'};
    saveUsers(us);
    let msg=encodeURIComponent(`New Rider Signup Request
Name: ${app.name}
Mobile: ${app.mobile}
Status: Pending Approval
Temporary password owner will share manually: R4X@2004`);
    window.open(`https://wa.me/91${OWNER_NUMBER}?text=${msg}`,'_blank');
    alert('Rider request saved. Owner approval ke baad ride milegi. Temporary password owner WhatsApp par dega.');
  }
} 
function changePassword(){let u=session(), us=users(), n=$('newPass').value, c=$('confirmPass').value; if(n.length<6)return alert('6 character se bada password rakho'); if(n!==c)return alert('Password match nahi'); us[u.mobile].password=n; us[u.mobile].passwordChanged=true; saveUsers(us); alert('Password changed'); location.href=u.role+'.html'}
let map, pickup={lat:31.1048,lng:77.1734,name:'Current Location'}, drop=null, routeLine=null, markers=[];
function initMap(){map=L.map('map').setView([pickup.lat,pickup.lng],13); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map); locate(); renderRiders()}
function locate(){if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>{pickup={lat:p.coords.latitude,lng:p.coords.longitude,name:'Current Location'}; map.setView([pickup.lat,pickup.lng],15); draw()},()=>draw()); else draw()}
async function searchDrop(){let q=$('drop').value.trim(); if(!q)return; let r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`); let j=await r.json(); if(!j[0])return alert('Location nahi mili'); drop={lat:+j[0].lat,lng:+j[0].lon,name:j[0].display_name}; draw(); calcRoute()}
function clearMarkers(){markers.forEach(m=>map.removeLayer(m));markers=[]} function draw(){if(!map)return; clearMarkers(); markers.push(L.marker([pickup.lat,pickup.lng]).addTo(map).bindPopup('Pickup')); if(drop)markers.push(L.marker([drop.lat,drop.lng]).addTo(map).bindPopup('Drop')); renderRiders(false)}
async function calcRoute(){if(!drop)return; let km=dist(pickup,drop); try{let r=await fetch(`https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`);let j=await r.json(); if(j.routes&&j.routes[0]){km=j.routes[0].distance/1000; if(routeLine)map.removeLayer(routeLine); routeLine=L.geoJSON(j.routes[0].geometry,{style:{weight:5}}).addTo(map); map.fitBounds(routeLine.getBounds(),{padding:[20,20]})}}catch(e){} $('distance').textContent=km.toFixed(2)+' KM'; $('fare').textContent=money(finalFare(km)); $('riderPay').textContent=money(finalRiderPay(km)); localStorage.r4LastKm=km}
function renderRiders(clear=true){if(!map)return; const us=users(); Object.values(us).filter(u=>u.role==='rider'&&u.online&&u.lat).forEach(r=>{let near=dist(pickup,{lat:r.lat,lng:r.lng}); let icon=L.divIcon({html:'🏍️',className:'',iconSize:[28,28]}); markers.push(L.marker([r.lat,r.lng],{icon}).addTo(map).bindPopup(`${r.name} - ${near.toFixed(1)} KM`))})}
function bookRide(){if(!drop)return alert('Drop location select करो'); const u=session(), km=+(localStorage.r4LastKm||dist(pickup,drop)); const ride={id:Date.now(),customer:u.mobile,customerName:u.name,pickup,drop,km,rideType:rideType(), rideLabel:rideLabel(), amount:finalFare(km),riderPay:finalRiderPay(km),payment:$('payment').value,forWhom:$('forWhom').value,receiver:$('receiver').value,status:'searching',created:new Date().toLocaleString()}; let rr=rides(); rr.unshift(ride); saveRides(rr); alert('Ride booked. 3 KM ke andar rider ko ring jayegi.'); location.reload()}
function setupSwipe(){const s=$('swipe'),k=$('knob'); if(!s)return; let down=false,start=0; const move=x=>{let w=s.clientWidth-62,pos=Math.max(0,Math.min(w,x-start));k.style.transform=`translateX(${pos}px)`; if(pos>w*.82){down=false;bookRide()}}; k.onpointerdown=e=>{down=true;start=e.clientX}; window.onpointermove=e=>{if(down)move(e.clientX)}; window.onpointerup=()=>{down=false;k.style.transform='translateX(0)'}}
function loadCustomer(){let u=session(); if(!u.passwordChanged)return location.href='change-password.html'; $('hello').textContent='Hi, '+u.name; initMap(); setupSwipe(); if($('rideType')) $('rideType').onchange=()=>{ if(drop) calcRoute(); }; let my=rides().filter(r=>r.customer===u.mobile); $('history').innerHTML=my.map(r=>`<div class=item><b>${r.pickup.name.split(',')[0]} → ${r.drop.name.split(',')[0]}</b><br>${r.rideLabel||'Private Delivery'} • ${r.km.toFixed(1)} KM • ${money(r.amount)} • ${r.status}</div>`).join('')||'<p class=hint>No rides yet</p>'}
function beep(){try{let a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=.08;o.start();setTimeout(()=>{o.stop();a.close()},350)}catch(e){}}
function loadRider(){let u=session(),us=users(); if(!u.passwordChanged)return location.href='change-password.html'; $('riderName').textContent=u.name; if(!u.approved){ if($('ringBox'))$('ringBox').innerHTML='<b>Pending Approval</b><p class=hint>Admin approval ke bina ride/order nahi milegi.</p>'; if($('orders'))$('orders').innerHTML='<p class=hint>Your rider account is under review.</p>'; if($('earn'))$('earn').textContent='₹0'; if($('done'))$('done').textContent='0'; return; } if(navigator.geolocation)navigator.geolocation.watchPosition(p=>{us=users(); us[u.mobile].lat=p.coords.latitude; us[u.mobile].lng=p.coords.longitude; saveUsers(us)}); showRiderOrders(); setInterval(showRiderOrders,3000)}
function showRiderOrders(){let u=session(), rr=rides(), me=users()[u.mobile], pending=rr.filter(r=>r.status==='searching'&&me.online&&me.lat&&dist({lat:me.lat,lng:me.lng},r.pickup)<=RADIUS); if(pending.length){$('ringBox').classList.add('ring'); beep()} else $('ringBox').classList.remove('ring'); $('orders').innerHTML=pending.map(r=>`<div class=item><b>New Ride Ring</b><br>${r.rideLabel||'Private Delivery'}<br>${r.pickup.name.split(',')[0]} → ${r.drop.name.split(',')[0]}<br>${r.km.toFixed(1)} KM • Earning ${money(r.riderPay)}<br><button onclick="acceptRide(${r.id})">Accept</button> <button class=ghost onclick="rejectRide(${r.id})">Reject</button></div>`).join('')||'<p class=hint>No nearby ride</p>'; const done=rr.filter(r=>r.rider===u.mobile); $('earn').textContent=money(done.reduce((s,r)=>s+r.riderPay,0)); $('done').textContent=done.length}
function setOnline(v){let us=users(),u=session(); if(!us[u.mobile].approved)return alert('Admin approval ke bina online nahi ho sakte.'); us[u.mobile].online=v;saveUsers(us);showRiderOrders()} function acceptRide(id){let rr=rides(),u=session(); rr=rr.map(r=>r.id===id?{...r,status:'accepted',rider:u.mobile,riderName:u.name}:r); saveRides(rr); alert('Ride accepted')} function rejectRide(id){alert('Rejected for demo')}
function loadAdmin(){let u=session(); if(u.mobile!==OWNER_NUMBER)return location.href='index.html'; let rr=rides(), apps=get('r4Apps',[]), us=users(); $('totalOrders').textContent=rr.length; $('collection').textContent=money(rr.reduce((s,r)=>s+r.amount,0)); $('payout').textContent=money(rr.reduce((s,r)=>s+r.riderPay,0)); $('margin').textContent=money(rr.reduce((s,r)=>s+r.amount-r.riderPay,0)); $('apps').innerHTML=apps.map(a=>`<div class=item><b>${a.name}</b> ${a.role}<br>${a.mobile} • ${a.status}<br><button onclick="approve('${a.mobile}','${a.name}','${a.role}')">Approve + Temp Password</button></div>`).join('')||'<p class=hint>No applications</p>'; $('allRides').innerHTML=rr.map(r=>`<div class=item><b>${r.customerName}</b> ${r.km.toFixed(1)} KM • ${money(r.amount)}<br>Rider payout ${money(r.riderPay)} • Margin ${money(r.amount-r.riderPay)} • ${r.payment}</div>`).join('')}
function approve(m,n,role){let us=users(), apps=get('r4Apps',[]); const temp=role==='rider' ? 'R4X@2004' : 'WELCOME'; us[m]={...(us[m]||{}),name:n,mobile:m,role,password:(us[m]&&us[m].password)||temp,approved:true,passwordChanged:(us[m]&&us[m].passwordChanged)||false,online:(us[m]&&us[m].online)||false}; saveUsers(us); apps=apps.map(a=>a.mobile===m?{...a,status:'approved'}:a); set('r4Apps',apps); alert('Approved. Temporary password: '+temp); loadAdmin()}

// Rider4XR Support, Admin control, Active ride lock
function issues(){return get('r4Issues',[])}
function saveIssues(v){set('r4Issues',v)}
function isActiveStatus(s){return ['searching','accepted','started','on_the_way'].includes(s)}
function customerHasActiveRide(m){return rides().some(r=>r.customer===m && isActiveStatus(r.status))}
function hasExtraApproval(m){const us=users(); const u=us[m]; return u && u.extraBookingUntil && Date.now()<u.extraBookingUntil}
function blockUntilActive(m){const us=users(); const u=us[m]; return u && u.blockUntil && Date.now()<u.blockUntil}
function sendSupport(type){
  const u=session(); if(!u)return;
  const rr=rides();
  const current= type==='customer' ? rr.find(r=>r.customer===u.mobile && isActiveStatus(r.status)) : rr.find(r=>r.rider===u.mobile && isActiveStatus(r.status));
  const issueType = type==='customer' ? ($('customerIssue')?.value||'Other') : ($('riderIssue')?.value||'Other');
  const msgBox = type==='customer' ? $('customerIssueMsg') : $('riderIssueMsg');
  const detail = msgBox ? msgBox.value.trim() : '';
  const ticket={id:Date.now(),type,user:u.name,mobile:u.mobile,issueType,detail,status:'open',rideId:current?current.id:null,date:new Date().toLocaleString()};
  const all=issues(); all.unshift(ticket); saveIssues(all);
  let text=`Rider4XR ${type.toUpperCase()} ISSUE\nName: ${u.name}\nMobile: ${u.mobile}\nIssue: ${issueType}\nDetail: ${detail||'-'}\nRide ID: ${ticket.rideId||'No active ride'}\nDate: ${ticket.date}`;
  window.open(`https://wa.me/91${OWNER_NUMBER}?text=${encodeURIComponent(text)}`,'_blank');
  alert('Issue saved. WhatsApp admin ko send karo.');
}
function adminResolveIssue(id){let a=issues().map(x=>x.id===id?{...x,status:'resolved'}:x);saveIssues(a);loadAdmin()}
function adminBlockCustomer(m,h=24){let us=users(); if(us[m]){us[m].blockUntil=Date.now()+h*3600*1000; saveUsers(us)} alert('Customer 24 hour block'); loadAdmin()}
function adminApproveExtra(m,h=24){let us=users(); if(us[m]){us[m].extraBookingUntil=Date.now()+h*3600*1000; saveUsers(us)} alert('Extra booking approved for 24 hours'); loadAdmin()}
function adminBlacklist(m){let us=users(); if(us[m]){us[m].blacklisted=true; us[m].approved=false; saveUsers(us)} alert('Blacklisted'); loadAdmin()}
function adminUnblock(m){let us=users(); if(us[m]){delete us[m].blockUntil; us[m].blacklisted=false; us[m].approved=true; saveUsers(us)} alert('Unblocked'); loadAdmin()}
function updateRideStatus(id,status){let rr=rides().map(r=>r.id===id?{...r,status}:r);saveRides(rr);loadAdmin()}

// Override booking with active ride lock + admin approval
bookRide=function(){
  if(!drop)return alert('Drop location select करो');
  const u=session();
  const us=users();
  if(us[u.mobile]?.blacklisted)return alert('Your account is blocked. Contact admin.');
  if(blockUntilActive(u.mobile))return alert('You are blocked for 24 hours. WhatsApp admin for approval.');
  if(customerHasActiveRide(u.mobile) && !hasExtraApproval(u.mobile))return alert('Your ride is already active. New booking ke liye WhatsApp admin approval चाहिए.');
  const km=+(localStorage.r4LastKm||dist(pickup,drop));
  const ride={id:Date.now(),customer:u.mobile,customerName:u.name,pickup,drop,km,rideType:rideType(), rideLabel:rideLabel(), amount:finalFare(km),riderPay:finalRiderPay(km),payment:$('payment').value,forWhom:$('forWhom').value,receiver:$('receiver').value,status:'searching',created:new Date().toLocaleString(),activity:['Booked: '+new Date().toLocaleString()]};
  let rr=rides(); rr.unshift(ride); saveRides(rr);
  alert('Ride booked. 3 KM ke andar rider ko ring jayegi.');
  location.reload();
}

// Override accept ride to save activity
acceptRide=function(id){let rr=rides(),u=session(); rr=rr.map(r=>r.id===id?{...r,status:'accepted',rider:u.mobile,riderName:u.name,activity:[...(r.activity||[]),'Accepted by '+u.name+': '+new Date().toLocaleString()]}:r); saveRides(rr); alert('Ride accepted'); showRiderOrders();}

// Override rider order view: show active rides too
const _oldShowRiderOrders=showRiderOrders;
showRiderOrders=function(){
  let u=session(), rr=rides(), me=users()[u.mobile];
  let pending=rr.filter(r=>r.status==='searching'&&me.approved&&me.online&&me.lat&&dist({lat:me.lat,lng:me.lng},r.pickup)<=RADIUS);
  if(pending.length){$('ringBox').classList.add('ring'); beep()} else $('ringBox').classList.remove('ring');
  $('orders').innerHTML=pending.map(r=>`<div class=item><b>New Ride Ring</b><br>${r.rideLabel||'Private Delivery'}<br>${r.pickup.name.split(',')[0]} → ${r.drop.name.split(',')[0]}<br>${r.km.toFixed(1)} KM • Earning ${money(r.riderPay)}<br><button onclick="acceptRide(${r.id})">Accept</button> <button class=ghost onclick="rejectRide(${r.id})">Reject</button></div>`).join('')||'<p class=hint>No nearby ride</p>';
  const done=rr.filter(r=>r.rider===u.mobile);
  $('earn').textContent=money(done.reduce((s,r)=>s+r.riderPay,0)); $('done').textContent=done.length;
  if($('riderRides'))$('riderRides').innerHTML=done.map(r=>`<div class=item><b>#${r.id}</b> ${r.status}<br>${r.rideLabel||'Private Delivery'}<br>${r.pickup.name.split(',')[0]} → ${r.drop.name.split(',')[0]}<br>${r.km.toFixed(1)} KM • ${money(r.riderPay)}<br><button onclick="window.open('https://www.openstreetmap.org/directions?from=${r.pickup.lat}%2C${r.pickup.lng}&to=${r.drop.lat}%2C${r.drop.lng}','_blank')">Navigate</button></div>`).join('')||'<p class=hint>No rides assigned</p>';
}

// Override admin dashboard with tickets + control
loadAdmin=function(){
 let u=session(); if(u.mobile!==OWNER_NUMBER)return location.href='index.html';
 let rr=rides(), apps=get('r4Apps',[]), us=users(), iss=issues();
 $('totalOrders').textContent=rr.length; $('collection').textContent=money(rr.reduce((s,r)=>s+r.amount,0)); $('payout').textContent=money(rr.reduce((s,r)=>s+r.riderPay,0)); $('margin').textContent=money(rr.reduce((s,r)=>s+r.amount-r.riderPay,0));
 $('apps').innerHTML=apps.map(a=>`<div class=item><b>${a.name}</b> ${a.role}<br>${a.mobile} • ${a.status}<br><button onclick="approve('${a.mobile}','${a.name}','${a.role}')">Approve + Temp Password</button> <button class=ghost onclick="adminBlacklist('${a.mobile}')">Blacklist</button></div>`).join('')||'<p class=hint>No applications</p>';
 $('allRides').innerHTML=rr.map(r=>`<div class=item><b>#${r.id}</b> ${r.customerName} • ${r.status}<br>${r.rideLabel||'Private Delivery'}<br>${r.pickup.name.split(',')[0]} → ${r.drop.name.split(',')[0]}<br>${r.km.toFixed(1)} KM • Collection ${money(r.amount)} • Rider payout ${money(r.riderPay)} • Margin ${money(r.amount-r.riderPay)} • ${r.payment}<br><small>${(r.activity||[]).join(' | ')}</small><br><button onclick="updateRideStatus(${r.id},'started')">Started</button> <button onclick="updateRideStatus(${r.id},'completed')">Complete</button> <button class=ghost onclick="updateRideStatus(${r.id},'admin_cancelled')">Admin Cancel</button></div>`).join('')||'<p class=hint>No rides</p>';
 if($('issues'))$('issues').innerHTML=iss.map(x=>`<div class=item><b>${x.type.toUpperCase()} Issue</b> • ${x.status}<br>${x.user} (${x.mobile})<br>${x.issueType}<br>${x.detail||''}<br>Ride ID: ${x.rideId||'-'}<br><button onclick="adminResolveIssue(${x.id})">Mark Resolved</button> <button class=ghost onclick="adminApproveExtra('${x.mobile}',24)">Approve Extra 24h</button></div>`).join('')||'<p class=hint>No issues</p>';
 const allUsers=Object.values(us).filter(x=>x.role!=='admin');
 if($('controls'))$('controls').innerHTML=allUsers.map(x=>`<div class=item><b>${x.name}</b> ${x.role}<br>${x.mobile}<br>Status: ${x.blacklisted?'Blacklisted':x.approved?'Approved':'Not approved'} ${blockUntilActive(x.mobile)?'• 24h Block':''} ${hasExtraApproval(x.mobile)?'• Extra Approved':''}<br>${!x.approved?`<button onclick="approve('${x.mobile}','${x.name}','${x.role}')">Approve</button> `:''}<button onclick="adminApproveExtra('${x.mobile}',24)">Extra Booking 24h</button> <button class=ghost onclick="adminBlockCustomer('${x.mobile}',24)">Block 24h</button> <button class=ghost onclick="adminBlacklist('${x.mobile}')">Blacklist</button> <button class=ghost onclick="adminUnblock('${x.mobile}')">Unblock</button></div>`).join('')||'<p class=hint>No users</p>';
}


// Robust login override: any customer mobile can start with WELCOME, rider starts with R4X@2004 but needs admin approval for rides.
login=function(){
  const m=$('mobile').value.trim();
  const p=$('password').value;
  if(!m || !p) return alert('Mobile number aur password डालो');
  let us=users();
  let u=us[m];

  // Owner/admin login only with owner number
  if(m===OWNER_NUMBER){
    if(p!==OWNER_PASSWORD) return alert('Wrong mobile/password');
    us[m]={name:'Owner',mobile:m,role:'admin',password:OWNER_PASSWORD,approved:true,passwordChanged:true};
    saveUsers(us);
    localStorage.r4Session=m;
    return location.href='admin.html';
  }

  // Existing user login
  if(u){
    if(u.password!==p) return alert('Wrong mobile/password');
    if(u.blacklisted) return alert('Your account is blocked. Contact admin.');
    localStorage.r4Session=m;
    if(!u.passwordChanged) return location.href='change-password.html';
    return location.href=u.role+'.html';
  }

  // New customer can login with temporary password WELCOME
  if(p===CUSTOMER_TEMP_PASSWORD){
    us[m]={name:'Customer '+m.slice(-4),mobile:m,role:'customer',password:CUSTOMER_TEMP_PASSWORD,approved:true,passwordChanged:false};
    saveUsers(us);
    localStorage.r4Session=m;
    alert('Customer account created. Ab password change karna mandatory hai.');
    return location.href='change-password.html';
  }

  // New rider can login only after owner shares R4X@2004; ride will not come until admin approves.
  if(p===RIDER_TEMP_PASSWORD){
    us[m]={name:'Rider '+m.slice(-4),mobile:m,role:'rider',password:RIDER_TEMP_PASSWORD,approved:false,passwordChanged:false,online:false,vehicle:'Bike'};
    saveUsers(us);
    let a=get('r4Apps',[]);
    if(!a.some(x=>x.mobile===m)){
      a.unshift({id:Date.now(),name:'Rider '+m.slice(-4),mobile:m,role:'rider',status:'pending',date:new Date().toLocaleString()});
      set('r4Apps',a);
    }
    localStorage.r4Session=m;
    alert('Rider account pending approval. Password change ke baad bhi ride admin approval ke bina nahi milegi.');
    return location.href='change-password.html';
  }

  alert('Wrong mobile/password');
};
