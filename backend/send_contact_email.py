import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

def send_contact_email(name, email, message):
    """Send a contact form email"""

    # Email settings
    host = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    port = int(os.getenv('EMAIL_PORT', 587))
    user = os.getenv('EMAIL_HOST_USER')
    password = os.getenv('EMAIL_HOST_PASSWORD')
    use_tls = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
    from_email = os.getenv('DEFAULT_FROM_EMAIL', user)

    # Create message
    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = 'sjgvxerox@gmail.com'  # Your business email
    msg['Subject'] = f'New Contact Form Message from {name}'

    body = f"""
    New contact form submission:

    Name: {name}
    Email: {email}

    Message:
    {message}

    ---
    Sent from SJG Website Contact Form
    """

    msg.attach(MIMEText(body, 'plain'))

    try:
        # Send email
        server = smtplib.SMTP(host, port)
        if use_tls:
            server.starttls()
        server.login(user, password)
        text = msg.as_string()
        server.sendmail(from_email, 'sjgvxerox@gmail.com', text)
        server.quit()

        print("✅ Contact email sent successfully!")
        return True

    except Exception as e:
        print(f"❌ Failed to send contact email: {e}")
        return False

if __name__ == "__main__":
    # Test with sample data
    print("📤 Testing Contact Email...")
    send_contact_email(
        name="Test User",
        email="test@example.com",
        message="This is a test message from the contact form."
    )