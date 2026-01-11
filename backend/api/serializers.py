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
    product_code = serializers.CharField(max_length=50, required=False, allow_blank=True)  # SKU/Product Code
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

# --- Home Page Content Serializers ---

class BannerSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    title = serializers.CharField(allow_blank=True)
    subtitle = serializers.CharField(allow_blank=True)
    description = serializers.CharField(allow_blank=True, required=False)
    img = serializers.CharField(allow_blank=True)
    btnText = serializers.CharField(allow_blank=True, required=False)
    btnLink = serializers.CharField(allow_blank=True, required=False)

class ServiceSerializer(serializers.Serializer):
    name = serializers.CharField(allow_blank=True)
    desc = serializers.CharField(allow_blank=True)
    icon = serializers.CharField(allow_blank=True)
    color = serializers.CharField(allow_blank=True)
    price = serializers.CharField(allow_blank=True)

class TrustStripSerializer(serializers.Serializer):
    icon = serializers.CharField(allow_blank=True)
    title = serializers.CharField(allow_blank=True)
    desc = serializers.CharField(allow_blank=True)

class HomePageContentSerializer(serializers.Serializer):
    banners = BannerSerializer(many=True)
    services = ServiceSerializer(many=True)
    trust_strip = TrustStripSerializer(many=True)

class ChatBotConfigSerializer(serializers.Serializer):
    welcome_message = serializers.CharField(max_length=500, default="Hello! How can I help you today?")
    quick_replies = serializers.ListField(
        child=serializers.CharField(max_length=100),
        default=[],
        allow_empty=True
    )
