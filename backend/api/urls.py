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
    OfflineOrderView,
    DashboardStatsView,
    ContactMessageView,
    ChatMessageView,
    UserListCreateView,
    UserDetailView,
    HomePageContentView,
    ChatBotConfigView,
    UserProfileView,
    UserSettingsView,
    AdminDataView,
    NotificationView,
    HealthCheckView,
    AppSettingsView,
    UserOrdersView,
    MessageDetailView,
    TestEmailView,
    OrderInvoiceView,
    SystemStatsView,
    api_root_view
)
from .payment_views import (
    CreatePaymentIntentView, 
    ConfirmPaymentView, 
    CreateCheckoutSessionView,
    ConfirmStripeSessionView
)

urlpatterns = [
    # ── Health check (always try first: http://localhost:8000/api/health/) ──
    path('health/', HealthCheckView.as_view(), name='health-check'),

    # Product endpoints
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<str:pk>/', ProductDetailView.as_view(), name='product-detail'),
    
    # Order endpoints
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/offline/', OfflineOrderView.as_view(), name='offline-order'),
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
    path('settings/<str:email>/', UserSettingsView.as_view(), name='user-settings'),

    # Content endpoints
    path('content/home/', HomePageContentView.as_view(), name='home-page-content'),
    path('content/chatbot/', ChatBotConfigView.as_view(), name='chatbot-config'),
    path('settings/', AppSettingsView.as_view(), name='app-settings'),
    
    # Chat messages (for bot logs / admin review)
    path('messages/', ChatMessageView.as_view(), name='chat-messages'),
    path('messages/<str:pk>/', MessageDetailView.as_view(), name='message-detail'),

    # Admin Data endpoints
    path('admin/data/', AdminDataView.as_view(), name='admin-data'),
    
    # Notification endpoints
    path('notifications/', NotificationView.as_view(), name='notifications'),
    
    # Payment endpoints
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('confirm-payment/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('confirm-stripe-session/', ConfirmStripeSessionView.as_view(), name='confirm-stripe-session'),

    # Mobile Auth & User specific endpoints
    path('user-orders/<str:user_email>/', UserOrdersView.as_view(), name='user-orders'),
    path('orders/<str:pk>/invoice/', OrderInvoiceView.as_view(), name='order-invoice'),
    path('test-email/', TestEmailView.as_view(), name='test-email'),
    path('user-settings/<str:email>/', UserSettingsView.as_view(), name='user-settings'),
    path('system/stats/', SystemStatsView.as_view(), name='system-stats'),
    path('root/', api_root_view, name='api-root-html'),
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
