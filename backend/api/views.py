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
    HomePageContentSerializer, ChatBotConfigSerializer, AdminDataSerializer
)
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
import threading

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

def send_order_email(order_data):
    """Send order confirmation email with invoice simulation"""
    try:
        user_email = order_data.get('user_email')
        user_name = order_data.get('user_name')
        order_id = order_data.get('order_id')
        items = order_data.get('items', [])
        total = order_data.get('total_amount')
        
        subject = f'Order Confirmed! - {order_id} - SJG Stationery'
        
        # Build Item rows
        item_rows = ""
        for item in items:
            item_rows += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">{item.get('product_name')}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{item.get('quantity')}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹{item.get('price')}</td>
            </tr>
            """

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background: #111827; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">SJG Stationery</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.8;">Premium Stationery & Beyond</p>
            </div>
            <div style="padding: 30px;">
                <h2>Order Confirmation</h2>
                <p>Hello <strong>{user_name}</strong>,</p>
                <p>Thank you for your order! We've received it and are currently processing it.</p>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Order ID</p>
                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #111827;">{order_id}</p>
                </div>

                <h3>Invoice Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f3f4f6;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {item_rows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 20px 10px 10px 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                            <td style="padding: 20px 10px 10px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #3b82f6;">₹{total}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #9ca3af; text-align: center;">
                    <p>If you have any questions, please contact us at support@sjg.com</p>
                    <p>&copy; 2026 SJG Stationery. All rights reserved.</p>
                </div>
            </div>
        </div>
        """
        
        text_content = strip_tags(html_content)
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [user_email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        print(f"Order email sent to {user_email}")
        
    except Exception as e:
        print(f"Failed to send email: {str(e)}")

class OrderListCreateView(APIView):
    """List all orders or create a new order"""
    
    def get(self, request):
        try:
            collection = mongo_client.get_collection('orders')
            user_email = request.query_params.get('user_email')
            query = {'user_email': user_email} if user_email else {}
            
            orders = list(collection.find(query).sort('created_at', -1))
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
                
                # Send email asynchronously
                threading.Thread(target=send_order_email, args=(order_data,)).start()
                
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
            update_data = request.data
            update_data['updated_at'] = datetime.now()
            
            # Try to find by ObjectID first, then by custom order_id
            try:
                query = {'_id': ObjectId(pk)}
            except:
                query = {'order_id': pk}

            result = collection.update_one(
                query,
                {'$set': update_data}
            )
            if result.matched_count == 0:
                return Response(
                    {'error': 'Order not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            order = collection.find_one(query)
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
            
            # Monthly Revenue Trend (Last 6 months)
            # This is a simplified version. For production, you'd want actual month names and year handling.
            monthly_pipeline = [
                {
                    '$group': {
                        '_id': {'$month': '$created_at'},
                        'total': {'$sum': '$total_amount'},
                        'count': {'$sum': 1}
                    }
                },
                {'$sort': {'_id': 1}}
            ]
            monthly_revenue = list(orders_collection.aggregate(monthly_pipeline))
            
            # Category Performance
            # We join orders with products to get categories, or just count products per category for now 
            # as a simple representation of category data.
            category_pipeline = [
                {
                    '$group': {
                        '_id': '$category',
                        'count': {'$sum': 1},
                        'stock': {'$sum': '$stock'}
                    }
                },
                {'$sort': {'count': -1}}
            ]
            category_stats = list(products_collection.aggregate(category_pipeline))
            
            # Recent orders
            recent_orders = list(orders_collection.find().sort('created_at', -1).limit(5))
            
            return Response({
                'total_products': total_products,
                'total_orders': total_orders,
                'total_messages': total_messages,
                'total_users': total_users,
                'total_revenue': total_revenue,
                'monthly_revenue': monthly_revenue,
                'category_stats': category_stats,
                'recent_orders': OrderSerializer(recent_orders, many=True).data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminDataView(APIView):
    """Retrieve or update admin metadata/config"""
    
    def get(self, request):
        try:
            collection = mongo_client.get_collection('admin_data')
            data_type = request.query_params.get('type')
            
            if data_type:
                data = collection.find_one({'type': data_type})
                if not data:
                    return Response({'error': 'Data type not found'}, status=status.HTTP_404_NOT_FOUND)
                data['id'] = str(data.pop('_id'))
                return Response(data)
            
            all_data = list(collection.find())
            for item in all_data:
                item['id'] = str(item.pop('_id'))
            return Response(all_data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    def post(self, request):
        try:
            data = request.data
            data_type = data.get('type')
            if not data_type:
                return Response({'error': 'Type is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            collection = mongo_client.get_collection('admin_data')
            data['updated_at'] = datetime.now()
            
            # Upsert
            collection.update_one(
                {'type': data_type},
                {'$set': data},
                upsert=True
            )
            
            updated_doc = collection.find_one({'type': data_type})
            updated_doc['id'] = str(updated_doc.pop('_id'))
            return Response(updated_doc)
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


class ChatMessageView(APIView):
    """Save and retrieve chat messages"""

    def get(self, request):
        try:
            collection = mongo_client.get_collection('messages')
            session_id = request.query_params.get('session_id')
            query = {'session_id': session_id} if session_id else {}
            messages = list(collection.find(query).sort('created_at', 1))
            for msg in messages:
                msg['id'] = str(msg.pop('_id'))
            return Response(ChatMessageSerializer(messages, many=True).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = ChatMessageSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('messages')
                message_data = serializer.validated_data
                message_data['created_at'] = datetime.now()

                result = collection.insert_one(message_data)
                message_data['_id'] = result.inserted_id

                return Response(
                    ChatMessageSerializer(message_data).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                return Response({
                    'banners': [],
                    'services': [],
                    'categories': [],
                    'trust_strip': []
                })
                
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
                    'address': {
                        'id': None,
                        'nickname': 'Home',
                        'addressLine1': '',
                        'addressLine2': '',
                        'city': '',
                        'state': '',
                        'pincode': '',
                        'country': 'India'
                    },
                    'savedAddresses': [],
                    'appSettings': {
                        'locationAccess': False,
                        'notifications': True,
                        'emailUpdates': True,
                        'smsAlerts': False,
                        'darkMode': False
                    }
                })
            
            # Ensure we always return an array for savedAddresses
            if 'savedAddresses' not in profile or not isinstance(profile['savedAddresses'], list):
                profile['savedAddresses'] = []

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


class UserSettingsView(APIView):
    """Get or Update User Settings (dark mode, notifications, etc.)"""
    
    def get(self, request, email):
        try:
            collection = mongo_client.get_collection('user_settings')
            settings = collection.find_one({'email': email})
            
            if not settings:
                # Return default settings matching DB structure in screenshot
                return Response({
                    'email': email,
                    'dark_mode': False,
                    'email_updates': True,
                    'floating_shortcut': False,
                    'language': 'English',
                    'location_access': False,
                    'notifications': True,
                    'overlay_mode': False,
                    'sms_alerts': True
                })
            
            # Convert ObjectId to string
            settings['id'] = str(settings.pop('_id', ''))
            return Response(settings)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, email):
        try:
            collection = mongo_client.get_collection('user_settings')
            settings_data = request.data
            settings_data['email'] = email
            settings_data['updated_at'] = datetime.now()
            
            collection.update_one(
                {'email': email},
                {'$set': settings_data},
                upsert=True
            )
            
            updated_settings = collection.find_one({'email': email})
            updated_settings['id'] = str(updated_settings.pop('_id', ''))
            
            return Response(updated_settings, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
