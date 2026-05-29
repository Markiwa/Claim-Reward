# Device Tracker - Advanced Device Tracking System

## Overview

This system tracks 60 device features and stores data in Firebase.

### Public Page
- Tracking link for visitors
- Collects 30 silent features (no permission)
- Collects 30 permission features (with user consent)
- Saves to Firebase automatically

### Admin Panel
- URL: `/admin`
- Secret code protected
- IP blocking (1 hour on wrong code)
- View all visitor data
- One device = one account

---

## Quick Start

### Local Development
```bash
npm install
npm run dev
```

- Public: http://localhost:5173
- Admin: http://localhost:5173/admin

### Deployment
See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## Feature List (60 Total)

### Silent Features (30) - No Permission Required
1. Screen Width
2. Screen Height
3. Color Depth
4. Pixel Ratio
5. Available Screen Width
6. Available Screen Height
7. Device Memory
8. CPU Cores
9. Max Touch Points
10. Platform
11. Vendor
12. Language
13. Languages List
14. Timezone
15. Timezone Offset
16. Cookies Enabled
17. Do Not Track
18. Hardware Concurrency
19. Online Status
20. Network Type
21. Effective Network Type
22. Downlink Speed
23. Network RTT
24. Save Data Mode
25. Battery Level
26. Battery Charging
27. Battery Charging Time
28. Battery Discharging Time
29. WebGL Vendor
30. WebGL Renderer

### Permission Features (30) - Requires User Consent
1. Front Camera
2. Back Camera
3. Microphone
4. Geolocation
5. Contacts Access
6. Clipboard Read
7. Clipboard Write
8. Bluetooth Devices
9. USB Devices
10. Notifications
11. Motion Sensors
12. Orientation Sensors
13. Screen Capture
14. Media Devices
15. Audio Devices
16. Storage Estimate
17. Accelerometer
18. Gyroscope
19. Magnetometer
20. VR Displays
21. Canvas Fingerprint
22. Audio Fingerprint
23. WebGL Fingerprint
24. WebRTC IP
25. Ambient Light
26. And more...

---

## Secret Codes

See `SECRET_CODES.txt` for codes.

---

## Technology Stack

- Frontend: React + TypeScript + Vite
- Database: Firebase Firestore
- Auth: Firebase (custom implementation)
- Deployment: Vercel
- Code Hosting: GitHub

---

## Firebase Setup

Project already configured with:
- Project ID: visit-and-get
- All credentials in `src/lib/firebase.ts`

Just enable Firestore in Firebase Console.

---

## Cost

Total: **$0/month**

- Firebase: FREE tier
- Vercel: FREE tier
- GitHub: FREE for public repos

---

## License

Private project - All rights reserved
