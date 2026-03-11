from pathlib import Path
import os

# ── BASE_DIR must be first ───────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ── Load .env file (overrides any existing env vars) ────────────────────────
try:
    from dotenv import load_dotenv
    _env_path = BASE_DIR / '.env'
    load_dotenv(dotenv_path=_env_path, override=True)
    print(f"[OK] Loaded .env -> {_env_path}")
except ImportError:
    print("[WARN] python-dotenv not installed. Run: pip install python-dotenv")

# ── Core Django settings ─────────────────────────────────────────────────────
SECRET_KEY   = os.environ.get('SECRET_KEY', 'django-insecure-sjg-dev-key-change-in-production')
DEBUG        = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*', 'localhost', '127.0.0.1', '.onrender.com']

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

# ── MongoDB ──────────────────────────────────────────────────────────────────
MONGODB_URI  = os.environ.get('MONGODB_URI',  'mongodb+srv://sjg07:sjg07@cluster0.i6g3upp.mongodb.net/')
MONGODB_NAME = os.environ.get('MONGODB_NAME', 'sjg_db')

# ── Stripe ───────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY      = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')

# ── Email (Gmail SMTP) ────────────────────────────────────────────────────────
EMAIL_BACKEND         = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST            = os.environ.get('EMAIL_HOST',          'smtp.gmail.com')
EMAIL_PORT            = int(os.environ.get('EMAIL_PORT',      587))
EMAIL_USE_TLS         = os.environ.get('EMAIL_USE_TLS',       'True') == 'True'
EMAIL_HOST_USER       = os.environ.get('EMAIL_HOST_USER',     '')
EMAIL_HOST_PASSWORD   = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL    = os.environ.get('DEFAULT_FROM_EMAIL',  EMAIL_HOST_USER)
ORDER_NOTIFY_EMAIL    = os.environ.get('ORDER_NOTIFY_EMAIL',  EMAIL_HOST_USER)

AUTH_PASSWORD_VALIDATORS = []

# ── Internationalisation ─────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'UTC'
USE_I18N      = True
USE_TZ        = True

# ── Static files ─────────────────────────────────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Only add the frontend build/static dir if it actually exists (avoids errors in dev)
_frontend_static = BASE_DIR.parent / 'frontend' / 'build' / 'static'
STATICFILES_DIRS = [_frontend_static] if _frontend_static.exists() else []

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS  = True
CORS_ALLOW_CREDENTIALS  = True
CORS_ALLOWED_ORIGINS    = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# ── REST Framework ────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}
