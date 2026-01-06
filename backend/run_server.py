from waitress import serve
from backend_project.wsgi import application
import os

if __name__ == '__main__':
    print("SJG Backend is starting on http://localhost:8000")
    print("Press CTRL+C to stop the server")
    serve(application, host='0.0.0.0', port=8000)
