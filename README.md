# SJG - Stationery Junction Group

A full-stack e-commerce platform for stationery products with web and mobile applications.

## Project Structure

```
sjg/
├── backend/           # Django REST API backend
│   ├── api/          # Django apps
│   ├── backend_project/  # Django project settings
│   ├── manage.py     # Django management script
│   └── requirements.txt  # Python dependencies
├── frontend/          # React/Vite web application
│   ├── src/          # React source code
│   ├── public/       # Static assets
│   ├── package.json  # Node dependencies
│   └── vite.config.js # Vite configuration
├── mobile/            # React Native/Expo mobile app
│   ├── src/          # React Native source code
│   ├── assets/       # Mobile assets
│   ├── app.json      # Expo configuration
│   └── package.json  # Mobile dependencies
├── shared/            # Shared configurations and utilities
├── docs/              # Documentation and deployment files
│   ├── firebase-public/  # Firebase hosting templates
│   ├── firebase-y/       # Additional Firebase templates
│   └── *.md              # Documentation files
├── scripts/           # Build and deployment scripts
│   ├── run_dev.bat      # Windows development script
│   ├── run_dev.sh       # Linux/Mac development script
│   └── stop_dev.*       # Stop scripts
└── logs/              # Application logs
```

## Applications

### Backend (Django)
- REST API for product management, user authentication, and orders
- Database: SQLite (development) / MongoDB (production)
- Location: `backend/`

### Frontend (React + Vite)
- Modern web application with responsive design
- Features: Product catalog, shopping cart, user accounts
- Location: `frontend/`

### Mobile (React Native + Expo)
- Native mobile app for iOS and Android
- Features: Product browsing, cart management, user profiles
- Location: `mobile/`

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Expo CLI (for mobile development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sjg
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   # On Windows: venv\Scripts\activate
   # On Linux/Mac: source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Mobile Setup**
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

## Deployment

- **Frontend**: Deployed to Firebase Hosting
- **Backend**: Deployed to Render
- **Mobile**: Available on App Store and Google Play

See `docs/` directory for detailed deployment guides.

## Development Scripts

Use the scripts in the `scripts/` directory:

- `run_dev.bat` - Start all services (Windows)
- `run_dev.sh` - Start all services (Linux/Mac)
- `stop_dev.bat` - Stop all services (Windows)

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test across all applications
4. Submit a pull request

## License

[Add license information here]