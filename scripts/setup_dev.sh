#!/bin/bash

echo "========================================"
echo "  SJG Development Environment Setup"
echo "========================================"
echo

echo "Setting up SJG development environment..."
echo

echo "1. Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✓ Frontend dependencies installed"
echo

echo "2. Installing mobile dependencies..."
cd mobile
npm install
cd ..
echo "✓ Mobile dependencies installed"
echo

echo "3. Setting up backend environment..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ..
echo "✓ Backend dependencies installed"
echo

echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo
echo "To start development:"
echo "1. Backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. Mobile: cd mobile && npx expo start"
echo
echo "Or use the convenience scripts in scripts/ directory"
echo