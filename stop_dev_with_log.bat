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
set LOG_FILE=!LOG_DIR!\shutdown_%DATE%_%TIME:.=-%.log

REM Log shutdown header
echo ======================================== >> "!LOG_FILE!"
echo Project Shutdown Log >> "!LOG_FILE!"
echo ======================================== >> "!LOG_FILE!"
echo Date: %DATE% >> "!LOG_FILE!"
echo Time: %TIME% >> "!LOG_FILE!"
echo System IP: %IP% >> "!LOG_FILE!"
echo. >> "!LOG_FILE!"
echo [%TIME%] Stopping servers... >> "!LOG_FILE!"

echo.
echo ========================================
echo Stopping Servers
echo ========================================
echo Date: %DATE%
echo Time: %TIME%
echo System IP: %IP%
echo.

REM Stop backend server (port 8000)
echo [%TIME%] Stopping backend server on port 8000... >> "!LOG_FILE!"
echo Stopping backend server on port 8000...
netstat -ano | findstr :8000 > nul
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /PID %%a /F
    echo [%TIME%] Backend server stopped successfully >> "!LOG_FILE!"
    echo Backend server stopped.
) else (
    echo [%TIME%] Backend server was not running >> "!LOG_FILE!"
    echo Backend server not running.
)

REM Stop frontend server (port 3000)
echo [%TIME%] Stopping frontend server on port 3000... >> "!LOG_FILE!"
echo Stopping frontend server on port 3000...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F
    echo [%TIME%] Frontend server stopped successfully >> "!LOG_FILE!"
    echo Frontend server stopped.
) else (
    echo [%TIME%] Frontend server was not running >> "!LOG_FILE!"
    echo Frontend server not running.
)

echo. >> "!LOG_FILE!"
echo [%TIME%] All servers stopped >> "!LOG_FILE!"
echo.

echo ========================================
echo All servers stopped!
echo ========================================
echo.
echo Log file: !LOG_FILE!
pause
