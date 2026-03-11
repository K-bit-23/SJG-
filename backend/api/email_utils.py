"""
email_utils.py -- Order confirmation email sent via Gmail SMTP.

Usage:
    from api.email_utils import send_order_confirmation_after_delay
    send_order_confirmation_after_delay(order)   # fires async after 30 s
"""

import threading
import time
import traceback

from django.conf import settings
from django.core.mail import EmailMultiAlternatives


# ---------------------------------------------------------------------------
# HTML email template
# ---------------------------------------------------------------------------

def _build_html(order: dict) -> str:
    order_id   = order.get('order_id', 'N/A')
    user_name  = order.get('user_name', 'Valued Customer')
    user_email = order.get('user_email', '')
    items      = order.get('items', [])
    total      = order.get('total_amount', 0)
    address    = order.get('shipping_address', 'N/A')
    pay_method = order.get('payment_method', 'N/A')

    rows = ''.join(
        f'''
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">{i.get("product_name","Product")}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">{i.get("quantity",1)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">
            &#8377;{float(i.get("price",0)) * int(i.get("quantity",1)):.2f}
          </td>
        </tr>'''
        for i in items
    )

    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:16px;overflow:hidden;
                    box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);
                     padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;
                       letter-spacing:-0.5px;">SJG Stationery</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.8);font-size:14px;">
              Order Confirmed &#10003;
            </p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 16px;">
            <h2 style="margin:0 0 8px;color:#1f2937;font-size:20px;">
              Hi {user_name},
            </h2>
            <p style="margin:0;color:#6b7280;font-size:15px;line-height:1.6;">
              Thank you for your order! We've received it and will start
              processing it shortly.
            </p>
          </td>
        </tr>

        <!-- Order ID badge -->
        <tr>
          <td style="padding:0 40px 24px;">
            <div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:10px;
                        padding:14px 20px;display:inline-block;">
              <span style="color:#6b7280;font-size:12px;font-weight:600;
                           text-transform:uppercase;letter-spacing:.5px;">Order ID</span><br>
              <span style="color:#4f46e5;font-size:18px;font-weight:800;">{order_id}</span>
            </div>
          </td>
        </tr>

        <!-- Items table -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="border-collapse:collapse;border-radius:10px;overflow:hidden;
                          border:1px solid #e5e7eb;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;
                             color:#6b7280;font-weight:700;text-transform:uppercase;">Product</th>
                  <th style="padding:10px 12px;text-align:center;font-size:12px;
                             color:#6b7280;font-weight:700;text-transform:uppercase;">Qty</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;
                             color:#6b7280;font-weight:700;text-transform:uppercase;">Amount</th>
                </tr>
              </thead>
              <tbody style="color:#374151;font-size:14px;">
                {rows}
              </tbody>
              <tfoot>
                <tr style="background:#f9fafb;">
                  <td colspan="2" style="padding:14px 12px;font-weight:700;
                                         color:#1f2937;font-size:15px;">Total</td>
                  <td style="padding:14px 12px;text-align:right;font-weight:800;
                             color:#4f46e5;font-size:18px;">&#8377;{float(total):.2f}</td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>

        <!-- Details -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding-right:10px;">
                  <div style="background:#fafafa;border-radius:10px;border:1px solid #e5e7eb;
                              padding:16px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;
                               text-transform:uppercase;font-weight:700;">Shipping To</p>
                    <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;">{address}</p>
                  </div>
                </td>
                <td width="50%" style="padding-left:10px;">
                  <div style="background:#fafafa;border-radius:10px;border:1px solid #e5e7eb;
                              padding:16px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;
                               text-transform:uppercase;font-weight:700;">Payment Method</p>
                    <p style="margin:0;font-size:13px;color:#374151;">{pay_method}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="http://localhost:3000/profile"
               style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);
                      color:#fff;font-size:14px;font-weight:700;padding:14px 32px;
                      border-radius:999px;text-decoration:none;">
              Track My Order &rarr;
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;
                     padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              SJG Stationery Ecommerce &bull;
              Questions? Reply to this email.<br>
              &copy; 2026 SJG Stationery. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Plain-text fallback
# ---------------------------------------------------------------------------

def _build_text(order: dict) -> str:
    order_id   = order.get('order_id', 'N/A')
    user_name  = order.get('user_name', 'Valued Customer')
    items      = order.get('items', [])
    total      = order.get('total_amount', 0)
    address    = order.get('shipping_address', 'N/A')
    pay_method = order.get('payment_method', 'N/A')

    item_lines = '\n'.join(
        f"  - {i.get('product_name','Product')} x{i.get('quantity',1)}  "
        f"Rs.{float(i.get('price',0)) * int(i.get('quantity',1)):.2f}"
        for i in items
    )

    return f"""
Hi {user_name},

Your order has been confirmed!

Order ID   : {order_id}
Total      : Rs.{float(total):.2f}
Payment    : {pay_method}
Ship To    : {address}

Items:
{item_lines}

Thank you for shopping at SJG Stationery!
"""


# ---------------------------------------------------------------------------
# Core send function (runs in a background thread)
# ---------------------------------------------------------------------------

def _send(order: dict, delay_seconds: int):
    """Wait, then send the confirmation email."""
    time.sleep(delay_seconds)

    notify_email = getattr(settings, 'ORDER_NOTIFY_EMAIL', settings.EMAIL_HOST_USER)
    customer_email = order.get('user_email', '')
    order_id = order.get('order_id', 'N/A')

    recipients = list({notify_email, customer_email} - {''})   # unique, non-empty

    if not recipients:
        print(f"[EMAIL] No recipients for order {order_id} — skipping")
        return

    try:
        subject = f"Order Confirmed: {order_id} | SJG Stationery"
        html_body = _build_html(order)
        text_body = _build_text(order)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipients,
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)

        print(f"[EMAIL] Order confirmation sent for {order_id} -> {recipients}")

    except Exception as exc:
        print(f"[EMAIL] Failed to send for {order_id}: {exc}")
        traceback.print_exc()


# ---------------------------------------------------------------------------
# Public API — call this from views.py after creating an order
# ---------------------------------------------------------------------------

def send_order_confirmation_after_delay(order: dict, delay_seconds: int = 30):
    """
    Launch a daemon thread that waits `delay_seconds` then sends the email.
    Non-blocking — returns immediately.
    """
    t = threading.Thread(
        target=_send,
        args=(order, delay_seconds),
        name=f"email-{order.get('order_id','?')}",
        daemon=True,
    )
    t.start()
    print(f"[EMAIL] Scheduled confirmation for order {order.get('order_id')} in {delay_seconds}s")
