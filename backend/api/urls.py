"""
URL Configuration - with MongoDB fallback option

To use SQLite fallback (while fixing MongoDB):
1. Uncomment the TEMP views import and urlpatterns
2. Comment out the regular views import and urlpatterns
3. Restart server
"""

from django.urls import path

# Regular MongoDB Views (DEFAULT)
from .views import (
    ProductListCreateView,
    ProductDetailView,
    OrderListCreateView,
    OrderDetailView,
    DashboardStatsView,
    ContactMessageView,
    UserListCreateView,
    UserDetailView,
    HomePageContentView,
    ChatBotConfigView,
    UserProfileView
)
from .payment_views import CreatePaymentIntentView, ConfirmPaymentView

urlpatterns = [
    # Product endpoints
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<str:pk>/', ProductDetailView.as_view(), name='product-detail'),
    
    # Order endpoints
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<str:pk>/', OrderDetailView.as_view(), name='order-detail'),
    
    # Dashboard endpoints
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Contact endpoints
    path('contact/', ContactMessageView.as_view(), name='contact-message'),
    
    # User endpoints (for Admin Panel)
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<str:uid>/', UserDetailView.as_view(), name='user-detail'),
    
    # Profile endpoints (for User Profile page)
    path('profile/<str:email>/', UserProfileView.as_view(), name='user-profile'),

    # Content endpoints
    path('content/home/', HomePageContentView.as_view(), name='home-page-content'),
    path('content/chatbot/', ChatBotConfigView.as_view(), name='chatbot-config'),
    
    # Payment endpoints
    path('create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('confirm-payment/', ConfirmPaymentView.as_view(), name='confirm-payment'),
]

# ============================================================================
# TEMPORARY SQLITE FALLBACK (Uncomment to use while fixing MongoDB)
# ============================================================================
# from .views_temp import (
#     TempProductListView,
#     TempProductDetailView,
#     TempOrderListView,
#     TempOrderDetailView,
#     TempDashboardStatsView
# )
# 
# urlpatterns = [
#     # Product endpoints
#     path('products/', TempProductListView.as_view(), name='product-list-create'),
#     path('products/<str:pk>/', TempProductDetailView.as_view(), name='product-detail'),
#     
#     # Order endpoints
#     path('orders/', TempOrderListView.as_view(), name='order-list-create'),
#     path('orders/<str:pk>/', TempOrderDetailView.as_view(), name='order-detail'),
#     
#     # Dashboard endpoints
#     path('dashboard/stats/', TempDashboardStatsView.as_view(), name='dashboard-stats'),
# ]
