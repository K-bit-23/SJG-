import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def send_test_email():
    """Send a test email to verify SMTP is working"""

    # Email settings
    host = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    port = int(os.getenv('EMAIL_PORT', 587))
    user = os.getenv('EMAIL_HOST_USER')
    password = os.getenv('EMAIL_HOST_PASSWORD')
    use_tls = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'

    # Create message
    msg = MIMEMultipart()
    msg['From'] = user
    msg['To'] = user  # Send to self
    msg['Subject'] = '✅ SJG SMTP Test - Success!'

    body = """
    🎉 Great news!

    Your SMTP configuration is now working correctly!

    This email confirms that:
    ✅ Gmail SMTP authentication is successful
    ✅ Email sending functionality is operational
    ✅ Contact forms and order notifications will work

    Your SJG backend email system is ready!

    Best regards,
    SJG Backend System
    """

    msg.attach(MIMEText(body, 'plain'))

    try:
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
    print("📤 Testing Email Sending...")
    send_test_email()