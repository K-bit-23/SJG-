from rest_framework import serializers
from bson import ObjectId

class ObjectIdField(serializers.Field):
    """Custom field for MongoDB ObjectId"""
    def to_representation(self, value):
        return str(value)
    
    def to_internal_value(self, data):
        try:
            return ObjectId(data)
        except Exception:
            raise serializers.ValidationError('Invalid ObjectId')

class ProductSerializer(serializers.Serializer):
    id = ObjectIdField(read_only=True, source='_id')
    name = serializers.CharField(max_length=200)
    category = serializers.CharField(max_length=100)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    description = serializers.CharField(required=False, allow_blank=True)
    image = serializers.CharField(required=False, allow_blank=True)
    stock = serializers.IntegerField(default=0)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class OrderItemSerializer(serializers.Serializer):
    product_id = serializers.CharField()
    product_name = serializers.CharField()
    quantity = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)

class OrderSerializer(serializers.Serializer):
    id = ObjectIdField(read_only=True, source='_id')
    order_id = serializers.CharField(read_only=True)
    user_email = serializers.EmailField()
    user_name = serializers.CharField(max_length=200)
    items = OrderItemSerializer(many=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.ChoiceField(
        choices=['pending', 'processing', 'completed', 'cancelled'],
        default='pending'
    )
    shipping_address = serializers.CharField()
    payment_method = serializers.CharField(max_length=50)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class ContactMessageSerializer(serializers.Serializer):
    id = ObjectIdField(read_only=True, source='_id')
    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    message = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)

class UserSerializer(serializers.Serializer):
    uid = serializers.CharField()
    email = serializers.EmailField()
    display_name = serializers.CharField(required=False, allow_blank=True)
    photo_url = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(default='user')
    created_at = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(required=False)
