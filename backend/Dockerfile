# 1. Use light Python image
FROM python:3.11-slim

# 2. Environment vars (unbuffered logs)
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# 3. Set workdir
WORKDIR /app

# 4. Install OS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy full app
COPY . .

# 7. Precompute static files if needed (Whitenoise)
RUN python manage.py collectstatic --no-input

# 8. Start Gunicorn
CMD exec gunicorn backend_project.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 0
