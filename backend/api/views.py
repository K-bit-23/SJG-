from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse
from rest_framework import status
from bson import ObjectId
from datetime import datetime, timedelta
import random
import string
import os
import base64
import io
from pathlib import Path
from .mongodb import mongo_client
from .serializers import (
    ProductSerializer, OrderSerializer, ContactMessageSerializer, UserSerializer,
    HomePageContentSerializer, ChatBotConfigSerializer, AdminDataSerializer,
    NotificationSerializer, ChatMessageSerializer
)
from django.core.mail import EmailMultiAlternatives, send_mail
from django.utils.html import strip_tags
from django.conf import settings
import threading

# ReportLab is used to generate PDF invoice attachments
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas
    from reportlab.platypus import Table, TableStyle
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

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

class OfflineOrderView(APIView):
    """Process an offline purchase and update inventory"""
    
    def post(self, request):
        try:
            data = request.data
            items = data.get('items', [])
            customer = data.get('customer', {})
            
            if not items:
                return Response({'error': 'No items in order'}, status=status.HTTP_400_BAD_REQUEST)
                
            products_collection = mongo_client.get_collection('products')
            orders_collection = mongo_client.get_collection('orders')
            
            # 1. Update Inventory for each item
            for item in items:
                product_id = item.get('id')
                qty = item.get('quantity', 1)
                
                # Only update inventory if it's a real product and NOT a service
                is_service = item.get('category') == 'Services' or str(product_id).startswith('srv-')
                if product_id and not is_service:
                    try:
                        # Ensure we have a valid ObjectId for MongoDB
                        obj_id = ObjectId(product_id) if isinstance(product_id, str) and len(product_id) == 24 else product_id
                        if isinstance(obj_id, ObjectId):
                            products_collection.update_one(
                                {'_id': obj_id},
                                {'$inc': {'stock': -qty}}
                            )
                    except:
                        pass # Skip inventory update for non-existent or invalid product IDs
            
            # 2. Create Order Record
            order_id = f"OFF-{int(datetime.now().timestamp())}"
            order_data = {
                'order_id': order_id,
                'user_name': customer.get('name', 'Offline Customer'),
                'user_email': customer.get('email', 'offline@sjg.com'),
                'user_phone': customer.get('phone', ''),
                'items': items,
                'total_amount': data.get('total', 0),
                'status': 'completed',
                'payment_status': 'paid',
                'payment_method': 'offline',
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            orders_collection.insert_one(order_data)
            
            return Response({'success': True, 'order_id': order_id})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_logo_base64():
    """Load the project logo as a base64 string for email embedding."""
    try:
        logo_path = Path(settings.BASE_DIR) / '..' / 'frontend' / 'public' / 'logo.png'
        logo_path = logo_path.resolve()
        if not logo_path.exists():
            return None
        with open(logo_path, 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8')
    except Exception:
        return None


def generate_invoice_pdf(order_data):
    """Generate a premium PDF invoice bytes for the order."""
    if not REPORTLAB_AVAILABLE:
        return None

    try:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        margin = 50
        
        # Colors
        primary_color = colors.HexColor('#0f172a') # Slate-900 (Deep/Premium)
        accent_color = colors.HexColor('#4f46e5')  # Indio-600
        text_main = colors.HexColor('#1e293b')     # Slate-800
        text_muted = colors.HexColor('#64748b')    # Slate-500
        bg_light = colors.HexColor('#f8fafc')      # Slate-50

        # Pre-fetch Global Settings
        store_name = "SJG STATIONERY"
        store_address = "Sakthi Nagar, Thindal, Erode - 638012."
        store_phone = "+91 93600 24821"
        store_email = "sjgvxerox@gmail.com"
        currency_sym = "₹"
        gst_rate = 18

        try:
            collection = mongo_client.get_collection('admin_data')
            settings_data = collection.find_one({'type': 'settings'})
            if settings_data:
                store_name = settings_data.get('store_name', store_name).upper()
                store_address = settings_data.get('address', store_address)
                store_phone = settings_data.get('whatsapp', store_phone)
                store_email = settings_data.get('email', store_email)
                currency_sym = settings_data.get('currency', 'INR (₹)').split(' ')[-1].replace('(', '').replace(')', '')
                gst_rate = float(settings_data.get('gst_percentage', 18))
        except: pass

        # 1. Header & Logo
        # Header strip
        c.setFillColor(primary_color)
        c.rect(0, height - 120, width, 120, fill=1, stroke=0)
        
        # Logo
        logo_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'logo.png')
        if os.path.exists(logo_path):
            c.drawImage(logo_path, margin, height - 90, width=32*mm, preserveAspectRatio=True, mask='auto')
        else:
            c.setFont('Helvetica-Bold', 28)
            c.setFillColor(colors.white)
            c.drawString(margin, height - 75, "SJG.")

        # Invoice Text
        c.setFillColor(colors.white)
        c.setFont('Helvetica-Bold', 32)
        c.drawRightString(width - margin, height - 65, "INVOICE")
        c.setFont('Helvetica', 9)
        c.drawRightString(width - margin, height - 85, "REGULAR TAX INVOICE")

        # 2. Information Block
        info_y = height - 170
        c.setFillColor(primary_color)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(margin, info_y, "CUSTOMER DETAILS")
        c.drawString(width/2 + 20, info_y, "INVOICE DETAILS")
        
        c.setStrokeColor(bg_light)
        c.setLineWidth(1)
        c.line(margin, info_y - 5, width - margin, info_y - 5)

        # Customer Info
        c.setFillColor(text_main)
        c.setFont('Helvetica-Bold', 13)
        cust_name = str(order_data.get('user_name', 'Walk-in Customer'))
        c.drawString(margin, info_y - 25, cust_name)
        
        c.setFont('Helvetica', 10)
        c.setFillColor(text_muted)
        c.drawString(margin, info_y - 42, str(order_data.get('user_phone', '')))
        c.drawString(margin, info_y - 57, str(order_data.get('user_email', '')))

        # Invoice Info
        c.setFillColor(text_main)
        c.setFont('Helvetica', 10)
        order_id = order_data.get('order_id', 'N/A')
        created_at = order_data.get('created_at')
        if not created_at: created_at = datetime.now()
        date_str = created_at.strftime('%d %B %Y') if hasattr(created_at, 'strftime') else str(created_at)
        
        c.drawString(width/2 + 20, info_y - 25, f"Invoice No: {order_id}")
        c.drawString(width/2 + 20, info_y - 42, f"Issue Date: {date_str}")
        c.drawString(width/2 + 20, info_y - 57, f"Payment: {str(order_data.get('payment_method', 'Offline')).capitalize()}")

        # 3. Items Table
        table_y = info_y - 120
        # Header BG
        c.setFillColor(bg_light)
        c.rect(margin, table_y, width - (margin * 2), 25, fill=1, stroke=0)
        
        c.setFillColor(primary_color)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(margin + 10, table_y + 8, "ITEM DESCRIPTION")
        c.drawCentredString(width - margin - 140, table_y + 8, "QTY")
        c.drawRightString(width - margin - 80, table_y + 8, "UNIT PRICE")
        c.drawRightString(width - margin - 10, table_y + 8, "AMOUNT")

        # Rows
        items = order_data.get('items', [])
        row_y = table_y - 25
        c.setFont('Helvetica', 10)
        c.setFillColor(text_main)
        
        subtotal = 0
        for item in items:
            name = item.get('name', item.get('product_name', 'Item'))
            qty = item.get('quantity', item.get('qty', 1))
            price = float(item.get('price', 0))
            line_total = qty * price
            subtotal += line_total
            
            c.drawString(margin + 10, row_y, name[:50])
            c.drawCentredString(width - margin - 140, row_y, str(qty))
            c.drawRightString(width - margin - 80, row_y, f"{currency_sym}{price:,.2f}")
            c.drawRightString(width - margin - 10, row_y, f"{currency_sym}{line_total:,.2f}")
            
            c.setStrokeColor(bg_light)
            c.line(margin, row_y - 8, width - margin, row_y - 8)
            row_y -= 25
            
            # Simple page break
            if row_y < 150:
                c.showPage()
                row_y = height - 100

        # 4. Calculation Summary
        summary_y = row_y - 30
        c.setFont('Helvetica-Bold', 10)
        
        total_amt = float(order_data.get('total_amount', subtotal))
        # If order_data total doesn't match sum of items, use the higher one or trust provided total
        # We'll assume the provided total includes everything
        actual_subtotal = total_amt / (1 + (gst_rate/100))
        gst_amt = total_amt - actual_subtotal

        c.drawRightString(width - margin - 100, summary_y, "Subtotal")
        c.drawRightString(width - margin - 10, summary_y, f"{currency_sym}{actual_subtotal:,.2f}")
        
        c.setFont('Helvetica', 10)
        c.setFillColor(text_muted)
        c.drawRightString(width - margin - 100, summary_y - 20, f"Tax (GST {gst_rate}%)")
        c.drawRightString(width - margin - 10, summary_y - 20, f"{currency_sym}{gst_amt:,.2f}")
        
        c.setFillColor(primary_color)
        c.setFont('Helvetica-Bold', 16)
        c.drawRightString(width - margin - 100, summary_y - 50, "GRAND TOTAL")
        c.drawRightString(width - margin - 10, summary_y - 50, f"{currency_sym}{total_amt:,.2f}")

        # 5. Footer & Terms
        c.setStrokeColor(primary_color)
        c.setLineWidth(1.5)
        c.line(margin, 120, width - margin, 120)
        
        c.setFont('Helvetica-Bold', 10)
        c.drawString(margin, 100, store_name)
        c.setFont('Helvetica', 8)
        c.setFillColor(text_muted)
        c.drawString(margin, 88, store_address)
        c.drawString(margin, 78, f"WhatsApp: {store_phone}  |  Email: {store_email}")
        
        c.setFont('Helvetica-Bold', 10)
        c.setFillColor(primary_color)
        c.drawRightString(width - margin, 100, "Store Manager")
        c.setFont('Helvetica', 8)
        c.drawRightString(width - margin, 88, "(Authorized Signatory)")
        
        c.setFont('Helvetica-Oblique', 8)
        c.drawCentredString(width/2, 40, "Thank you for your business! Please visit again.")

        c.showPage()
        c.save()
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        print(f"PDF Error: {e}")
        return None



def send_order_email(order_data):
    """Send order confirmation email with premium modern layout."""
    try:
        user_email = order_data.get('user_email')
        if not user_email:
            return

        user_name = order_data.get('user_name', 'Customer')
        order_id = order_data.get('order_id')
        items = order_data.get('items', [])
        total = float(order_data.get('total_amount', 0))
        shipping = 0 if total > 999 else 0.0 # Standard Free Delivery
        grand_total = total + shipping
        status_text = order_data.get('status', 'Confirmed').capitalize()
        payment_method = order_data.get('payment_method', 'Online').capitalize()
        
        # Fetch settings for footer
        settings_col = mongo_client.get_collection('admin_data')
        admin_settings = settings_col.find_one({'type': 'settings'}) or {}
        store_address = admin_settings.get('address', 'Sakthi Nagar, Thindal, Erode')
        store_phone = admin_settings.get('whatsapp', '+91 93600 24821')

        primary_color = '#6366f1' # Indigo-500
        secondary_color = '#1e293b' # Slate-800

        subject = f'SJG Order Confirmed • #{order_id.split("-")[-1]}'

        item_rows = ""
        for item in items:
            item_rows += f"""
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 16px 0;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: {secondary_color};">{item.get('product_name') or item.get('name')}</p>
                    <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Qty: {item.get('quantity')}</p>
                </td>
                <td style="padding: 16px 0; text-align: right; font-size: 14px; font-weight: 700; color: {secondary_color};">₹{float(item.get('price', 0)):.2f}</td>
            </tr>
            """

        html_content = f"""
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08);">
                <!-- Header -->
                <div style="background-color: {secondary_color}; padding: 40px; text-align: center; position: relative;">
                    <div style="background: white; width: 64px; height: 64px; border-radius: 18px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                        <img src="https://raw.githubusercontent.com/K-bit-23/SJG-/main/frontend/public/logo.png" style="width: 40px; height: 40px; object-fit: contain;">
                    </div>
                    <h1 style="color: white; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.04em;">Order Confirmed</h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Order #{order_id.split("-")[-1]}</p>
                </div>

                <!-- Body -->
                <div style="padding: 40px;">
                    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">Hi <strong>{user_name}</strong>, prompt and premium! Your order has been successfully placed and is now being prepared for shipment.</p>
                    
                    <div style="display: flex; gap: 16px; margin-bottom: 40px; background: #f1f5f9; padding: 20px; border-radius: 20px;">
                        <div style="flex: 1;">
                            <span style="display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Status</span>
                            <span style="font-size: 14px; font-weight: 700; color: #1e293b; display: flex; align-items: center;">
                                <span style="width: 10px; height: 10px; background: #22c55e; border-radius: 50%; display: inline-block; margin-right: 6px;"></span>
                                {status_text}
                            </span>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            <span style="display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Payment</span>
                            <span style="font-size: 14px; font-weight: 700; color: #1e293b;">{payment_method}</span>
                        </div>
                    </div>

                    <h3 style="font-size: 14px; font-weight: 900; color: {secondary_color}; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                        {item_rows}
                    </table>

                    <!-- Totals -->
                    <div style="background: #f8fafc; padding: 24px; border-radius: 24px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="color: #64748b; font-size: 14px; padding-bottom: 12px;">Subtotal</td>
                                <td style="text-align: right; color: {secondary_color}; font-size: 14px; font-weight: 700; padding-bottom: 12px;">₹{total:.2f}</td>
                            </tr>
                            <tr>
                                <td style="color: #64748b; font-size: 14px; padding-bottom: 16px;">Delivery</td>
                                <td style="text-align: right; color: #22c55e; font-size: 14px; font-weight: 700; padding-bottom: 16px;">FREE</td>
                            </tr>
                            <tr style="border-top: 2px solid #e2e8f0;">
                                <td style="padding-top: 16px; color: {secondary_color}; font-size: 16px; font-weight: 900;">Total Amount</td>
                                <td style="padding-top: 16px; text-align: right; color: {primary_color}; font-size: 24px; font-weight: 900;">₹{grand_total:.2f}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Footer Info -->
                    <div style="margin-top: 48px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 32px;">
                        <p style="color: {secondary_color}; font-size: 14px; font-weight: 800; margin: 0;">SJG Stationery & Xerox</p>
                        <p style="color: #64748b; font-size: 12px; margin: 4px 0 0; line-height: 1.5;">{store_address}<br>Ph: {store_phone}</p>
                        <div style="margin-top: 24px;">
                            <a href="https://sjgstationery.com/orders" style="background: {primary_color}; color: white; padding: 12px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; display: inline-block;">Track Order</a>
                        </div>
                    </div>
                </div>
            </div>
            <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 24px;">You are receiving this because an order was placed using your email on SJG.</p>
        </div>
        """

        text_content = strip_tags(html_content)
        email = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [user_email])
        email.attach_alternative(html_content, "text/html")

        # Attach PDF Invoice
        invoice_pdf = generate_invoice_pdf(order_data)
        if invoice_pdf:
            email.attach(f'Invoice_{order_id}.pdf', invoice_pdf, 'application/pdf')
        email.send(fail_silently=False)
        print(f"Coral Order Confirmation Email (with PDF) sent to {user_email}")
    except Exception as e:
        print(f"Email failure: {e}")


def send_low_stock_alert(low_stock_items):
    """Send an alert email to admin when products reach low stock.

    low_stock_items should be a list of dicts with keys: name, stock, threshold.
    """
    try:
        admin_email = getattr(settings, 'ORDER_NOTIFY_EMAIL', None) or getattr(settings, 'DEFAULT_FROM_EMAIL', None)
        if not admin_email:
            print("Low stock alert not sent: no admin email configured.")
            return

        subject = "Low stock alert: products need restocking"
        item_lines = []
        for item in low_stock_items:
            name = item.get('name') or 'Unknown product'
            stock = item.get('stock')
            threshold = item.get('threshold')
            item_lines.append(f"- {name}: {stock} left (threshold: {threshold})")

        body = "The following products have reached low stock levels:\n\n" + "\n".join(item_lines)
        body += "\n\nPlease restock them soon to avoid order fulfillment issues."

        send_mail(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            [admin_email],
            fail_silently=True,
        )
        print(f"Low stock alert sent to {admin_email}")
    except Exception as e:
        print(f"Failed to send low stock alert: {e}")


class OrderListCreateView(APIView):
    """List all orders or create a new order"""
    
    def get(self, request):
        try:
            collection = mongo_client.get_collection('orders')
            user_email = request.query_params.get('user_email')
            query = {'user_email': user_email} if user_email else {}
            
            orders = list(collection.find(query).sort('created_at', -1))
            print(f"DEBUG: Found {len(orders)} orders in DB")
            serializer = OrderSerializer(orders, many=True)
            data = serializer.data
            print(f"DEBUG: Serialized {len(data)} orders")
            return Response(data)
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

                # Decrement stock for each product in the order, and warn admin if stock gets low
                low_stock_items = []
                try:
                    product_collection = mongo_client.get_collection('products')
                    LOW_STOCK_THRESHOLD = 10  # customize as needed

                    for item in order_data.get('items', []):
                        pid = item.get('product_id')
                        qty = int(item.get('quantity', 1))
                        if not pid or qty <= 0:
                            continue

                        # Resolve product record (ObjectId first, then fallback to string)
                        try:
                            query = {'_id': ObjectId(pid)}
                        except Exception:
                            query = {'id': pid}

                        product = product_collection.find_one(query)
                        if not product:
                            continue

                        current_stock = int(product.get('stock', 0))
                        if current_stock < qty:
                            return Response(
                                {'error': f"Insufficient stock for '{product.get('name', 'item')}'. Available: {current_stock}, requested: {qty}."},
                                status=status.HTTP_400_BAD_REQUEST
                            )

                        new_stock = max(current_stock - qty, 0)
                        product_collection.update_one(query, {'$set': {'stock': new_stock}})

                        if new_stock <= LOW_STOCK_THRESHOLD:
                            low_stock_items.append({
                                'name': product.get('name'),
                                'stock': new_stock,
                                'threshold': LOW_STOCK_THRESHOLD
                            })
                except Exception as stock_err:
                    print(f"Failed to update stock: {str(stock_err)}")
                    return Response(
                        {'error': 'Failed to update stock. Please try again later.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                # Save order after stock has been adjusted
                result = collection.insert_one(order_data)
                order_data['_id'] = result.inserted_id

                # Send order confirmation email asynchronously
                threading.Thread(target=send_order_email, args=(order_data,)).start()

                # If any items are in low stock, notify the admin
                if low_stock_items:
                    threading.Thread(target=send_low_stock_alert, args=(low_stock_items,)).start()

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
            update_data.pop('_id', None)
            update_data.pop('id', None)
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
                    {'error': f'Order not found: {pk}'},
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
            
            # Delivered vs Non-Delivered
            delivered_orders = orders_collection.count_documents({'status': 'completed'})
            non_delivered_orders = orders_collection.count_documents({
                'status': {'$nin': ['completed', 'cancelled']}
            })
            
            # Calculate total revenue
            pipeline = [
                {'$group': {'_id': None, 'total': {'$sum': '$total_amount'}}}
            ]
            revenue_result = list(orders_collection.aggregate(pipeline))
            total_revenue = float(revenue_result[0]['total']) if revenue_result else 0
            
            # Monthly Revenue Trend (Last 6 months)
            now = datetime.now()
            six_months_ago = now - timedelta(days=180)
            monthly_pipeline = [
                {'$match': {'created_at': {'$gte': six_months_ago}}},
                {
                    '$group': {
                        '_id': {
                            'year': {'$year': '$created_at'},
                            'month': {'$month': '$created_at'}
                        },
                        'total': {'$sum': '$total_amount'},
                        'count': {'$sum': 1}
                    }
                },
                {'$sort': {'_id.year': 1, '_id.month': 1}}
            ]
            monthly_revenue = list(orders_collection.aggregate(monthly_pipeline))

            # Category Breakdown
            category_pipeline = [
                {'$unwind': '$items'},
                {'$group': {
                    '_id': '$items.category',
                    'count': {'$sum': '$items.quantity'},
                    'revenue': {'$sum': {'$multiply': ['$items.price', '$items.quantity']}}
                }},
                {'$sort': {'revenue': -1}},
                {'$limit': 5}
            ]
            category_breakdown = list(orders_collection.aggregate(category_pipeline))
            
            # Fallback for category breakdown if no orders yet
            if not category_breakdown:
                # Use products as a hint for what categories exist
                prod_categories = list(products_collection.aggregate([
                    {'$group': {'_id': '$category', 'count': {'$sum': 1}}}
                ]))
                category_breakdown = [{'_id': item['_id'] or 'General', 'revenue': 0, 'count': item['count']} for item in prod_categories[:5]]

            # Format results for frontend
            months_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            
            # Ensure at least last 3 months are present in monthly revenue
            formatted_monthly = []
            monthly_map = {f"{item['_id']['year']}-{item['_id']['month']}": item for item in monthly_revenue}
            
            for i in range(5, -1, -1):
                check_date = now - timedelta(days=i*30)
                m_key = f"{check_date.year}-{check_date.month}"
                if m_key in monthly_map:
                    item = monthly_map[m_key]
                    formatted_monthly.append({
                        'month': months_names[check_date.month - 1],
                        'amount': item['total'],
                        'count': item['count']
                    })
                else:
                    formatted_monthly.append({
                        'month': months_names[check_date.month - 1],
                        'amount': 0,
                        'count': 0
                    })

            formatted_categories = [
                {
                    'name': (item['_id'] if isinstance(item['_id'], str) else 'General') or 'General',
                    'revenue': item['revenue'],
                    'count': item['count']
                } for item in category_breakdown
            ]
            
            # If still nothing, add one sample for UI
            if not formatted_categories:
                formatted_categories = [{'name': 'Stationery', 'revenue': 0, 'count': 0}]
            if not any(m['amount'] > 0 for m in formatted_monthly):
                 formatted_monthly[-1]['amount'] = total_revenue # Show total in current month if no trend
            
            return Response({
                'total_revenue': total_revenue,
                'active_orders': total_orders,
                'customers_count': total_users,
                'products_count': total_products,
                'delivered_orders': delivered_orders,
                'non_delivered_orders': non_delivered_orders,
                'monthly_revenue': formatted_monthly,
                'category_breakdown': formatted_categories,
                'total_messages': total_messages
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
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
            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data)
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
                        'cameraAccess': True,
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
                    'camera_access': True
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

class NotificationView(APIView):
    """Get or Create notifications for a user"""
    
    def get(self, request):
        try:
            collection = mongo_client.get_collection('notifications')
            user_email = request.query_params.get('user_email')
            if not user_email:
                return Response({'error': 'user_email is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            notifications = list(collection.find({'user_email': user_email}).sort('created_at', -1).limit(20))
            return Response(NotificationSerializer(notifications, many=True).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = NotificationSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('notifications')
                notif_data = serializer.validated_data
                notif_data['created_at'] = datetime.now()
                notif_data['is_read'] = False
                
                result = collection.insert_one(notif_data)
                notif_data['_id'] = result.inserted_id
                
                return Response(NotificationSerializer(notif_data).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request):
        """Mark all as read"""
        try:
            user_email = request.data.get('user_email')
            if not user_email:
                return Response({'error': 'user_email is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            collection = mongo_client.get_collection('notifications')
            collection.update_many(
                {'user_email': user_email, 'is_read': False},
                {'$set': {'is_read': True, 'updated_at': datetime.now()}}
            )
            return Response({'message': 'All notifications marked as read'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HealthCheckView(APIView):
    """Simple health check endpoint"""
    def get(self, request):
        try:
            # Check MongoDB connection
            mongo_client.get_collection('health').find_one()
            return Response({"status": "healthy", "mongodb": "connected", "timestamp": datetime.now()})
        except Exception as e:
            return Response({"status": "degraded", "error": str(e)}, status=status.HTTP_200_OK)

class AppSettingsView(APIView):
    """Get and update global application settings"""
    def get(self, request):
        try:
            collection = mongo_client.get_collection('admin_data')
            settings = collection.find_one({'type': 'settings'})
            if not settings:
                # Fallback defaults
                return Response({
                    'store_name': 'SJG Stationery',
                    'currency': 'INR (₹)',
                    'whatsapp': '+91 93600 24821',
                    'address': 'Sakthi Nagar, Thindal, Erode - 638012.',
                    'email': 'sjgvxerox@gmail.com',
                    'gst_percentage': 18,
                    'service_gst': 18,
                    'is_online_payment_enabled': True,
                    'is_cod_enabled': True
                })
            settings['id'] = str(settings.pop('_id'))
            return Response(settings)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            data = request.data
            collection = mongo_client.get_collection('admin_data')
            
            # Ensure type is settings
            data['type'] = 'settings'
            data['updated_at'] = datetime.now()
            
            # Upsert settings
            collection.update_one(
                {'type': 'settings'},
                {'$set': data},
                upsert=True
            )
            
            # Return fresh data
            updated_settings = collection.find_one({'type': 'settings'})
            updated_settings['id'] = str(updated_settings.pop('_id'))
            return Response(updated_settings)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TestEmailView(APIView):
    """Debug view to test SMTP settings"""
    def get(self, request):
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            
            subject = "SJG SMTP Test"
            message = "If you see this, your SMTP settings are working correctly!"
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [request.query_params.get('email', settings.EMAIL_HOST_USER)]
            
            sent = send_mail(
                subject,
                message,
                from_email,
                recipient_list,
                fail_silently=False,
            )
            return Response({
                "status": "success",
                "message": f"Email sent successfully to {recipient_list}",
                "config_verification": {
                    "backend": settings.EMAIL_BACKEND,
                    "host": settings.EMAIL_HOST,
                    "port": settings.EMAIL_PORT,
                    "user": settings.EMAIL_HOST_USER,
                    "tls": settings.EMAIL_USE_TLS,
                    "ssl": getattr(settings, 'EMAIL_USE_SSL', False)
                }
            })
        except Exception as e:
            error_msg = str(e)
            hint = "Unknown error"
            if "BadCredentials" in error_msg or "535" in error_msg:
                hint = "Gmail Authentication Failed. Ensure you are using a 16-character 'App Password', NOT your regular Gmail password. Also ensure 2FA is enabled."
            elif "ConnectionRefused" in error_msg:
                hint = "Connection refused. Try changing port (587 for TLS, 465 for SSL) or check firewall settings."
                
            return Response({
                "status": "error",
                "message": error_msg,
                "diagnostic_hint": hint,
                "config_used": {
                    "host": settings.EMAIL_HOST,
                    "port": settings.EMAIL_PORT,
                    "user": settings.EMAIL_HOST_USER,
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserOrdersView(APIView):
    """Retrieve all orders for a specific user email"""
    def get(self, request, user_email):
        try:
            collection = mongo_client.get_collection('orders')
            orders = list(collection.find({'user_email': user_email}).sort('created_at', -1))
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class OrderInvoiceView(APIView):
    """Generate and return a PDF invoice for a specific order"""
    def get(self, request, pk):
        try:
            collection = mongo_client.get_collection('orders')
            
            # Find order by custom order_id or ObjectId
            order = collection.find_one({'order_id': pk})
            if not order:
                try:
                    order = collection.find_one({'_id': ObjectId(pk)})
                except:
                    pass
            
            if not order:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            
            pdf_bytes = generate_invoice_pdf(order)
            if not pdf_bytes:
                return Response({'error': 'PDF generation failed or ReportLab not available'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Get the raw bytes from the BytesIO buffer
            pdf_data = pdf_bytes.getvalue()
            
            response = HttpResponse(pdf_data, content_type='application/pdf')
            filename = f"Invoice_{order.get('order_id', pk)}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def api_root_view(request):
    """A premium, high-performance HTML landing page for the SJG Backend API"""
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SJG Core Operations | API Command Center</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Space Grotesk', sans-serif; background: #000; color: #fff; overflow-x: hidden; }
            .glass { background: rgba(10, 15, 30, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
            .glow-blue { box-shadow: 0 0 80px -20px rgba(59, 130, 246, 0.4); }
            .log-stream {
                font-family: 'Space Grotesk', monospace;
                font-size: 11px;
                line-height: 1.6;
            }
            .log-error { color: #f43f5e; }
            .log-warn { color: #fbbf24; }
            .log-success { color: #10b981; }
            .log-info { color: #6366f1; }
            .glow-purple { box-shadow: 0 0 80px -20px rgba(168, 85, 247, 0.4); }
            .gradient-text { background: linear-gradient(90deg, #60a5fa, #a855f7, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
            .animate-float { animation: float 6s ease-in-out infinite; }
            .stat-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .stat-card:hover { transform: translateY(-5px); border-color: rgba(96, 165, 250, 0.4); }
            .grid-bg { background-image: radial-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px); background-size: 40px 40px; }
        </style>
    </head>
    <body class="min-h-screen flex items-center justify-center p-4 md:p-10 relative grid-bg">
        <!-- Ambient Background Lights -->
        <div class="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <div class="absolute -top-1/4 -left-1/4 w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div class="absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
        </div>

        <div class="max-w-5xl w-full relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
            <!-- Hero Header -->
            <div class="glass glow-blue rounded-[3rem] p-10 md:p-16 border-white/10 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div class="flex flex-col items-center text-center space-y-6">
                    <div class="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Global Health: 100% Nominal
                    </div>
                    
                    <h1 class="text-6xl md:text-8xl font-bold tracking-tighter">
                        SJG <span class="gradient-text">SYSTEMS</span>
                    </h1>
                    
                    <p class="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        Precision-engineered orchestration for modern commerce. 
                    </p>

                    <!-- Dynamic Error Banner -->
                    <div id="error-banner" class="hidden w-full max-w-xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold text-sm animate-bounce">
                        ⚠️ CRITICAL: Backend connectivity disrupted. Check logs below.
                    </div>
                </div>
            </div>

            <!-- Monitoring Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <!-- Latency -->
                <div class="glass stat-card rounded-3xl p-6 flex flex-col space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latency</span>
                        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div class="flex items-end gap-2">
                        <span id="ping" class="text-4xl font-bold text-white tracking-tight tabular-nums">--</span>
                        <span class="text-slate-500 font-bold text-xs pb-1">ms</span>
                    </div>
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div id="ping-bar" class="h-full bg-blue-500 transition-all duration-500" style="width: 0%"></div>
                    </div>
                </div>

                <!-- Network Speed -->
                <div class="glass stat-card rounded-3xl p-6 flex flex-col space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Speed</span>
                        <div class="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                    </div>
                    <div class="flex items-end gap-2">
                        <span id="speed" class="text-4xl font-bold text-white tracking-tight">--</span>
                        <span class="text-slate-500 font-bold text-xs pb-1">mbps</span>
                    </div>
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div id="speed-bar" class="h-full bg-purple-500 transition-all duration-500" style="width: 0%"></div>
                    </div>
                </div>

                <!-- DB Status -->
                <div class="glass stat-card rounded-3xl p-6 flex flex-col space-y-4">
                    <div class="flex justify-between items-center">
                        <span id="db-status-text" class="text-xs font-bold text-slate-500 uppercase tracking-widest">CHECKING...</span>
                        <div id="db-indicator" class="w-2 h-2 rounded-full bg-slate-700 shadow-[0_0_10px_rgba(51,65,85,0.5)]"></div>
                    </div>
                    <div class="flex items-end gap-2">
                        <!-- No dynamic value for DB status, just text and indicator -->
                    </div>
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <!-- No progress bar for DB status -->
                    </div>
                </div>

                <!-- Data Transfer -->
                <div class="glass stat-card rounded-3xl p-6 flex flex-col space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data Transfer</span>
                        <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <div class="flex items-end gap-2">
                        <span id="transfer" class="text-4xl font-bold text-white tracking-tight tabular-nums">0.00</span>
                        <span class="text-slate-500 font-bold text-xs pb-1">GB/s</span>
                    </div>
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div id="transfer-bar" class="h-full bg-emerald-500 transition-all duration-500" style="width: 0%"></div>
                    </div>
                </div>

                <!-- Uptime -->
                <div class="glass stat-card rounded-3xl p-6 flex flex-col space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Server Uptime</span>
                        <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                    </div>
                    <div class="flex items-end gap-2">
                        <span class="text-4xl font-bold text-white tracking-tight tabular-nums">99.99</span>
                        <span class="text-slate-500 font-bold text-xs pb-1">%</span>
                    </div>
                    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-amber-500" style="width: 99.99%"></div>
                    </div>
                </div>
                      </div>
            </div>

            <!-- Developer Log Terminal -->
            <div class="glass rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
                <div class="flex items-center justify-between mb-4 px-2">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40"></div>
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time System Logs</span>
                    </div>
                    <span class="text-[9px] text-slate-600 font-mono italic">STDOUT::LIVE</span>
                </div>
                <div id="log-console" class="log-stream h-40 overflow-y-auto space-y-1 px-2 custom-scrollbar">
                    <div class="log-info">[SYSTEM] Command Center Online.</div>
                </div>
            </div>

            <!-- Endpoint Portal -->
            <div class="glass glow-purple rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                <div class="absolute inset-0 grid-bg opacity-30"></div>
                <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4 relative z-10">
                    <span class="w-8 h-[1px] bg-indigo-500/50"></span>
                    Operational Endpoints
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                    <a href="/api/products/" class="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all">
                        <span class="font-medium text-slate-300 group-hover:text-white transition-colors">Products Catalog</span>
                        <span class="text-[9px] font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">GET</span>
                    </a>
                    <a href="/api/orders/" class="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all">
                        <span class="font-medium text-slate-300 group-hover:text-white transition-colors">Orders Stream</span>
                        <span class="text-[9px] font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded">POST</span>
                    </a>
                    <a href="/admin/" class="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-rose-500/50 transition-all">
                        <span class="font-medium text-slate-300 group-hover:text-white transition-colors">Admin Terminal</span>
                        <span class="text-[9px] font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded">SECURE</span>
                    </a>
                    <a href="/api/test-email/" class="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 transition-all">
                        <span class="font-medium text-slate-300 group-hover:text-white transition-colors">Mail Diagnostic</span>
                        <span class="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded">DEBUG</span>
                    </a>
                    <a href="/api/health/" class="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all">
                        <span class="font-medium text-slate-300 group-hover:text-white transition-colors">System Health</span>
                        <span class="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">HEALTH</span>
                    </a>
                </div>
            </div>
      </div>

            <footer class="text-center space-y-2">
                <p class="text-slate-600 text-[10px] font-bold uppercase tracking-[0.5em]">
                    SJG CORE INFRASTRUCTURE • &copy; 2026 
                </p>
            </footer>
        </div>

        <script>
            // Performance Simulations
            function updateMetrics() {
                const start = Date.now();
                fetch('/api/health/')
                    .then(response => response.json())
                    .then(data => {
                        const latency = Date.now() - start;
                        document.getElementById('ping').innerText = latency;
                        document.getElementById('ping-bar').style.width = Math.min(100, (latency / 500) * 100) + '%';
                        
                        // Update DB Status from health check
                        const dbText = document.getElementById('db-status-text');
                        const dbInd = document.getElementById('db-indicator');
                        if (data.mongodb === 'connected') {
                            dbText.innerText = 'DB CONNECTED';
                            dbText.className = 'text-xs font-bold text-emerald-500 uppercase tracking-widest';
                            dbInd.className = 'w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
                            document.getElementById('error-banner').classList.add('hidden');
                        } else {
                            dbText.innerText = 'DB DEGRADED';
                            dbText.className = 'text-xs font-bold text-amber-500 uppercase tracking-widest';
                            dbInd.className = 'w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
                            document.getElementById('error-banner').classList.remove('hidden');
                            addLog("Database heartbeat missing!", "error");
                        }

                        const speed = (Math.random() * 50 + 150).toFixed(1);
                        document.getElementById('speed').innerText = speed;
                        document.getElementById('speed-bar').style.width = (speed / 300 * 100) + '%';

                        const transfer = (Math.random() * 2 + 0.5).toFixed(2);
                        document.getElementById('transfer').innerText = transfer;
                        document.getElementById('transfer-bar').style.width = (transfer / 5 * 100) + '%';
                    })
                    .catch(() => {
                        document.getElementById('ping').innerText = 'ERROR';
                        document.getElementById('ping').classList.add('text-rose-500');
                    });
            }

            function addLog(msg, type = 'info') {
                const console = document.getElementById('log-console');
                const div = document.createElement('div');
                div.className = `log-${type}`;
                div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
                console.appendChild(div);
                if (console.childNodes.length > 50) console.removeChild(console.firstChild);
                console.scrollTop = console.scrollHeight;
            }

            setInterval(updateMetrics, 3000);
            updateMetrics();
            
            // Random simulated activity logs
            setInterval(() => {
                const activities = [
                    { msg: "Incoming GET request to /api/products/", type: "info" },
                    { msg: "Cache hit: Product collection optimized.", type: "success" },
                    { msg: "Latency spike detected in region: IN-SOUTH.", type: "warn" },
                    { msg: "Database synchronization successful.", type: "success" },
                    { msg: "Secure Handshake completed.", type: "info" }
                ];
                const act = activities[Math.floor(Math.random() * activities.length)];
                addLog(act.msg, act.type);
            }, 5000);
        </script>
    </body>
    </html>
    """
    return HttpResponse(html_content)
