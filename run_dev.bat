@echo off
setlocal enabledelayedexpansion

REM Define absolute path to project
set PROJECT_DIR=C:\Users\KARTHIKEYAN\OneDrive\Desktop\final\SJG-

REM Start backend server
echo Starting backend server on all devices...
start cmd /k "cd /d !PROJECT_DIR! && cd backend && python manage.py runserver 0.0.0.0:8000"

REM Start frontend server
echo Starting frontend server on all devices...
start cmd /k "cd /d !PROJECT_DIR! && cd frontend && set HOST=0.0.0.0 && npm start"

echo Both servers are starting on all network devices...
echo Backend: http://<your-ip>:8000
echo Frontend: http://<your-ip>:3000
