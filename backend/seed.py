
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_default_admin():
    """Creates a default admin user if one doesn't already exist."""
    email = 'sjgvxerox@gmail.com'
    password = '@Admin24821'
    
    if not User.objects.filter(email=email).exists():
        print(f'Creating default admin user: {email}')
        User.objects.create_superuser(email=email, password=password, first_name='Admin', last_name='User')
        print('Admin user created successfully.')
    else:
        print(f'Admin user with email {email} already exists.')

if __name__ == '__main__':
    create_default_admin()
