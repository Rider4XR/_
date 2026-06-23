function sendDemoOtp(){
  const mobile=document.getElementById("mobileInput").value.trim();
  const role=document.getElementById("roleInput").value;
  const ok=document.getElementById("termsCheck").checked;
  if(!mobile){alert("Enter mobile number.");return}
  if(!ok){alert("Please accept demo terms.");return}
  localStorage.setItem(KEYS.pendingLogin,JSON.stringify({mobile,role}));
  document.getElementById("otpBox").classList.remove("hidden");
  document.getElementById("otpInput").focus();
  alert("Demo OTP is 1234");
}
function verifyOtpAndLogin(){
  const otp=document.getElementById("otpInput").value.trim();
  const pending=JSON.parse(localStorage.getItem(KEYS.pendingLogin)||"null");
  if(!pending){alert("Please send OTP first.");return}
  if(otp!==CONFIG.demoOtp){alert("Wrong OTP. Demo OTP is 1234.");return}
  const users=getUsers();
  if(!users[pending.mobile]) users[pending.mobile]={mobile:pending.mobile,role:pending.role,name:pending.role.charAt(0).toUpperCase()+pending.role.slice(1)+" "+pending.mobile.slice(-4),online:false,couponUsed:false,createdAt:new Date().toISOString()};
  users[pending.mobile].role=pending.role; saveUsers(users); setCurrentMobile(pending.mobile); localStorage.removeItem(KEYS.pendingLogin);
  if(pending.role==="customer") location.href="customer.html"; if(pending.role==="rider") location.href="rider.html"; if(pending.role==="admin") location.href="admin.html";
}
function requireLogin(requiredRole=null){const user=getCurrentUser(); if(!user){location.href="index.html";return null} if(requiredRole&&user.role!==requiredRole&&user.role!=="admin"){alert("Please login with correct role.");location.href="index.html";return null} return user}
function logoutUser(){localStorage.removeItem(KEYS.session);location.href="index.html"}