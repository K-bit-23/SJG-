
import stripe
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from .mongodb import mongo_client
from bson import ObjectId

# Initialize Stripe
# Ideally, this comes from os.environ
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_4eC39HqLyjWDarjtT1zdp7dc') # Fallback to a dummy key if not set, BUT USER MUST REPLACE

class CreatePaymentIntentView(APIView):
    def post(self, request):
        try:
            # data: { order_id: '...' }
            order_id_str = request.data.get('order_id')
            
            if not order_id_str:
                 return Response({'error': 'Order ID is required'}, status=status.HTTP_400_BAD_REQUEST)

             # Fetch order from DB to get the correct amount
            collection = mongo_client.get_collection('orders')
            # Try to find by custom ID first, then ObjectId
            order = collection.find_one({'order_id': order_id_str})
            if not order:
                 try:
                    order = collection.find_one({'_id': ObjectId(order_id_str)})
                 except:
                    pass
            
            if not order:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # OpenAI/Stripe expects amount in cents
            amount = int(float(order.get('total_amount', 0)) * 100)
            
            if amount <= 0:
                 return Response({'error': 'Invalid order amount'}, status=status.HTTP_400_BAD_REQUEST)

            # Create a PaymentIntent with the order amount and currency
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='inr', # Assuming INR based on context, can be dynamic
                metadata={'order_id': str(order.get('_id')), 'custom_order_id': order.get('order_id')}
            )

            return Response({
                'clientSecret': intent['client_secret']
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConfirmPaymentView(APIView):
    def post(self, request):
        try:
            payment_intent_id = request.data.get('payment_intent_id')
            order_id = request.data.get('order_id') # Custom order ID "ORD-..."

            if not payment_intent_id or not order_id:
                return Response({'error': 'Missing payment_intent_id or order_id'}, status=status.HTTP_400_BAD_REQUEST)

             # Verify with Stripe (optional for security but good practice)
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == 'succeeded':
                # Update MongoDB
                collection = mongo_client.get_collection('orders')
                # Find by order_id string
                
                # Check if it was already paid to avoid redundant updates? Not strictly necessary but efficient.
                
                result = collection.update_one(
                    {'order_id': order_id},
                    {
                        '$set': {
                            'status': 'processing', # Or 'paid' depending on your flow
                            'payment_status': 'paid',
                            'payment_intent_id': payment_intent_id,
                            'updated_at': datetime.now()
                        }
                    }
                )
                
                if result.matched_count == 0:
                     return Response({'error': 'Order not found in DB'}, status=status.HTTP_404_NOT_FOUND)
                     
                return Response({'status': 'success', 'message': 'Order updated to paid'})
            else:
                return Response({'error': f'Payment not succeeded, status is {intent.status}'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
