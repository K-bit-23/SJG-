from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from rest_framework import status
from bson import ObjectId
from datetime import datetime, timedelta
import random
import string
import os
import base64
import io
from pathlib import Path
import traceback
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
import time

# Store server start time for uptime tracking
START_TIME = time.time()

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
        # Try build first, then public
        logo_path = Path(settings.BASE_DIR) / '..' / 'frontend' / 'build' / 'logo.png'
        if not logo_path.exists():
            logo_path = Path(settings.BASE_DIR) / '..' / 'frontend' / 'public' / 'logo.png'
            
        logo_path = logo_path.resolve()
        if not logo_path.exists():
            return None
        with open(logo_path, 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8')
    except Exception:
        return None


def generate_invoice_pdf(order_data):
    """Generate a clean minimalist PDF invoice bytes for the order matching the new template."""
    if not REPORTLAB_AVAILABLE:
        return None

    try:
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        margin = 50
        
        # Colors
        text_main = colors.black
        text_muted = colors.HexColor('#4b5563') # gray-600
        line_color = colors.HexColor('#e5e7eb') # gray-200
        bg_highlight = colors.HexColor('#f3f4f6') # gray-100

        # Pre-fetch Global Settings
        store_name = "SJG Stationery"
        store_address_1 = "Sakthi Nagar, Thindal"
        store_address_2 = "Erode - 638012"
        store_phone = "+91 93600 24821"
        store_email = "sjgvxerox@gmail.com"
        currency_sym = "INR " # Rupee symbol can have font issues in reportlab default fonts, fallback to INR
        gst_rate = 18

        try:
            collection = mongo_client.get_collection('admin_data')
            settings_data = collection.find_one({'type': 'settings'})
            if settings_data:
                store_name = settings_data.get('store_name', store_name)
                # Split address into two lines if long
                full_add = settings_data.get('address', "Sakthi Nagar, Thindal, Erode - 638012.")
                store_address_1 = full_add
                store_address_2 = ""
                store_phone = settings_data.get('whatsapp', store_phone)
                store_email = settings_data.get('email', store_email)
                gst_rate = float(settings_data.get('gst_percentage', 18))
        except: pass

        # 1. Logo Centered Top
        logo_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'build', 'logo.png')
        if not os.path.exists(logo_path):
            logo_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'logo.png')
            
        logo_y = height - 90
        logo_size = 48
        if os.path.exists(logo_path):
            # Draw a faint circle behind logo
            c.setStrokeColor(line_color)
            c.setFillColor(colors.white)
            c.circle(width/2, logo_y + (logo_size/2), logo_size/2 + 10, fill=1, stroke=1)
            c.drawImage(logo_path, (width - logo_size)/2, logo_y, width=logo_size, height=logo_size, preserveAspectRatio=True, mask='auto')
        else:
            c.setFont('Helvetica-Bold', 24)
            c.setFillColor(text_main)
            c.drawCentredString(width/2, logo_y + 15, "SJG")

        # 2. Informational Block (TO & INVOICE)
        info_y = logo_y - 60
        
        # Left Side (TO)
        c.setFillColor(text_muted)
        c.setFont('Helvetica-Bold', 10)
        c.drawString(margin, info_y, "TO")
        
        c.setFillColor(text_main)
        c.setFont('Helvetica-Bold', 11)
        cust_name = str(order_data.get('user_name', 'Customer Name'))
        c.drawString(margin, info_y - 20, cust_name)
        
        c.setFont('Helvetica', 10)
        c.drawString(margin, info_y - 35, str(order_data.get('user_phone', '')))
        
        # Right Side (INVOICE Details)
        invoice_x = width/2 + 50
        c.setFont('Helvetica-Bold', 12)
        c.drawString(invoice_x, info_y, "Invoice")
        
        c.setFont('Helvetica-Bold', 10)
        c.drawString(invoice_x, info_y - 20, "Invoice No:")
        c.drawString(invoice_x, info_y - 35, "Issue Date:")
        c.drawString(invoice_x, info_y - 50, "Due Date:")
        
        c.setFont('Helvetica', 10)
        order_id = order_data.get('order_id', 'N/A')
        created_at = order_data.get('created_at')
        if not created_at: created_at = datetime.now()
        date_str = created_at.strftime('%d.%m.%Y') if hasattr(created_at, 'strftime') else str(created_at)
        
        c.drawRightString(width - margin, info_y - 20, order_id)
        c.drawRightString(width - margin, info_y - 35, date_str)
        c.drawRightString(width - margin, info_y - 50, date_str) # Due date same as issue date for receipt

        # 3. Items Table
        table_y = info_y - 100
        
        # Table Header
        c.setStrokeColor(text_main)
        c.setLineWidth(1.5)
        c.line(margin, table_y, width - margin, table_y)
        c.line(margin, table_y - 25, width - margin, table_y - 25)
        
        c.setFont('Helvetica-Bold', 10)
        c.drawString(margin, table_y - 17, "Description")
        c.drawCentredString(width/2 + 20, table_y - 17, "Quantity")
        c.drawRightString(width - margin - 80, table_y - 17, "Unit Price")
        c.drawRightString(width - margin, table_y - 17, "Amount")

        # Rows
        items = order_data.get('items', [])
        row_y = table_y - 45
        c.setFont('Helvetica', 10)
        
        subtotal = 0
        for item in items:
            name = item.get('name', item.get('product_name', 'Item'))
            qty = item.get('quantity', item.get('qty', 1))
            price = float(item.get('price', 0))
            line_total = qty * price
            subtotal += line_total
            
            c.drawString(margin, row_y, name[:45])
            c.drawCentredString(width/2 + 20, row_y, str(qty))
            c.drawRightString(width - margin - 80, row_y, f"{currency_sym}{price:,.2f}")
            c.drawRightString(width - margin, row_y, f"{currency_sym}{line_total:,.2f}")
            
            c.setStrokeColor(line_color)
            c.setLineWidth(0.5)
            c.line(margin, row_y - 10, width - margin, row_y - 10)
            row_y -= 25
            
            if row_y < 200:
                c.showPage()
                row_y = height - 100

        # 4. Calculations Right Aligned
        summary_y = row_y - 20
        total_amt = float(order_data.get('total_amount', subtotal))
        actual_subtotal = total_amt / (1 + (gst_rate/100))
        gst_amt = total_amt - actual_subtotal

        c.setFont('Helvetica-Bold', 10)
        c.drawString(width/2 + 20, summary_y, "Subtotal")
        c.setFont('Helvetica', 10)
        c.drawRightString(width - margin, summary_y, f"{currency_sym}{actual_subtotal:,.2f}")

        c.setFont('Helvetica-Bold', 10)
        c.drawString(width/2 + 20, summary_y - 20, f"Tax ({gst_rate}% GST)")
        c.setFont('Helvetica', 10)
        c.drawRightString(width - margin, summary_y - 20, f"{currency_sym}{gst_amt:,.2f}")
        
        c.setStrokeColor(text_main)
        c.setLineWidth(1.5)
        c.line(width/2 + 20, summary_y - 30, width - margin, summary_y - 30)

        c.setFont('Helvetica-Bold', 10)
        c.drawString(width/2 + 20, summary_y - 45, "Total")
        c.drawRightString(width - margin, summary_y - 45, f"{currency_sym}{total_amt:,.2f}")

        # Note Badge
        badge_y = summary_y - 85
        c.setFillColor(bg_highlight)
        c.rect(width - margin - 150, badge_y - 12, 150, 22, fill=1, stroke=0)
        c.setFillColor(text_main)
        c.setFont('Helvetica-Bold', 9)
        c.drawCentredString(width - margin - 75, badge_y - 5, "Please pay within 7 days. Thanks!")

        # 5. Footer Left/Right Info
        footer_y = 100
        c.setStrokeColor(line_color)
        c.setLineWidth(1)
        c.line(margin, footer_y + 20, width - margin, footer_y + 20)

        c.setFillColor(text_main)
        c.setFont('Helvetica-Bold', 10)
        
        # Left
        c.drawString(margin, footer_y, store_name)
        c.setFont('Helvetica', 10)
        c.drawString(margin, footer_y - 15, store_address_1)
        if store_address_2:
            c.drawString(margin, footer_y - 30, store_address_2)
            c.drawString(margin, footer_y - 45, "VAT ID: 12345678")
        else:
            c.drawString(margin, footer_y - 30, "VAT ID: 12345678")

        # Right
        c.setFont('Helvetica-Bold', 10)
        c.drawString(invoice_x, footer_y, "Contact")
        c.setFont('Helvetica', 10)
        c.drawString(invoice_x, footer_y - 15, store_email)
        c.drawString(invoice_x, footer_y - 30, store_phone)
        
        c.setFillColor(colors.HexColor('#4f46e5')) # Indigo-600
        c.drawString(invoice_x, footer_y - 45, "sjg-ecom.web.app")

        c.showPage()
        c.save()
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        import traceback
        traceback.print_exc()
        return None



def send_order_email(order_data):
    """Send order confirmation email with premium modern layout."""
    try:
        # Check SMTP settings first to avoid silent failures in threads
        if not getattr(settings, 'EMAIL_HOST_USER', None) or not getattr(settings, 'EMAIL_HOST_PASSWORD', None):
            print("Email skipped: SMTP credentials (EMAIL_HOST_USER/PASSWORD) not found in settings.")
            return

        user_email = order_data.get('user_email')
        if not user_email:
            print("Email skipped: No user_email found in order_data.")
            return

        order_id = str(order_data.get('order_id', 'N/A'))
        print(f"Initiating order email for {order_id} to {user_email}")
        
        user_name = order_data.get('user_name', 'Customer')
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
        import traceback
        print(f"Email failure: {e}")
        traceback.print_exc()


def send_low_stock_alert(low_stock_items):
    """Send an alert email to admin when products reach low stock.

    low_stock_items should be a list of dicts with keys: name, stock, threshold.
    """
    try:
        admin_emails = getattr(settings, 'ORDER_NOTIFY_EMAIL', [])
        if not admin_emails:
            # Fallback to single string if list is empty
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
            admin_emails = [from_email] if from_email else []

        if not admin_emails:
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
            admin_emails,
            fail_silently=True,
        )
        print(f"Low stock alert sent to {admin_emails}")
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

                # Send order confirmation email asynchronously using email_utils
                from api.email_utils import send_order_confirmation_after_delay
                send_order_confirmation_after_delay(dict(order_data), delay_seconds=0)

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
    """Save a contact message to MongoDB and send email notification"""
    
    def post(self, request):
        try:
            serializer = ContactMessageSerializer(data=request.data)
            if serializer.is_valid():
                collection = mongo_client.get_collection('messages')
                message_data = serializer.validated_data
                message_data['created_at'] = datetime.now()
                
                result = collection.insert_one(message_data)
                message_data['_id'] = result.inserted_id
                
                # Send email notification to admin
                try:
                    admin_emails = getattr(settings, 'ORDER_NOTIFY_EMAIL', [])
                    if not admin_emails:
                        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
                        admin_emails = [from_email] if from_email else []
                        
                    if admin_emails:
                        subject = f"New Contact Message from {message_data.get('name', 'Customer')}"
                        body = f"""
New contact form submission:

Name: {message_data.get('name', 'N/A')}
Email: {message_data.get('email', 'N/A')}
Phone: {message_data.get('phone', 'N/A')}

Message:
{message_data.get('message', 'N/A')}

---
Received via SJG Website Contact Form
                        """.strip()
                        
                        send_mail(
                            subject,
                            body,
                            settings.DEFAULT_FROM_EMAIL,
                            admin_emails,
                            fail_silently=True,
                        )
                        print(f"Contact form email sent to {admin_emails}")
                except Exception as email_error:
                    print(f"Failed to send contact email notification: {email_error}")
                
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

class MessageDetailView(APIView):
    """Delete a single message"""
    def delete(self, request, pk):
        try:
            collection = mongo_client.get_collection('messages')
            try:
                query = {'_id': ObjectId(pk)}
            except:
                query = {'id': pk}
                
            result = collection.delete_one(query)
            if result.deleted_count == 0:
                return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'success': True}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserListCreateView(APIView):
    """List all users or create/sync a user"""
    
    def get(self, request):
        try:
            collection = mongo_client.get_collection('users')
            # Filter by role if provided
            role = request.query_params.get('role')
            phone = request.query_params.get('phone')
            
            query = {}
            if role: query['role'] = role
            if phone: query['phone'] = phone
            
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
    """Simple health check endpoint with HTML support"""
    def get(self, request):
        try:
            # Check MongoDB connection
            mongo_client.get_collection('health').find_one()
            status_data = {"status": "healthy", "mongodb": "connected", "timestamp": datetime.now()}
        except Exception as e:
            status_data = {"status": "degraded", "error": str(e), "timestamp": datetime.now()}

        # Return HTML for browser, JSON for API
        if request.query_params.get('format') != 'json' and 'text/html' in request.META.get('HTTP_ACCEPT', ''):
            return render(request, 'api_root.html', {'initial_view': 'health', 'status': status_data, 'year': datetime.now().year})
        
        return Response(status_data, status=status.HTTP_200_OK if status_data['status'] == 'healthy' else status.HTTP_200_OK)

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
    """Enhanced diagnostic view to test SMTP settings with HTML fallback"""
    def get(self, request):
        import traceback
        from django.core.mail import send_mail
        from django.conf import settings
        
        # Diagnostics Configuration
        diag = {
            "EMAIL_HOST": settings.EMAIL_HOST,
            "EMAIL_PORT": settings.EMAIL_PORT,
            "EMAIL_USE_TLS": settings.EMAIL_USE_TLS,
            "EMAIL_USE_SSL": settings.EMAIL_USE_SSL,
            "EMAIL_HOST_USER": settings.EMAIL_HOST_USER,
            "DEFAULT_FROM_EMAIL": settings.DEFAULT_FROM_EMAIL,
            "EMAIL_ACCOUNT_FLAG": getattr(settings, 'EMAIL_ACCOUNT', 'N/A'),
        }

        try:
            target = request.query_params.get('email', settings.DEFAULT_FROM_EMAIL)
            subject = "SJG SMTP Diagnostic Test"
            message = f"This is a diagnostic test from the SJG Backend Command Center.\n\nAccount Used: {settings.EMAIL_HOST_USER}\nTarget: {target}\n\nIf you see this, your SMTP settings are working correctly!"
            
            sent = send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [target],
                fail_silently=False,
            )
            
            result = {
                "status": "success",
                "message": f"Test email successfully DISPATCHED to {target}",
                "count": sent,
                "config_diagnostics": diag
            }
        except Exception as e:
            error_msg = str(e)
            hint = "Unknown connection error."
            if "BadCredentials" in error_msg or "535" in error_msg:
                hint = "Gmail AUTHENTICATION FAILED. Use 16-character 'App Password'."
            elif "ConnectionRefused" in error_msg or "timeout" in error_msg.lower():
                hint = f"CONNECTION REFUSED on port {settings.EMAIL_PORT}. Likely blocked by Render/Host."

            result = {
                "status": "error",
                "message": error_msg,
                "diagnostic_hint": hint,
                "details": traceback.format_exc(),
                "config_diagnostics": diag
            }

        if request.query_params.get('format') != 'json' and 'text/html' in request.META.get('HTTP_ACCEPT', ''):
            return render(request, 'api_root.html', {
                'initial_view': 'diagnostic', 
                'result': result, 
                'year': datetime.now().year
            })

        return Response(result, status=status.HTTP_200_OK if result['status'] == 'success' else status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            
            # The pdf_bytes is already the raw bytes returned from getvalue()
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            filename = f"Invoice_{order.get('order_id', pk)}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SystemStatsView(APIView):
    """Internal diagnostic endpoint for real-time dashboard statistics."""
    def get(self, request):
        try:
            # 1. Basic Stats from MongoDB
            products_count = mongo_client.get_collection('products').count_documents({})
            orders_count = mongo_client.get_collection('orders').count_documents({})
            users_count = mongo_client.get_collection('users').count_documents({})
            msg_count = mongo_client.get_collection('contact_messages').count_documents({})
            
            # 2. Revenue Calculation
            orders = list(mongo_client.get_collection('orders').find({}, {'total_amount': 1}))
            total_revenue = sum(float(o.get('total_amount', 0)) for o in orders)
            
            # 3. Server Uptime
            uptime_seconds = int(time.time() - START_TIME)
            
            # 4. Recent Logs (Simulated for Now, pulling latest events)
            recent_orders = list(mongo_client.get_collection('orders').find().sort('created_at', -1).limit(3))
            recent_msgs = list(mongo_client.get_collection('contact_messages').find().sort('created_at', -1).limit(2))
            
            logs = []
            for o in recent_orders:
                logs.append({
                    "time": o.get('created_at', datetime.now()).strftime('%H:%M:%S'),
                    "msg": f"ORDER INGRESS: ID {str(o.get('order_id', '...'))} processed.",
                    "type": "success"
                })
            for m in recent_msgs:
                logs.append({
                    "time": m.get('created_at', datetime.now()).strftime('%H:%M:%S'),
                    "msg": f"LOGIC SIGNAL: Message from {m.get('name', 'User')} received.",
                    "type": "info"
                })
                
            return Response({
                "counts": {
                    "products": products_count,
                    "orders": orders_count,
                    "users": users_count,
                    "messages": msg_count
                },
                "revenue": round(total_revenue, 2),
                "uptime": uptime_seconds,
                "logs": sorted(logs, key=lambda x: x['time'], reverse=True),
                "memory": f"{random.randint(45, 120)} MB", # Simulated
                "cpu": f"{random.randint(2, 15)}%", # Simulated
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def api_root_view(request):
    """Render a modern status dashboard for the SJG backend API."""
    return render(request, 'api_root.html', {
        'year': datetime.now().year,
    })
