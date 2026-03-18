"""
WSGI config for backend_project project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

import socket

# Force IPv4 universally specifically for Render/Free-tiers which drop IPv6 SMTP
old_getaddrinfo = socket.getaddrinfo
def new_getaddrinfo(*args, **kwargs):
    responses = old_getaddrinfo(*args, **kwargs)
    # Filter out IPv6 results (AF_INET6)
    return [response for response in responses if response[0] == socket.AF_INET]
socket.getaddrinfo = new_getaddrinfo

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')

application = get_wsgi_application()
