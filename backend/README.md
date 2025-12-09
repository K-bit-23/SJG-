# Backend (Django)

This folder contains a minimal Django backend scaffold for the SJG project.

Setup (Windows PowerShell):

1. Create and activate a virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run migrations and start the development server:

```powershell
python manage.py migrate
python manage.py runserver
```

4. Test the example API endpoint:

Open: http://127.0.0.1:8000/api/hello/

Notes:
- The scaffold uses SQLite by default.
- Add the backend into your deployment pipeline as needed.
