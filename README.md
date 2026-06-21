# Rider4XR Final All India V1

Included:
- Premium 3D bike style UI
- Customer login + signup request
- Temporary password + mandatory password change
- Free map: OpenStreetMap + Leaflet + OSRM route
- Current location auto detect
- Drop search, distance and fare
- Swipe bike to book
- Book for self / someone else
- Rider panel with ring/beep for orders within 3 KM
- Admin panel owner only
- Cash + Online UPI payment mode
- Customer full payment, rider payout shown together in admin

Pricing:
- Customer: ₹60 up to 3 KM, then ₹15/KM
- Rider: ₹40 up to 3 KM, then ₹13/KM
- UPI: 9929562585@ptyes

Login rules:
- Admin: Owner-only private access. Do not share credentials publicly.
- Customer: any mobile number can signup. Temporary password shown to customer: WELCOME. First login requires password change.
- Rider: any mobile number can apply. Temporary password: R4X@2004, shared manually by owner on WhatsApp. Rider can login/change password, but rides will not be assigned until admin approves.

Note: This is frontend/demo version using localStorage. For live production, connect Firebase Auth, Firestore, secure rules, and hosting.


Update: Dark/Light mode added across homepage, customer, rider, admin and password pages. Theme is saved in localStorage. Logo assets added in assets folder.
