@echo off
setlocal enabledelayedexpansion

REM Define absolute path to project
set PROJECT_DIR=C:\Users\KARTHIKEYAN\Desktop\final\SJG-
set LOG_DIR=%PROJECT_DIR%\logs

REM Create logs directory if it doesn't exist
if not exist "!LOG_DIR!" mkdir "!LOG_DIR!"

REM Get current date and time
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set DATE=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set TIME=%%a:%%b)

REM Get system IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address"') do (
    set IP=%%a
)
set IP=%IP: =%

REM Create timestamped log file
set LOG_FILE=!LOG_DIR!\startup_%DATE%_%TIME:.=-%.log

REM Log startup header
echo ======================================== >> "!LOG_FILE!"
echo Project Startup Log >> "!LOG_FILE!"
echo ======================================== >> "!LOG_FILE!"
echo Date: %DATE% >> "!LOG_FILE!"
echo Time: %TIME% >> "!LOG_FILE!"
echo System IP: %IP% >> "!LOG_FILE!"
echo Project: !PROJECT_DIR! >> "!LOG_FILE!"
echo. >> "!LOG_FILE!"
echo [%TIME%] Initializing servers... >> "!LOG_FILE!"

echo.
echo ======================================== 
echo Starting Servers
echo ========================================
echo Date: %DATE%
echo Time: %TIME%
echo System IP: %IP%
echo.

REM Start backend server
echo [%TIME%] Starting backend server on port 8000... >> "!LOG_FILE!"
echo Starting backend server on port 8000...
start "Backend Server" cmd /k "cd /d !PROJECT_DIR! && cd backend && (echo [%TIME%] Backend initialized >> !LOG_FILE!) && python manage.py runserver"

REM Wait a moment
timeout /t 2 /nobreak

REM Start frontend server
echo [%TIME%] Starting frontend server on port 3000... >> "!LOG_FILE!"
echo Starting frontend server on port 3000...
start "Frontend Server" cmd /k "cd /d !PROJECT_DIR! && cd frontend && (echo [%TIME%] Frontend initialized >> !LOG_FILE!) && npm start"

echo. >> "!LOG_FILE!"
echo [%TIME%] All servers started >> "!LOG_FILE!"
echo. >> "!LOG_FILE!"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Log file: !LOG_FILE!
