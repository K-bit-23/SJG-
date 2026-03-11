import stripe
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from .mongodb import mongo_client
from bson import ObjectId
from django.conf import settings

# Read Stripe secret key from Django settings (.env)
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', os.environ.get('STRIPE_SECRET_KEY', ''))


# ---------------------------------------------------------------------------
# Stripe HOSTED Checkout Session (redirects to buy.stripe.com branded page)
# ---------------------------------------------------------------------------

class CreateCheckoutSessionView(APIView):
    """
    POST /api/create-checkout-session/
    Body: { order_id, success_url?, cancel_url? }
    Returns: { checkout_url }  -- frontend redirects user to this URL
    """
    def post(self, request):
        try:
            if not stripe.api_key:
                return Response(
                    {'error': 'Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            order_id_str = request.data.get('order_id')
            success_url  = request.data.get('success_url', 'http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}')
            cancel_url   = request.data.get('cancel_url',  'http://localhost:3000/checkout')

            if not order_id_str:
                return Response({'error': 'order_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch order from MongoDB (try custom order_id first, then ObjectId)
            collection = mongo_client.get_collection('orders')
            order = collection.find_one({'order_id': order_id_str})
            if not order:
                try:
                    order = collection.find_one({'_id': ObjectId(order_id_str)})
                except Exception:
                    pass

            if not order:
                return Response({'error': f'Order not found: {order_id_str}'}, status=status.HTTP_404_NOT_FOUND)

            # Build Stripe line items from order items
            line_items = []
            for item in order.get('items', []):
                price_paise = int(float(item.get('price', 0)) * 100)
                if price_paise > 0:
                    line_items.append({
                        'price_data': {
                            'currency': 'inr',
                            'product_data': {
                                'name': item.get('product_name', 'Product'),
                            },
                            'unit_amount': price_paise,
                        },
                        'quantity': int(item.get('quantity', 1)),
                    })

            # Fallback: use total_amount as a single line item
            if not line_items:
                total_paise = int(float(order.get('total_amount', 0)) * 100)
                line_items = [{
                    'price_data': {
                        'currency': 'inr',
                        'product_data': {'name': 'SJG Stationery Order'},
                        'unit_amount': max(total_paise, 50),
                    },
                    'quantity': 1,
                }]

            # Create Stripe hosted Checkout Session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=order.get('user_email', '') or None,
                metadata={
                    'mongo_id':        str(order['_id']),
                    'custom_order_id': order.get('order_id', ''),
                },
                billing_address_collection='auto',
            )

            # Save session ID in order document
            collection.update_one(
                {'_id': order['_id']},
                {'$set': {
                    'stripe_session_id': session.id,
                    'payment_status':    'pending',
                    'updated_at':        datetime.now(),
                }}
            )

            return Response({'checkout_url': session.url, 'session_id': session.id})

        except stripe.error.StripeError as e:
            return Response({'error': str(e.user_message)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# Stripe Payment Intent (inline CardElement — kept for compatibility)
# ---------------------------------------------------------------------------

class CreatePaymentIntentView(APIView):
    def post(self, request):
        try:
            order_id_str = request.data.get('order_id')
            if not order_id_str:
                return Response({'error': 'Order ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            collection = mongo_client.get_collection('orders')
            order = collection.find_one({'order_id': order_id_str})
            if not order:
                try:
                    order = collection.find_one({'_id': ObjectId(order_id_str)})
                except Exception:
                    pass

            if not order:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

            amount = int(float(order.get('total_amount', 0)) * 100)
            if amount <= 0:
                return Response({'error': 'Invalid order amount'}, status=status.HTTP_400_BAD_REQUEST)

            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='inr',
                automatic_payment_methods={'enabled': True},
                metadata={
                    'order_id':        str(order['_id']),
                    'custom_order_id': order.get('order_id', ''),
                    'customer_email':  order.get('user_email', ''),
                }
            )

            return Response({'clientSecret': intent['client_secret']})

        except stripe.error.StripeError as e:
            return Response({'error': str(e.user_message)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# Confirm Payment (called after PaymentIntent succeeds)
# ---------------------------------------------------------------------------

class ConfirmPaymentView(APIView):
    def post(self, request):
        try:
            payment_intent_id = request.data.get('payment_intent_id')
            order_id          = request.data.get('order_id')

            if not payment_intent_id or not order_id:
                return Response(
                    {'error': 'Missing payment_intent_id or order_id'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if intent.status == 'succeeded':
                collection = mongo_client.get_collection('orders')
                result = collection.update_one(
                    {'order_id': order_id},
                    {'$set': {
                        'status':             'processing',
                        'payment_status':     'paid',
                        'payment_intent_id':  payment_intent_id,
                        'updated_at':         datetime.utcnow(),
                    }}
                )
                if result.matched_count == 0:
                    return Response({'error': 'Order not found in DB'}, status=status.HTTP_404_NOT_FOUND)

                return Response({'status': 'success', 'message': 'Payment confirmed. Order is now processing.'})
            else:
                return Response(
                    {'error': f'Payment not succeeded. Status: {intent.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except stripe.error.StripeError as e:
            return Response({'error': str(e.user_message)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
