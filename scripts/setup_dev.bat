@echo off
echo ========================================
echo   SJG Development Environment Setup
echo ========================================
echo.

echo Setting up SJG development environment...
echo.

echo 1. Installing frontend dependencies...
cd frontend
call npm install
cd ..
echo ✓ Frontend dependencies installed
echo.

echo 2. Installing mobile dependencies...
cd mobile
call npm install
cd ..
echo ✓ Mobile dependencies installed
echo.

echo 3. Setting up backend environment...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..
echo ✓ Backend dependencies installed
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start development:
echo 1. Backend: cd backend && venv\Scripts\activate && python manage.py runserver
echo 2. Frontend: cd frontend && npm run dev
echo 3. Mobile: cd mobile && npx expo start
echo.
echo Or use the convenience scripts in scripts/ directory
echo.
pause