from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, UserViewSet, CustomLoginView, CustomRegisterView, CurrentUserView, OrderViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'users', UserViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', CustomRegisterView.as_view(), name='auth-register'),
    path('auth/login/', CustomLoginView.as_view(), name='auth-login'),
    path('auth/user/', CurrentUserView.as_view(), name='auth-user'),
]
