from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from datetime import datetime
from .mongodb import mongo_client
from .serializers import ProductSerializer, OrderSerializer

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
            order = collection.find_one({'_id': ObjectId(pk)})
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
            result = collection.update_one(
                {'_id': ObjectId(pk)},
                {'$set': update_data}
            )
            if result.matched_count == 0:
                return Response(
                    {'error': 'Order not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            order = collection.find_one({'_id': ObjectId(pk)})
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
            
            total_products = products_collection.count_documents({})
            total_orders = orders_collection.count_documents({})
            
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
                'total_revenue': total_revenue,
                'recent_orders': OrderSerializer(recent_orders, many=True).data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
