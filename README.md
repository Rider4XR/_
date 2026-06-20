# Rider4XR Website

Updated version with:
- Google location style pickup/drop interface
- Current location button using browser GPS permission
- Google Places Autocomplete + Distance Matrix support
- Auto fare calculation: minimum ₹50 till 2.5 KM + ₹12/KM after 2.5 KM + ₹10 platform fee
- UPI payment button
- WhatsApp booking with route, parcel type and fare

## Setup Needed
Open `script.js` and update:

```js
googleMapsApiKey: 'PASTE_GOOGLE_MAPS_API_KEY_HERE'
upiId: 'YOUR-UPI-ID@upi'
```

Google Cloud me these APIs enable karo:
- Maps JavaScript API
- Places API
- Distance Matrix API

Without API key, manual distance calculator and current GPS coordinates still work.
