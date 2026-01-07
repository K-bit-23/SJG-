from django.urls import path
from .views import (
    ProductListCreateView,
    ProductDetailView,
    OrderListCreateView,
    OrderDetailView,
    DashboardStatsView
)

urlpatterns = [
    # Product endpoints
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<str:pk>/', ProductDetailView.as_view(), name='product-detail'),
    
    # Order endpoints
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<str:pk>/', OrderDetailView.as_view(), name='order-detail'),
    
    # Dashboard endpoints
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
