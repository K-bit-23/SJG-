@echo off
setlocal enabledelayedexpansion

REM Define absolute path to project
set PROJECT_DIR=C:\Users\KARTHIKEYAN\Desktop\final\SJG-

REM Start backend server
echo Starting backend server...
start cmd /k "cd /d !PROJECT_DIR! && cd backend && python manage.py runserver"

REM Start frontend server
echo Starting frontend server...
start cmd /k "cd /d !PROJECT_DIR! && cd frontend && npm start"

echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
