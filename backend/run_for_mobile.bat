@echo off
echo Starting Django Backend for Mobile Testing...
echo Server will be accessible at http://<YOUR_IP_ADDRESS>:8000
echo.
echo Make sure your mobile device is on the same Wi-Fi network.
echo.
python manage.py runserver 0.0.0.0:8000
