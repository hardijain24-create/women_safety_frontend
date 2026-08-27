# Guardian Band - Personal Safety App

A production-quality React Native mobile application built with Expo for personal safety and emergency alerts.

## Features

- **Authentication**: Login and Registration screens with large touch-friendly UI
- **Home Dashboard**: Device status, quick actions, and status cards
- **Location Tracking**: Mock GPS tracking UI with coordinates and sharing
- **Band Device**: Wearable band settings and controls
- **Emergency Contacts**: Manage trusted contacts
- **Alerts History**: View SOS and system alerts
- **SOS Emergency**: Press and hold SOS button with haptic feedback
- **Profile & Settings**: Theme toggle, preferences, and app settings

## Design

- **Color Palette**: Navy blue (#1F2A44) and warm beige (#F5F1E8)
- **Accent**: Gold (#D4AF37) for elegant highlights
- **UI Style**: Glassmorphism cards, soft shadows, large rounded corners
- **Target Users**: Women aged 60+ with accessibility-friendly design

## Architecture

```
src/
├── components/
│   ├── atoms/       # Button, Input, Typography, Icon, Badge, Toggle
│   ├── molecules/   # Card, StatusBadge, QuickAction, ContactCard, AlertCard
│   └── organisms/   # Header, ScreenLayout, DevicePanel
├── screens/         # All 9 screens (Login, Register, Home, Location, Band, Contacts, Alerts, Profile, SOS)
├── navigation/      # React Navigation setup with Stack + Bottom Tabs
├── theme/           # Theme system with Light/Dark mode support
├── types/           # TypeScript interfaces
└── constants/       # Mock data and route constants
```

## Tech Stack

- Expo SDK 52
- React Native 0.76
- TypeScript (Strict)
- React Navigation 7
- NativeWind / TailwindCSS
- Expo Blur (Glassmorphism)
- Expo Haptics

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Scan the QR code with Expo Go on your device

## Screenshots

(Coming soon)

## License

MIT
