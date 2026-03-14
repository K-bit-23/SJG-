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

class AppSettingsSerializer(serializers.Serializer):
    store_name = serializers.CharField(max_length=200, default="SJG Stationery")
    contact_email = serializers.EmailField(default="contact@sjg.com")
    contact_phone = serializers.CharField(max_length=20, default="+91 1234567890")
    currency = serializers.CharField(max_length=10, default="INR")
    currency_symbol = serializers.CharField(max_length=5, default="₹")
    maintenance_mode = serializers.BooleanField(default=False)
    tax_rate = serializers.FloatField(default=18.0)
    logo_url = serializers.CharField(required=False, allow_blank=True)
    footer_text = serializers.CharField(required=False, allow_blank=True)

class UserSettingsSerializer(serializers.Serializer):
    email = serializers.EmailField()
    location_access = serializers.BooleanField(default=False)
    notifications = serializers.BooleanField(default=True)
    email_updates = serializers.BooleanField(default=True)
    sms_alerts = serializers.BooleanField(default=False)
    dark_mode = serializers.BooleanField(default=False)
    floating_shortcut = serializers.BooleanField(default=False)
    overlay_mode = serializers.BooleanField(default=False)
    language = serializers.CharField(max_length=20, default="English")
    updated_at = serializers.DateTimeField(read_only=True)
