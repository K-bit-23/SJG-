echo Stopping servers...
@echo off
setlocal enabledelayedexpansion

REM Define absolute path to project
set PROJECT_DIR=C:\Users\KARTHIKEYAN\Desktop\final\SJG-

echo Stopping servers...

REM Stop backend server (port 8000)
echo Stopping backend server on port 8000...
netstat -ano | findstr :8000 > nul
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /PID %%a /F
    echo Backend server stopped.
) else (
    echo Backend server not running.
)

REM Stop frontend server (port 3000)
echo Stopping frontend server on port 3000...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F
    echo Frontend server stopped.
) else (
    echo Frontend server not running.
)

echo All servers stopped.
pause
