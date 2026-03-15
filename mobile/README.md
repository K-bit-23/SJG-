# SJG Mobile App

A React Native Expo mobile application for SJG e-commerce platform.

## Project Structure

```
mobile/
├── App.js                 # Main app component with providers
├── index.js              # App entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── assets/               # Static assets (icons, images)
│   ├── icon.png
│   ├── splash-icon.png
│   └── sjg-logo.svg
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components (Home, Products, Cart, Profile)
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.js
│   ├── context/          # React Context providers
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   ├── services/         # API services and external integrations
│   │   └── api.js
│   ├── utils/            # Utility functions
│   │   └── index.js
│   └── constants/        # App constants and configuration
│       └── index.js
└── node_modules/         # Dependencies
```

## Features

- User authentication (demo mode)
- Product browsing
- Shopping cart functionality
- User profile management
- Bottom tab navigation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Scan the QR code with Expo Go app on your mobile device.

## Configuration

- Update `src/constants/index.js` for API endpoints and app configuration
- Modify `app.json` for app metadata and icons
- Update `src/services/api.js` for backend integration

## Development

- Screens are located in `src/screens/`
- Reusable components go in `src/components/`
- Navigation configuration in `src/navigation/`
- Context providers in `src/context/`
- API calls in `src/services/`
- Utilities in `src/utils/`
- Constants in `src/constants/`