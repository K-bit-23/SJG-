import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)


def _get_smtp_config():
    """Return SMTP config (host/port/user/password/use_tls) based on env vars."""
    host = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    port = int(os.getenv('EMAIL_PORT', 587))
    use_tls = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'

    # Primary config (fall back to legacy env vars)
    primary_user = os.getenv('PRIMARY_EMAIL_HOST_USER') or os.getenv('EMAIL_HOST_USER')
    primary_password = os.getenv('PRIMARY_EMAIL_HOST_PASSWORD') or os.getenv('EMAIL_HOST_PASSWORD')

    # Secondary config (optional)
    secondary_user = os.getenv('SECONDARY_EMAIL_HOST_USER')
    secondary_password = os.getenv('SECONDARY_EMAIL_HOST_PASSWORD')

    account = os.getenv('EMAIL_ACCOUNT', 'primary').strip().lower()
    if account == 'secondary' and secondary_user:
        user = secondary_user
        password = secondary_password
    else:
        user = primary_user
        password = primary_password

    return host, port, user, password, use_tls


def test_smtp_connection():
    """Test SMTP connection and authentication"""
    print("🔍 Testing SMTP Connection...")

    host, port, user, password, use_tls = _get_smtp_config()

    print(f"📧 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"👤 User: {user}")
    print(f"🔒 Password: {'*' * len(password) if password else 'None'}")
    print(f"🔐 TLS: {use_tls}")

    if not user or not password:
        print("❌ ERROR: EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not set in .env")
        return False

    try:
        # Create SMTP connection
        print("📡 Connecting to SMTP server...")
        server = smtplib.SMTP(host, port, timeout=10)
        server.set_debuglevel(1)  # Enable debug output

        # Start TLS if required
        if use_tls:
            print("🔒 Starting TLS...")
            server.starttls()

        # Login
        print("🔑 Authenticating...")
        server.login(user, password)

        print("✅ SMTP Authentication Successful!")
        server.quit()
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Authentication Failed: {e}")
        print("\n🔧 Gmail SMTP Troubleshooting:")
        print("1. Enable 2-Factor Authentication on your Gmail account")
        print("2. Generate an App Password: https://support.google.com/accounts/answer/185833")
        print("3. Use the App Password (not your regular password) in EMAIL_HOST_PASSWORD")
        print("4. Make sure EMAIL_HOST_USER is your full Gmail address")
        return False

    except smtplib.SMTPConnectError as e:
        print(f"❌ Connection Failed: {e}")
        return False

    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

def send_test_email():
    """Send a test email to verify everything works"""
    print("\n📤 Sending Test Email...")

    host, port, user, password, use_tls = _get_smtp_config()

    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = user
        msg['To'] = user  # Send to self for testing
        msg['Subject'] = 'SMTP Test - SJG Backend'

        body = """
        Hello!

        This is a test email from your SJG backend.

        If you received this email, your SMTP configuration is working correctly!

        Best regards,
        SJG Backend System
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send email
        server = smtplib.SMTP(host, port)
        if use_tls:
            server.starttls()
        server.login(user, password)
        text = msg.as_string()
        server.sendmail(user, user, text)
        server.quit()

        print("✅ Test email sent successfully!")
        print(f"📧 Check your inbox: {user}")
        return True

    except Exception as e:
        print(f"❌ Failed to send test email: {e}")
        return False

if __name__ == "__main__":
    print("🚀 SJG Backend SMTP Diagnostic Tool")
    print("=" * 50)

    # Test connection
    if test_smtp_connection():
        # Send test email
        send_test_email()
    else:
        print("\n💡 Next Steps:")
        print("1. Visit: https://myaccount.google.com/security")
        print("2. Enable 2-Step Verification")
        print("3. Generate App Password: https://support.google.com/accounts/answer/185833")
        print("4. Update EMAIL_HOST_PASSWORD in .env file")
        print("5. Run this script again")