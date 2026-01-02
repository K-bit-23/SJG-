from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, UserViewSet, UserCreateSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserCreateSet.as_view(), name='user-create'),
]
