from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    """API Root endpoint"""
    return JsonResponse({
        'message': 'SJG Backend API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'products': '/api/products/',
            'orders': '/api/orders/',
            'dashboard': '/api/dashboard/stats/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', api_root, name='api-root'),  # Root endpoint returns API info
]
