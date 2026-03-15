@echo off
echo ========================================
echo   SJG Development Server
echo ========================================
echo.

if "%1"=="stop" goto stop

echo Starting SJG development servers...
echo.

echo Starting backend server...
start "Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak > nul

echo Starting frontend server...
start "Frontend" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0 --port 5173"

timeout /t 3 /nobreak > nul

echo Starting mobile development server...
start "Mobile" cmd /k "cd mobile && npx expo start --lan --port 8084 --clear"

echo.
echo ========================================
echo   All services started!
echo ========================================
echo.
echo Backend:    http://localhost:8000
echo Frontend:   http://localhost:5173
echo Mobile:     exp://localhost:8084
echo.
echo Press Ctrl+C in each terminal to stop individual services
echo Or run: run_dev.bat stop
echo.
pause
goto end

:stop
echo Stopping all development servers...
echo.

echo Stopping backend server...
taskkill /f /im python.exe /t 2>nul
taskkill /f /im "Backend" /t 2>nul

echo Stopping frontend server...
taskkill /f /im node.exe /t 2>nul
taskkill /f /im "Frontend" /t 2>nul

echo Stopping mobile server...
taskkill /f /im node.exe /t 2>nul
taskkill /f /im "Mobile" /t 2>nul

echo ✓ All services stopped
echo.
pause

:end
