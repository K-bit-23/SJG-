import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth.models import User

email = 'sjgvxerox@gmail.com'
password = 'password123'  # Default password for dev convenience
username = email # We mapped username to email in previous steps if missing

try:
    user = User.objects.get(email=email)
    print(f"User {email} already exists.")
except User.DoesNotExist:
    # Check if username exists
    if User.objects.filter(username=email).exists():
        user = User.objects.get(username=email)
        user.email = email
    else:
        user = User(username=email, email=email)
        user.set_password(password)
        print(f"Creating user {email}...")

# Make admin
user.is_staff = True
user.is_superuser = True
user.save()
print(f"User {email} is now an Admin (is_staff=True, is_superuser=True).")
print(f"Password set to: {password}")
