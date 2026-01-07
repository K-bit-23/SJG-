"""
Temporary SQLite-based views for testing
Use this while fixing MongoDB Atlas connection
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Temporary in-memory storage
TEMP_PRODUCTS = [
    {
        'id': '1',
        'name': 'Sample Notebook',
        'category': 'Stationery',
        'price': '99.99',
        'description': 'Premium quality notebook',
        'stock': 50,
        'image': 'notebook.jpg'
    },
    {
        'id': '2',
        'name': 'Pen Set',
        'category': 'Stationery',
        'price': '49.99',
        'description': 'Pack of 10 pens',
        'stock': 100,
        'image': 'pens.jpg'
    },
    {
        'id': '3',
        'name': 'A4 Paper',
        'category': 'Paper',
        'price': '299.99',
        'description': '500 sheets premium paper',
        'stock': 75,
        'image': 'paper.jpg'
    }
]

TEMP_ORDERS = []

class TempProductListView(APIView):
    """Temporary product list endpoint using in-memory data"""
    
    def get(self, request):
        return Response(TEMP_PRODUCTS)
    
    def post(self, request):
        new_product = request.data
        new_product['id'] = str(len(TEMP_PRODUCTS) + 1)
        TEMP_PRODUCTS.append(new_product)
        return Response(new_product, status=status.HTTP_201_CREATED)

class TempProductDetailView(APIView):
    """Temporary product detail endpoint"""
    
    def get(self, request, pk):
        product = next((p for p in TEMP_PRODUCTS if p['id'] == pk), None)
        if product:
            return Response(product)
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        product = next((p for p in TEMP_PRODUCTS if p['id'] == pk), None)
        if product:
            product.update(request.data)
            return Response(product)
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        global TEMP_PRODUCTS
        TEMP_PRODUCTS = [p for p in TEMP_PRODUCTS if p['id'] != pk]
        return Response(status=status.HTTP_204_NO_CONTENT)

class TempOrderListView(APIView):
    """Temporary order list endpoint"""
    
    def get(self, request):
        return Response(TEMP_ORDERS)
    
    def post(self, request):
        new_order = request.data
        new_order['id'] = str(len(TEMP_ORDERS) + 1)
        TEMP_ORDERS.append(new_order)
        return Response(new_order, status=status.HTTP_201_CREATED)

class TempOrderDetailView(APIView):
    """Temporary order detail endpoint"""
    
    def get(self, request, pk):
        order = next((o for o in TEMP_ORDERS if o['id'] == pk), None)
        if order:
            return Response(order)
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request, pk):
        order = next((o for o in TEMP_ORDERS if o['id'] == pk), None)
        if order:
            order.update(request.data)
            return Response(order)
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

class TempDashboardStatsView(APIView):
    """Temporary dashboard stats"""
    
    def get(self, request):
        total_revenue = sum(float(o.get('total_amount', 0)) for o in TEMP_ORDERS)
        return Response({
            'total_products': len(TEMP_PRODUCTS),
            'total_orders': len(TEMP_ORDERS),
            'total_revenue': total_revenue,
            'recent_orders': TEMP_ORDERS[-5:]
        })
