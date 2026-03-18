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

def _build_html(order: dict, status_label: str = "Order Confirmed") -> str:
    order_id   = order.get('order_id', 'N/A')
    user_name  = order.get('user_name', 'Valued Customer')
    user_email = order.get('user_email', '')
    items      = order.get('items', [])
    total      = order.get('total_amount', 0)
    address    = order.get('shipping_address', 'N/A')
    pay_method = order.get('payment_method', 'N/A')
    status     = order.get('status', 'pending')

    # Status specific messaging
    status_msg = {
        "pending": "We've received your order and it's currently pending.",
        "processing": "Good news! We've started processing your order.",
        "completed": "Your order has been completed and is on its way!",
        "cancelled": "Your order has been cancelled. Please contact us for details.",
    }.get(status, "Thank you for your order! We'll start processing it shortly.")

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
  <title>{status_label}</title>
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
              {status_label} &#10003;
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
              {status_msg}
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
            <a href="{getattr(settings, 'FRONTEND_URL', 'https://sjg-ecom.web.app')}/login?redirect=/orders"
               style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);
                      color:#fff;font-size:14px;font-weight:700;padding:14px 32px;
                      border-radius:999px;text-decoration:none;">
              Login to Track My Order &rarr;
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

def _build_text(order: dict, status_label: str = "Order Confirmed") -> str:
    order_id   = order.get('order_id', 'N/A')
    user_name  = order.get('user_name', 'Valued Customer')
    items      = order.get('items', [])
    total      = order.get('total_amount', 0)
    address    = order.get('shipping_address', 'N/A')
    pay_method = order.get('payment_method', 'N/A')
    status     = order.get('status', 'pending')

    status_msg = {
        "pending": "received and is currently pending",
        "processing": "now being processed",
        "completed": "completed and shipped",
        "cancelled": "been cancelled",
    }.get(status, "received")

    item_lines = '\n'.join(
        f"  - {i.get('product_name','Product')} x{i.get('quantity',1)}  "
        f"Rs.{float(i.get('price',0)) * int(i.get('quantity',1)):.2f}"
        for i in items
    )

    return f"""
Hi {user_name},

{status_label}! Your order has been {status_msg}.

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

def _send_via_resend(recipients, subject, html_body, text_body):
    """Sends email via Resend's HTTP API (Bypasses port blocking)"""
    import urllib.request
    import json
    
    api_key = os.environ.get('RESEND_API_KEY')
    if not api_key:
        return False, "RESEND_API_KEY not configured"

    from_email = os.environ.get('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
    # If using onboarding@resend.dev, it only sends to the verified account email.
    
    payload = {
        "from": f"SJG Stationery <{from_email}>",
        "to": recipients,
        "subject": subject,
        "html": html_body,
        "text": text_body
    }

    try:
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps(payload).encode(),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
        )
        with urllib.request.urlopen(req) as res:
            print(f"[RESEND] Successful dispatch: {res.read().decode()}")
            return True, None
    except Exception as e:
        err_msg = str(e)
        if hasattr(e, 'read'):
            err_msg += f" | Details: {e.read().decode()}"
        return False, err_msg


def _send(order: dict, delay_seconds: int, status_label: str):
    """Wait, then send via API (Cloud) or SMTP (Local)."""
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    if delay_seconds > 0:
        time.sleep(delay_seconds)

    customer_email = (order.get('user_email') or '').strip()
    order_id = order.get('order_id', 'N/A')
    send_to_customer_only = getattr(settings, 'EMAIL_SEND_TO_CUSTOMER_ONLY', True)
    notify_emails = getattr(settings, 'ORDER_NOTIFY_EMAIL', [])

    recipients = [customer_email] if customer_email else []
    if not send_to_customer_only and notify_emails:
        recipients.extend(notify_emails if isinstance(notify_emails, list) else [str(notify_emails)])

    recipients = list({e.strip() for e in recipients if e})
    if not recipients:
        return

    subject = f"{status_label}: {order_id} | SJG Stationery"
    html_body = _build_html(order, status_label)
    text_body = _build_text(order, status_label)

    # 1. ALWAYS TRY THE HTTP API (RESEND) FIRST ON CLOUD HOSTS
    api_success, api_error = _send_via_resend(recipients, subject, html_body, text_body)
    if api_success:
        print(f"[EMAIL] Sent via HTTP API for order {order_id}")
        return

    # 2. FALLBACK TO SMTP (FOR LOCAL DEV OR IF API IS MISSING)
    print(f"[EMAIL] API failed ({api_error}). Falling back to SMTP...")
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = settings.DEFAULT_FROM_EMAIL
        msg['To'] = ', '.join(recipients)
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        smtp_user = settings.EMAIL_HOST_USER
        smtp_pass = settings.EMAIL_HOST_PASSWORD

        # Attempt SSL then TLS
        for use_ssl in [True, False]:
            try:
                if use_ssl:
                    server = smtplib.SMTP_SSL(settings.EMAIL_HOST, 465, timeout=10)
                else:
                    server = smtplib.SMTP(settings.EMAIL_HOST, 587, timeout=10)
                    server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(settings.DEFAULT_FROM_EMAIL, recipients, msg.as_string())
                server.quit()
                print(f"[EMAIL] Sent via SMTP ({('SSL' if use_ssl else 'TLS')})")
                return
            except:
                continue
    except Exception as exc:
        print(f"[EMAIL] Final fallback failed: {exc}")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def send_order_confirmation_after_delay(order: dict, delay_seconds: int = 0):
    """Send confirmation email synchronously (No threads for cloud stability)."""
    print(f"[EMAIL] Processing confirmation for {order.get('order_id')}")
    _send(order, 0, "Order Confirmed")


def send_order_status_notification(order: dict):
    """Send immediate status update notification synchronously."""
    status = order.get('status', 'Update').capitalize()
    print(f"[EMAIL] Processing status update: {status} for {order.get('order_id')}")
    _send(order, 0, f"Order {status}")
