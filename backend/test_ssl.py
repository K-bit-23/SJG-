import smtplib

def test_ssl():
    email = 'karthikeyankarthikeyan0414@gmail.com'
    password = 'ezelffqqcoewijsc'
    
    print("Testing SSL on Port 465...")
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(email, password)
        print("SUCCESS with SSL/465!")
        server.quit()
    except Exception as e:
        print(f"FAILED with SSL/465: {str(e)}")

if __name__ == "__main__":
    test_ssl()
