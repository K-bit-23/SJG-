from pathlib import Path
import os
from dotenv import load_dotenv

# ── BASE_DIR must be first ───────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Load .env file
load_dotenv(os.path.join(BASE_DIR, '.env'))

# ── Core Django settings ─────────────────────────────────────────────────────
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-sjg-dev-key-change-in-production')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*', 'localhost', '127.0.0.1', '.onrender.com', '.vercel.app']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR.parent / 'frontend' / 'build'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend_project.wsgi.application'

# ── Database — SQLite for Django system tables only ──────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# MongoDB Configuration
MONGODB_URI = os.environ.get('MONGODB_URI')
MONGODB_NAME = os.environ.get('MONGODB_NAME', 'sjg_db')

# ── Stripe ───────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY      = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')

# ── Email (Gmail SMTP) ────────────────────────────────────────────────────────
# This supports switching between two SMTP accounts via an "EMAIL_ACCOUNT" flag.
EMAIL_BACKEND       = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST          = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT          = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS       = os.environ.get('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_USE_SSL       = os.environ.get('EMAIL_USE_SSL', 'False').lower() == 'true'

# Primary (default) account
PRIMARY_EMAIL_HOST_USER     = os.environ.get('PRIMARY_EMAIL_HOST_USER', os.environ.get('EMAIL_HOST_USER', ''))
PRIMARY_EMAIL_HOST_PASSWORD = os.environ.get('PRIMARY_EMAIL_HOST_PASSWORD', os.environ.get('EMAIL_HOST_PASSWORD', ''))

# Secondary account (switched via EMAIL_ACCOUNT)
SECONDARY_EMAIL_HOST_USER     = os.environ.get('SECONDARY_EMAIL_HOST_USER', '')
SECONDARY_EMAIL_HOST_PASSWORD = os.environ.get('SECONDARY_EMAIL_HOST_PASSWORD', '')

EMAIL_ACCOUNT = os.environ.get('EMAIL_ACCOUNT', 'primary').strip().lower()
if EMAIL_ACCOUNT == 'secondary' and SECONDARY_EMAIL_HOST_USER:
    EMAIL_HOST_USER     = SECONDARY_EMAIL_HOST_USER
    EMAIL_HOST_PASSWORD = SECONDARY_EMAIL_HOST_PASSWORD
else:
    EMAIL_HOST_USER     = PRIMARY_EMAIL_HOST_USER
    EMAIL_HOST_PASSWORD = PRIMARY_EMAIL_HOST_PASSWORD

DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER or 'noreply@sjg.com')
# Admin notification emails (can be comma-separated in environment variables)
_admin_emails_str = os.environ.get(
    'ORDER_NOTIFY_EMAIL',
    'dkarthideepak@gmail.com,karthikeyankarthikeyan64182@gmail.com,karthikeyankarthikeyan0414@gmail.com'
)
ORDER_NOTIFY_EMAIL = [e.strip() for e in _admin_emails_str.split(',') if e.strip()]
if not ORDER_NOTIFY_EMAIL and EMAIL_HOST_USER:
    ORDER_NOTIFY_EMAIL = [EMAIL_HOST_USER]

# Frontend URL for emails/redirects
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://sjg-ecom.web.app').rstrip('/')

EMAIL_TIMEOUT = 30  # Increased timeout for cloud stability

AUTH_PASSWORD_VALIDATORS = []

# ── Internationalisation ─────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'UTC'
USE_I18N      = True
USE_TZ        = True

# ── Static files ─────────────────────────────────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_DIRS = []
FRONTEND_BUILD_DIR = BASE_DIR.parent / 'frontend' / 'build'

if os.path.exists(FRONTEND_BUILD_DIR):
    # Vite uses 'assets' instead of 'static'
    STATIC_ASSETS = FRONTEND_BUILD_DIR / 'assets'
    if os.path.exists(STATIC_ASSETS):
        STATICFILES_DIRS.append(STATIC_ASSETS)
    else:
        # Fallback for if build exists but assets doesn't (old CRA style)
        STATIC_STATIC = FRONTEND_BUILD_DIR / 'static'
        if os.path.exists(STATIC_STATIC):
            STATICFILES_DIRS.append(STATIC_STATIC)
        else:
            # Just add the build dir itself as a root
            STATICFILES_DIRS.append(FRONTEND_BUILD_DIR)

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = True  # Keep this True for easier development
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# ── REST Framework ────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [],
}

