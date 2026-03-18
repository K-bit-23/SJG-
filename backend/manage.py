#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# Load .env file into environment variables before Django settings load
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
except ImportError:
    pass

def main():
    """Run administrative tasks."""
    import socket
    # Force IPv4 to prevent [Errno 101] Network is unreachable on Render/Free tiers
    old_getaddrinfo = socket.getaddrinfo
    def new_getaddrinfo(*args, **kwargs):
        responses = old_getaddrinfo(*args, **kwargs)
        return [response for response in responses if response[0] == socket.AF_INET]
    socket.getaddrinfo = new_getaddrinfo

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
