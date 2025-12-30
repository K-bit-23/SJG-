@echo off
REM Start backend server
echo Starting backend server...
start cmd /k "cd backend && python manage.py runserver"

REM Start frontend server
echo Starting frontend server...
start cmd /k "cd frontend && npm start"

echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
