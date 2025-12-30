#!/bin/bash

# Start backend
echo "Starting backend server..."
(source backend/venv/bin/activate && python backend/manage.py runserver) &

# Start frontend
echo "Starting frontend server..."
cd frontend && npm start
