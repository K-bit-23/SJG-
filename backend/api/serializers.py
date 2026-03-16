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
    product_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    category = serializers.CharField(max_length=100, required=False, allow_blank=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    description = serializers.CharField(required=False, allow_blank=True)
    image = serializers.CharField(required=False, allow_blank=True, max_length=5000000)  # supports base64
    stock = serializers.IntegerField(default=0)
    status = serializers.CharField(required=False, allow_blank=True, default='active')
    tags = serializers.CharField(required=False, allow_blank=True)
    inStock = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_inStock(self, obj):
        if isinstance(obj, dict):
            return obj.get('stock', 0) > 0
        return getattr(obj, 'stock', 0) > 0

class OrderItemSerializer(serializers.Serializer):
    product_id = serializers.CharField(required=False, allow_null=True)
    product_name = serializers.CharField(required=False, allow_null=True, source='name')
    name = serializers.CharField(required=False, allow_null=True) # Support both
    quantity = serializers.IntegerField(default=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    category = serializers.CharField(required=False, allow_blank=True)

class OrderSerializer(serializers.Serializer):
    id = ObjectIdField(read_only=True, source='_id')
    order_id = serializers.CharField(read_only=True)
    user_email = serializers.EmailField(required=False, allow_null=True)
    user_name = serializers.CharField(max_length=200, required=False, allow_null=True)
    items = OrderItemSerializer(many=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField(default='pending')
    shipping_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    payment_method = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    payment_status = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    transaction_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    delivery_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    delivery_partner = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    tracking_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class ContactMessageSerializer(serializers.Serializer):
    id = ObjectIdField(read_only=True, source='_id')
    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    message = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)

class ChatMessageSerializer(serializers.Serializer):
    id = ObjectIdField(read_only=True, source='_id')
    session_id = serializers.CharField(max_length=200)
    sender = serializers.ChoiceField(choices=['user', 'bot'])
    text = serializers.CharField()
    user_email = serializers.EmailField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)

class UserSerializer(serializers.Serializer):
    id = ObjectIdField(read_only=True, source='_id')
    uid = serializers.CharField(required=False, allow_null=True)
    email = serializers.EmailField()
    display_name = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField(required=False, allow_blank=True) # Fallback for mobile app
    photo_url = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(default='user')
    password = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    street = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    zip = serializers.CharField(required=False, allow_blank=True)
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

class CategoryItemSerializer(serializers.Serializer):
    name = serializers.CharField(allow_blank=True)
    img = serializers.CharField(allow_blank=True)
    count = serializers.CharField(allow_blank=True, required=False)

class HomePageContentSerializer(serializers.Serializer):
    banners = BannerSerializer(many=True)
    services = ServiceSerializer(many=True)
    categories = CategoryItemSerializer(many=True, required=False)
    trust_strip = TrustStripSerializer(many=True)

class ChatBotConfigSerializer(serializers.Serializer):
    welcome_message = serializers.CharField(max_length=500, default="Hello! How can I help you today?")
    quick_replies = serializers.ListField(
        child=serializers.CharField(max_length=100),
        default=[],
        allow_empty=True
    )

class NotificationSerializer(serializers.Serializer):
    id = ObjectIdField(read_only=True, source='_id')
    user_email = serializers.EmailField()
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    type = serializers.CharField(max_length=50) # e.g., 'processing', 'placed', 'completed', 'cancelled'
    order_id = serializers.CharField(max_length=100, required=False, allow_blank=True)
    is_read = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField(read_only=True)

class AdminDataSerializer(serializers.Serializer):
    id = ObjectIdField(read_only=True, source='_id')
    type = serializers.CharField(max_length=100)
    # Use a method field or just a dict field without source='*' to avoid confusion
    content = serializers.DictField(required=False, source='*')
    updated_at = serializers.DateTimeField(read_only=True)
