import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.models import Product

def seed_products():
    products = [
        {
            "name": "Classmate Pulse Spiral Notebook",
            "description": "A4 Size, 300 Pages, Spiral Bound with high-quality paper.",
            "price": 185.00,
            "category": "Notebooks",
            "stock": 45,
            "image": "https://m.media-amazon.com/images/I/718yD5p1u+L._SL1500_.jpg"
        },
        {
            "name": "Parker Frontier Matte Black GT",
            "description": "Premium rollerball pen with gold trim and smooth ink flow.",
            "price": 750.00,
            "category": "Pens",
            "stock": 15,
            "image": "https://m.media-amazon.com/images/I/51p6y-A+UoL._SL1200_.jpg"
        },
        {
            "name": "Camlin Kokuyo Watercolor set",
            "description": "Essential art supplies with 24 vibrant shades and brush included.",
            "price": 320.00,
            "category": "Art Supplies",
            "stock": 20,
            "image": "https://m.media-amazon.com/images/I/81xU+c297JL._SL1500_.jpg"
        },
        {
            "name": "Bostik Blue Tack (Reusable)",
            "description": "Handy adhesive for home, school, and office projects.",
            "price": 95.00,
            "category": "Office Supplies",
            "stock": 100,
            "image": "https://m.media-amazon.com/images/I/61k8fW7-DkL._SL1000_.jpg"
        },
        {
            "name": "Doms Neon Pencils (Set of 10)",
            "description": "Premium graphite pencils with rubber tipping for smooth writing.",
            "price": 50.00,
            "category": "Pens",
            "stock": 80,
            "image": "https://m.media-amazon.com/images/I/71zV-z0p8lL._SL1500_.jpg"
        },
        {
            "name": "Premium Leatherette Desk Organizer",
            "description": "Elegant brown desk set with multiple compartments for files and stationery.",
            "price": 1250.00,
            "category": "Accessories",
            "stock": 8,
            "image": "https://m.media-amazon.com/images/I/71Yy3I2-C5L._SL1500_.jpg"
        },
        {
            "name": "Staedtler Mars Lumograph (Set of 12)",
            "description": "Professional drawing and sketching pencils for artists.",
            "price": 990.00,
            "category": "Art Supplies",
            "stock": 12,
            "image": "https://m.media-amazon.com/images/I/81JIKuF3u0L._SL1500_.jpg"
        },
        {
            "name": "Casio MJ-120D Plus Calculator",
            "description": "12-digit desktop calculator with GST calculation features.",
            "price": 495.00,
            "category": "Office Supplies",
            "stock": 30,
            "image": "https://m.media-amazon.com/images/I/71mJmE+V8-L._SL1500_.jpg"
        }
    ]

    # Clear existing test data if any
    # Product.objects.all().delete()
    
    for p_data in products:
        if not Product.objects.filter(name=p_data['name']).exists():
            Product.objects.create(**p_data)
            print(f"Added: {p_data['name']}")
        else:
            print(f"Skipped (Exists): {p_data['name']}")

if __name__ == '__main__':
    seed_products()
