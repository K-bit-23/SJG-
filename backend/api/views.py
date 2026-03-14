from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from datetime import datetime
import random
import string
from .mongodb import mongo_client
from .serializers import (
    ProductSerializer, OrderSerializer, ContactMessageSerializer, UserSerializer,
    HomePageContentSerializer, ChatBotConfigSerializer, AppSettingsSerializer,
    UserSettingsSerializer
)
from .email_utils import send_order_confirmation_after_delay, send_order_status_notification

class ProductListCreateView(APIView):
    """List all products or create a new product"""
    
    def get(self, request):
        try:
            collection = mongo_client.get_collection('products')
            products = list(collection.find())
            serializer = ProductSerializer(products, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        try:
            serializer = ProductSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('products')
                product_data = serializer.validated_data
                # Convert Decimal to float for MongoDB
                if 'price' in product_data:
                    product_data['price'] = float(product_data['price'])
                product_data['created_at'] = datetime.now()
                product_data['updated_at'] = datetime.now()
                result = collection.insert_one(product_data)
                product_data['_id'] = result.inserted_id
                return Response(
                    ProductSerializer(product_data).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProductDetailView(APIView):
    """Retrieve, update or delete a product"""
    
    def get(self, request, pk):
        try:
            collection = mongo_client.get_collection('products')
            product = collection.find_one({'_id': ObjectId(pk)})
            if not product:
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, pk):
        try:
            collection = mongo_client.get_collection('products')
            serializer = ProductSerializer(data=request.data)
            if serializer.is_valid():
                update_data = serializer.validated_data
                # Convert Decimal to float for MongoDB
                if 'price' in update_data:
                    update_data['price'] = float(update_data['price'])
                update_data['updated_at'] = datetime.now()
                result = collection.update_one(
                    {'_id': ObjectId(pk)},
                    {'$set': update_data}
                )
                if result.matched_count == 0:
                    return Response(
                        {'error': 'Product not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                product = collection.find_one({'_id': ObjectId(pk)})
                return Response(ProductSerializer(product).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, pk):
        try:
            collection = mongo_client.get_collection('products')
            result = collection.delete_one({'_id': ObjectId(pk)})
            if result.deleted_count == 0:
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

def generate_order_id():
    """Generate a unique order ID: ORD-YYYYMMDD-XXXX"""
    timestamp = datetime.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f'ORD-{timestamp}-{random_str}'

class OrderListCreateView(APIView):
    """List all orders or create a new order"""
    
    def get(self, request):
        try:
            collection = mongo_client.get_collection('orders')
            orders = list(collection.find().sort('created_at', -1))
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        try:
            serializer = OrderSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('orders')
                order_data = serializer.validated_data
                
                # Generate unique Order ID
                order_data['order_id'] = generate_order_id()
                
                # Convert Decimal to float for MongoDB
                if 'total_amount' in order_data:
                    order_data['total_amount'] = float(order_data['total_amount'])
                if 'items' in order_data:
                    for item in order_data['items']:
                        if 'price' in item:
                            item['price'] = float(item['price'])
                            
                order_data['created_at'] = datetime.now()
                order_data['updated_at'] = datetime.now()
                result = collection.insert_one(order_data)
                order_data['_id'] = result.inserted_id

                # Fire order confirmation email in 30 seconds (background thread)
                # For CARD payments, we wait until payment is confirmed in payment_views.py
                if order_data.get('payment_method') != 'CARD':
                    send_order_confirmation_after_delay(dict(order_data), delay_seconds=30)

                return Response(
                    OrderSerializer(order_data).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OrderDetailView(APIView):
    """Retrieve or update an order"""
    
    def get(self, request, pk):
        try:
            collection = mongo_client.get_collection('orders')
            
            # Try to find by ObjectID first, then by custom order_id
            try:
                query = {'_id': ObjectId(pk)}
            except:
                query = {'order_id': pk}
                
            order = collection.find_one(query)
            
            if not order:
                return Response(
                    {'error': 'Order not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request, pk):
        try:
            collection = mongo_client.get_collection('orders')
            update_data = dict(request.data)
            update_data['updated_at'] = datetime.now()

            # Support both MongoDB ObjectId AND custom order_id (e.g. ORD-20260311-XXXX)
            try:
                query = {'_id': ObjectId(pk)}
            except Exception:
                query = {'order_id': pk}

            result = collection.update_one(query, {'$set': update_data})

            if result.matched_count == 0:
                return Response(
                    {'error': f'Order not found: {pk}'},
                    status=status.HTTP_404_NOT_FOUND
                )

            order = collection.find_one(query)
            
            # Notify user if status was changed
            if 'status' in request.data:
                send_order_status_notification(dict(order))

            return Response(OrderSerializer(order).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DashboardStatsView(APIView):
    """Get dashboard statistics"""
    
    def get(self, request):
        try:
            products_collection = mongo_client.get_collection('products')
            orders_collection = mongo_client.get_collection('orders')
            messages_collection = mongo_client.get_collection('messages')
            users_collection = mongo_client.get_collection('users')
            
            total_products = products_collection.count_documents({})
            total_orders = orders_collection.count_documents({})
            total_messages = messages_collection.count_documents({})
            total_users = users_collection.count_documents({})
            
            # Calculate total revenue
            pipeline = [
                {'$group': {'_id': None, 'total': {'$sum': '$total_amount'}}}
            ]
            revenue_result = list(orders_collection.aggregate(pipeline))
            total_revenue = float(revenue_result[0]['total']) if revenue_result else 0
            
            # Recent orders
            recent_orders = list(orders_collection.find().sort('created_at', -1).limit(5))
            
            return Response({
                'total_products': total_products,
                'total_orders': total_orders,
                'total_messages': total_messages,
                'total_users': total_users,
                'total_revenue': total_revenue,
                'recent_orders': OrderSerializer(recent_orders, many=True).data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ContactMessageView(APIView):
    """Save a contact message to MongoDB"""
    
    def post(self, request):
        try:
            serializer = ContactMessageSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('messages')
                message_data = serializer.validated_data
                message_data['created_at'] = datetime.now()
                
                result = collection.insert_one(message_data)
                message_data['_id'] = result.inserted_id
                
                return Response(
                    ContactMessageSerializer(message_data).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserListCreateView(APIView):
    """List all users or create/sync a user"""
    
    def get(self, request):
        try:
            collection = mongo_client.get_collection('users')
            # Filter by role if provided
            role = request.query_params.get('role')
            query = {'role': role} if role else {}
            
            users = list(collection.find(query))
            return Response(UserSerializer(users, many=True).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('users')
                user_data = serializer.validated_data
                uid = user_data.get('uid')
                
                # Check if user exists, if so update, else insert
                existing_user = collection.find_one({'uid': uid})
                
                if existing_user:
                    # Update existing
                    user_data['updated_at'] = datetime.now()
                    # Don't overwrite role if it's not provided or "user" (keep existing admin role)
                    if existing_user.get('role') == 'admin' and user_data.get('role') == 'user':
                         if 'role' in user_data: del user_data['role']
                         
                    collection.update_one({'uid': uid}, {'$set': user_data})
                    user_data = collection.find_one({'uid': uid}) # Get updated doc
                else:
                    # Insert new
                    user_data['created_at'] = datetime.now()
                    user_data['updated_at'] = datetime.now()
                    collection.insert_one(user_data)
                
                return Response(
                    UserSerializer(user_data).data,
                    status=status.HTTP_200_OK # 200 OK for upsert
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserDetailView(APIView):
    """Retrieve, update or delete a user"""
    
    def get(self, request, uid):
        try:
            collection = mongo_client.get_collection('users')
            user = collection.find_one({'uid': uid})
            if not user:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response(UserSerializer(user).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, uid):
        try:
            collection = mongo_client.get_collection('users')
            update_data = request.data
            update_data['updated_at'] = datetime.now()
            
            result = collection.update_one(
                {'uid': uid},
                {'$set': update_data}
            )
            
            if result.matched_count == 0:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
                
            user = collection.find_one({'uid': uid})
            return Response(UserSerializer(user).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    def delete(self, request, uid):
        try:
            collection = mongo_client.get_collection('users')
            result = collection.delete_one({'uid': uid})
            if result.deleted_count == 0:
                 return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HomePageContentView(APIView):
    """Get or Update Home Page Content"""
    
    def get(self, request):
        try:
            collection = mongo_client.get_collection('site_content')
            content = collection.find_one({'type': 'home_page'})
            
            if not content:
                # Return default structure if not found
                return Response({'banners': [], 'services': [], 'trust_strip': []})
                
            return Response(HomePageContentSerializer(content).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request): # Using POST to Create/Update (Upsert)
        try:
            serializer = HomePageContentSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('site_content')
                content_data = serializer.validated_data
                content_data['type'] = 'home_page'
                content_data['updated_at'] = datetime.now()
                
                collection.update_one(
                    {'type': 'home_page'},
                    {'$set': content_data},
                    upsert=True
                )
                
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChatBotConfigView(APIView):
    """Get or Update Chat Bot Configuration"""

    def get(self, request):
        try:
            collection = mongo_client.get_collection('chatbot_settings')
            config = collection.find_one({'type': 'config'})
            
            if not config:
                # Default config
                default_config = {
                    'welcome_message': 'Hello! How can I help you regarding our stationery products?',
                    'quick_replies': ['Track Order', 'Return Policy', 'Bulk Orders', 'Contact Support']
                }
                return Response(default_config)
            
            return Response(ChatBotConfigSerializer(config).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = ChatBotConfigSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('chatbot_settings')
                config_data = serializer.validated_data
                config_data['type'] = 'config'
                config_data['updated_at'] = datetime.now()
                
                collection.update_one(
                    {'type': 'config'},
                    {'$set': config_data},
                    upsert=True
                )
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(APIView):
    """Get or Update User Profile (address, settings, preferences)"""
    
    def get(self, request, email):
        try:
            collection = mongo_client.get_collection('user_profiles')
            profile = collection.find_one({'email': email})
            
            if not profile:
                # Return empty profile structure
                return Response({
                    'email': email,
                    'fullName': '',
                    'phone': '',
                    'photoURL': '',
                    'dateOfBirth': '',
                    'gender': '',
                    'addresses': [],
                })
            
            # Convert ObjectId to string
            profile['id'] = str(profile.pop('_id', ''))
            return Response(profile)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, email):
        try:
            collection = mongo_client.get_collection('user_profiles')
            profile_data = request.data
            profile_data['email'] = email
            profile_data['updated_at'] = datetime.now()
            
            collection.update_one(
                {'email': email},
                {'$set': profile_data},
                upsert=True
            )
            
            updated_profile = collection.find_one({'email': email})
            updated_profile['id'] = str(updated_profile.pop('_id', ''))
            
            return Response(updated_profile, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserOrdersView(APIView):
    """Get all orders for a specific user"""
    def get(self, request, user_email):
        try:
            collection = mongo_client.get_collection('orders')
            orders = list(collection.find({'user_email': user_email}).sort('created_at', -1))
            return Response(OrderSerializer(orders, many=True).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserSettingsView(APIView):
    """Get or Update specific User Settings"""

    def get(self, request, email):
        try:
            collection = mongo_client.get_collection('user_settings')
            settings = collection.find_one({'email': email})
            
            if not settings:
                # Default settings for a new user
                default_settings = {
                    'email': email,
                    'location_access': False,
                    'notifications': True,
                    'email_updates': True,
                    'sms_alerts': False,
                    'dark_mode': False,
                    'floating_shortcut': False,
                    'overlay_mode': False,
                    'language': 'English'
                }
                return Response(default_settings)
            
            return Response(UserSettingsSerializer(settings).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, email):
        try:
            serializer = UserSettingsSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('user_settings')
                settings_data = serializer.validated_data
                settings_data['email'] = email
                settings_data['updated_at'] = datetime.now()
                
                collection.update_one(
                    {'email': email},
                    {'$set': settings_data},
                    upsert=True
                )
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AppSettingsView(APIView):
    """Get or Update Application Global Settings"""

    def get(self, request):
        try:
            collection = mongo_client.get_collection('app_settings')
            settings_doc = collection.find_one({'type': 'global'})
            
            if not settings_doc:
                # Default settings
                default_settings = {
                    'store_name': 'SJG Stationery',
                    'contact_email': 'contact@sjg.com',
                    'contact_phone': '+91 1234567890',
                    'currency': 'INR',
                    'currency_symbol': '₹',
                    'maintenance_mode': False,
                    'tax_rate': 18.0,
                    'logo_url': '',
                    'footer_text': '© 2026 SJG Stationery. All rights reserved.'
                }
                return Response(default_settings)
            
            return Response(AppSettingsSerializer(settings_doc).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = AppSettingsSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('app_settings')
                settings_data = serializer.validated_data
                settings_data['type'] = 'global'
                settings_data['updated_at'] = datetime.now()
                
                collection.update_one(
                    {'type': 'global'},
                    {'$set': settings_data},
                    upsert=True
                )
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HealthCheckView(APIView):
    """GET /api/health/ — returns MongoDB connection status"""

    def get(self, request):
        try:
            db = mongo_client.get_database()
            mongo_client._client.admin.command('ping')
            collections = db.list_collection_names()
            counts = {}
            for col in ['products', 'orders', 'users', 'site_content']:
                try:
                    counts[col] = db[col].count_documents({})
                except Exception:
                    counts[col] = 'error'
            return Response({
                'status':      'ok',
                'mongodb':     'connected',
                'database':    db.name,
                'collections': collections,
                'counts':      counts,
            })
        except Exception as e:
            return Response({
                'status':  'error',
                'mongodb': 'disconnected',
                'error':   str(e),
                'fix':     'Check MONGODB_URI in backend/.env and your network connection',
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

