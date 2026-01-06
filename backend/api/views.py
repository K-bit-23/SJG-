from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Product, Order
from .serializers import ProductSerializer, UserSerializer, OrderSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

class CustomRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()
        if 'username' not in data and 'email' in data:
            data['username'] = data['email']
            
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = authenticate(username=user.username, password=password)
        
        if not user:
             return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserCreateSet(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth

class DashboardStatsView(APIView):
    permission_classes = [permissions.AllowAny] 
    
class DashboardStatsView(APIView):
    permission_classes = [permissions.AllowAny] 
    
    def get(self, request):
        try:
            # 1. Total Stats
            total_products = Product.objects.count()
            total_orders = Order.objects.count()
            total_revenue = Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            pending_orders = Order.objects.filter(status='Pending').count()

            # 2. Sales Over Time (Safe Fallback for Djongo)
            sales_data = []
            try:
                raw_sales = Order.objects.annotate(month=TruncMonth('created_at'))\
                    .values('month')\
                    .annotate(orders=Count('id'), revenue=Sum('total_amount'))\
                    .order_by('month')
                
                for item in raw_sales:
                    sales_data.append({
                        'name': item['month'].strftime('%b') if item['month'] else 'Unknown',
                        'orders': item['orders'],
                        'revenue': float(item['revenue'] or 0)
                    })
            except Exception as e:
                print(f"Sales data fetch failed: {e}")
                sales_data = [{'name': 'Active', 'orders': total_orders, 'revenue': float(total_revenue)}]

            # 3. Order Status Distribution
            status_data = []
            try:
                status_counts = Order.objects.values('status').annotate(count=Count('id'))
                colors = {'Pending': '#f39c12', 'Processing': '#3498db', 'Shipped': '#9b59b6', 'Delivered': '#2ecc71', 'Cancelled': '#e74c3c'}
                
                for item in status_counts:
                    status_data.append({
                        'name': item['status'],
                        'value': item['count'],
                        'color': colors.get(item['status'], '#cccccc')
                    })
            except Exception:
                status_data = [{'name': 'Orders', 'value': total_orders, 'color': '#3498db'}]

            return Response({
                'stats': {
                    'total_products': total_products,
                    'total_orders': total_orders,
                    'total_revenue': float(total_revenue),
                    'pending_orders': pending_orders
                },
                'sales_data': sales_data,
                'status_data': status_data
            })
        except Exception as global_err:
            print(f"Dashboard Stats Exception: {global_err}")
            return Response({'error': str(global_err)}, status=500)
