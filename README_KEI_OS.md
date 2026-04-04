# KEI OS - C2 Admin Dashboard

Professional-grade Command & Control (C2) Admin Dashboard for the kei-Game ecosystem built with Next.js 14, TypeScript, Firebase, Tailwind CSS, and Shadcn/UI components.

## 🎯 Overview

KEI OS is a sophisticated admin terminal for managing and controlling distributed device targets. It features a cyberpunk-themed interface with real-time data synchronization, command execution, and comprehensive activity logging.

### Key Features

- **Real-time Device Monitoring**: Live tracking of all active targets with battery, status, and location data
- **Command Center**: Execute remote operations (Photo Capture, GPS Sync, Kill Switch) on target devices
- **Global Map Integration**: Leaflet.js powered map with real-time device location tracking
- **Activity Terminal**: Code-block style terminal for viewing telemetry logs
- **System Logs**: Comprehensive audit trail with filtering and sorting
- **Military-Grade Authentication**: Firebase Auth with email/password login
- **Responsive Design**: Mobile-friendly with collapsible sidebar navigation
- **Dark Cyberpunk Theme**: Custom midnight theme with neon green accent (#00ff41)

## 📋 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Shadcn/UI
- **State Management**: TanStack Query (React Query) v5
- **Backend**: Firebase Realtime Database + Authentication
- **Charts**: Recharts for analytics
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Maps**: Leaflet.js + React-Leaflet

## 🔧 Installation

### Prerequisites

- Node.js 18+ and npm
- Firebase Project (kei-project-cbbc4 or your own)

### Setup Steps

1. **Clone the repository**
   ```bash
   cd kei-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Firebase**
   
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kei-project-cbbc4.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=kei-project-cbbc4
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kei-project-cbbc4.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Access the dashboard at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with metadata
│   ├── page.tsx                   # Home redirect
│   ├── globals.css                # Global styles & Tailwind
│   ├── auth/
│   │   └── login/page.tsx         # Login page
│   ├── dashboard/
│   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   ├── page.tsx               # Dashboard home
│   │   ├── command-center/        # Remote commands
│   │   ├── map/                   # Location tracking
│   │   ├── terminal/              # Activity logs
│   │   └── logs/                  # System audit logs
│   └── api/                       # API routes (optional)
├── components/
│   ├── ui/
│   │   ├── Button.tsx             # Custom button component
│   │   ├── Card.tsx               # Card layout component
│   │   └── Progress.tsx           # Progress bar component
│   └── dashboard/
│       ├── Sidebar.tsx            # Navigation sidebar
│       ├── StatCard.tsx           # Statistics widgets
│       ├── DeviceGrid.tsx         # Device cards grid
│       ├── CommandCenter.tsx      # Command execution UI
│       └── ActivityTerminal.tsx   # Log viewer terminal
├── hooks/
│   └── useFirebase.ts             # Firebase hooks (React Query)
├── lib/
│   ├── firebase.ts                # Firebase config & init
│   ├── utils.ts                   # Helper utilities
│   └── cn.ts                      # Classname merger
├── types/
│   └── index.ts                   # TypeScript type definitions
├── middleware.ts                  # Auth middleware
└── services/                      # API services (future)
```

## 🗄️ Firebase Schema

### Realtime Database Structure

```
/kei-vault/
├── active_targets/{DeviceID}
│   ├── id: string
│   ├── model: string
│   ├── status: 'online' | 'offline' | 'idle'
│   ├── battery: number (0-100)
│   ├── lastSeen: timestamp
│   ├── os?: string
│   └── ipAddress?: string
│
├── locations/{DeviceID}
│   ├── latitude: number
│   ├── longitude: number
│   ├── timestamp: number
│   └── accuracy?: number

/Commands/{DeviceID}
├── task: 'photo' | 'gps_sync' | 'kill_switch'
├── status: 'pending' | 'executing' | 'completed'
└── timestamp: number

/system_logs/
├── {LogID}
│   ├── type: 'info' | 'warning' | 'error' | 'success' | 'command'
│   ├── message: string
│   ├── deviceId?: string
│   └── timestamp: number

/users/{UserID}
├── email: string
├── role: 'admin' | 'operator' | 'viewer'
├── createdAt: timestamp
└── lastLogin: timestamp
```

## 🎨 Theme Configuration

The dashboard uses a strict dark cyberpunk theme:

- **Primary Background**: `#0a0b10` (Deep Black)
- **Secondary (Cards)**: `#161b22` (Dark Blue-Gray)
- **Accent (Neon Green)**: `#00ff41` (Bright Green)

Customize in:
- `tailwind.config.ts` - Color definitions
- `src/app/globals.css` - CSS utilities and animations
- `src/components/ui/*` - Component color classes

## 🔐 Authentication

### Login Flow

1. User navigates to `/auth/login`
2. Enters email and password
3. Firebase Authentication validates credentials
4. Session token stored in cookies
5. Middleware protects `/dashboard` routes
6. Redirects to dashboard on success

### Protected Routes

All `/dashboard/*` routes require valid authentication via middleware.

## 🚀 Usage Guide

### Dashboard Home

- **Statistic Widgets**: Overview of total targets, active devices, battery health, pending commands
- **Device Grid**: Browse all devices with real-time status, battery, and last-seen information
- **Command Center**: Execute remote commands (Photo, GPS Sync, Kill Switch)
- **Activity Terminal**: Real-time streaming logs

### Command Center

1. Select target device from dropdown
2. Click action button (Capture Photo, Sync GPS, Kill Switch)
3. Command queued to `/Commands/{DeviceID}`
4. Device executes on next check-in
5. Status updates in real-time

### Target Map

- Leaflet-powered global map
- Device markers with location data
- Real-time position updates

### Activity Terminal

- Real-time system and device logs
- Color-coded by message type
- Auto-scrolls to latest entries
- Time-ago humanized timestamps

### System Logs

- Comprehensive audit trail
- Search and filter by type
- Export functionality
- Clear logs option

## 📊 Hooks Reference

### `useActiveDevices()`
```typescript
const { devices, isLoading, error } = useActiveDevices();
```
Real-time listener for all active targets.

### `useDeviceLocations(deviceId?)`
```typescript
const { locations, isLoading, error } = useDeviceLocations('DEVICE-ID');
```
Fetch location data for all devices or specific device.

### `useSendCommand()`
```typescript
const { mutateAsync: sendCommand } = useSendCommand();
await sendCommand({
  deviceId: 'DEVICE-ID',
  task: 'photo',
  status: 'pending'
});
```
Send command to target device.

### `useSystemLogs(limit?)`
```typescript
const { logs, isLoading, error } = useSystemLogs(100);
```
Real-time listener for system logs.

### `useDashboardStats()`
```typescript
const { stats, isLoading } = useDashboardStats();
// stats: { totalTargets, activeDevices, averageBattery, commandsPending }
```

## 🛠️ Development

### Running Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📝 Environment Variables

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## 🔄 Real-time Updates

The dashboard uses Firebase Realtime Database listeners with TanStack Query for automatic updates:

- Device status changes: Instant UI updates
- Battery level changes: Progress bars animate
- New logs: Terminal auto-scrolls
- Location updates: Map markers move in real-time

## 🎭 Animations & Effects

- **Framer Motion**: Page transitions and component animations
- **Tailwind**: Hover effects, pulse animations, neon glows
- **Custom CSS**: Scan lines, cyber gradients, glowing text

## 🚨 Error Handling

- Toast notifications for user feedback
- Error boundaries for component crashes
- Fallback UI for missing data
- Console error logging

## 📦 Dependencies

Key packages:
- `next@16.2.2` - React framework
- `react@19.2.4` - UI library
- `firebase@^10.7.0` - Backend
- `@tanstack/react-query@^5.28.0` - State management
- `framer-motion@^10.16.0` - Animations
- `tailwindcss@^4` - Styling
- `lucide-react@^0.339.0` - Icons

## 🔗 API Integration

### Commands API

```typescript
// Send command
POST /api/commands
{
  deviceId: string
  task: 'photo' | 'gps_sync' | 'kill_switch'
  payload?: object
}

// Get command status
GET /api/commands/{commandId}
```

### Logs API

```typescript
// Add log entry
POST /api/logs
{
  type: 'info' | 'warning' | 'error' | 'success' | 'command'
  message: string
  deviceId?: string
  data?: object
}
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

This project is proprietary software for the kei-Game ecosystem.

## 📧 Support

For issues, questions, or feature requests, please contact the development team.

---

**KEI OS v1.0** | Built for command and control excellence
