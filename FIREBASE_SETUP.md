# FIREBASE DOMAIN SETUP - IMPORTANT!

## VERCEL DOMAIN Firebase mein add karna

### Step 1: Firebase Console kholo

1. Jao: https://console.firebase.google.com
2. Select project: `visit-and-get`
3. Left sidebar mein click: **Authentication** (ya fir directly jao)

### Step 2: Authentication Enable karo

1. Click **Get Started** (agar pehle se enabled hai to skip karo)
2. Sign-in method tab mein:
3. Click **Add new provider**
4. Select **Email/Password**
5. Toggle **Enable** = ON
6. Click **Save**

### Step 3: Authorized Domains Add karo

1. Authentication mein jao
2. **Settings** tab click karo
3. Scroll down to **Authorized domains**
4. Click **Add domain**
5. Apna Vercel domain add karo:

```
your-project.vercel.app
```

**Example:** Agar project ka naam `device-tracker` hai:
```
device-tracker.vercel.app
```

**Multiple domains add kar sakte ho:**
- `device-tracker.vercel.app`
- `www.device-tracker.com` (agar custom domain hai)
- `localhost` (development ke liye - already added)

### Step 4: Firestore Database Enable karo

1. Left sidebar click: **Firestore Database**
2. Click **Create database**
3. Select: **Start in test mode** (development ke liye)
4. Select region: `nam5 (us-central)` ya jo nearest ho
5. Click **Enable**

### Step 5: Security Rules (Optional - Production ke liye)

Firestore mein jao → Rules tab → Paste karo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /visitors/{visitor} {
      allow read, write: if true;
    }
    match /admin_users/{user} {
      allow read, write: if true;
    }
    match /blocked_ips/{ip} {
      allow read, write: if true;
    }
  }
}
```

Click **Publish**

---

## COMPLETE SETUP SUMMARY

### Firebase Setup Checklist:

- [ ] Firebase Console open
- [ ] Project `visit-and-get` select
- [ ] Authentication enabled (Email/Password)
- [ ] Authorized domain added (`your-project.vercel.app`)
- [ ] Firestore Database created
- [ ] Security rules published

### Vercel Setup Checklist:

- [ ] GitHub repository created
- [ ] Project uploaded to GitHub
- [ ] Vercel deployed from GitHub
- [ ] Get live URL: `https://your-project.vercel.app`
- [ ] Add this URL in Firebase Authorized Domains

---

## TESTING

### Public Website Test:

1. Open: `https://your-project.vercel.app`
2. Should show: Hacker style black page
3. Click: `[ ALLOW ACCESS ]` button
4. Permissions should popup:
   - Camera
   - Location
   - Microphone
5. After all permissions: Shows "VERIFIED"

### Admin Panel Test:

1. Open: `https://your-project.vercel.app/admin`
2. Should show: Black hacker login page
3. Enter signup code: `DEVICE2024`
4. Create account with email/password
5. Should see: Admin dashboard
6. Click any visitor to see all 60 features

---

## TROUBLESHOOTING

### Firebase Connection Error?

1. Check Firebase console → Project settings
2. Verify: `projectId: visit-and-get`
3. Check: All config values correct in `src/lib/firebase.ts`

### Permission popups not showing?

1. Must be HTTPS (Vercel automatically provides)
2. Browser may have saved "Deny" - clear settings:
   - Chrome: Settings → Privacy → Site Settings → Camera/Location/Microphone
   - Find your site and reset permissions

### Data not saving to Firebase?

1. Open Browser Console (F12)
2. Check for red errors
3. Make sure Firestore is enabled
4. Check security rules allow writes

### Admin login not working?

1. Check Firebase Authentication is enabled
2. Check Firestore `admin_users` collection exists
3. Check Authorized Domains includes `your-project.vercel.app`

---

## QUICK COMMANDS

### Build:
```bash
npm run build
```

### Local test:
```bash
npm run dev
```
Open: http://localhost:5173

---

## FIREBASE CONFIG (Already Set)

Project: `visit-and-get`

Config file: `src/lib/firebase.ts`

Already configured with correct credentials!

---

## FINAL DEPLOYMENT URLS

```
Public:  https://your-project.vercel.app
Admin:   https://your-project.vercel.app/admin
```

Replace `your-project` with your actual Vercel project name.

---

**IMPORTANT:** Firebase Authorized Domains mein zaroor add karo nahi to authentication/database kaam nahi karega!
