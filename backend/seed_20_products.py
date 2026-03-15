import os
import django
from datetime import datetime
import pymongo
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from api.mongodb import mongo_client

def seed():
    db = mongo_client.get_database()
    collection = db['products']
    
    # Categories: Notebooks, Pens, Art Supplies, Office, Electronics, Paper Products
    
    products = [
        # Notebooks
        {
            "name": "Classic Moleskine Notebook",
            "category": "Notebooks",
            "price": 499.00,
            "description": "Hardcover ruled notebook, 5 x 8.25 inches.",
            "stock": 45,
            "image": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Spiral Bound Subject Notebook",
            "category": "Notebooks",
            "price": 120.00,
            "description": "3-subject spiral notebook with dividends.",
            "stock": 100,
            "image": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Eco-friendly Recycled Journal",
            "category": "Notebooks",
            "price": 350.00,
            "description": "Made from 100% recycled paper and organic ink.",
            "stock": 30,
            "image": "https://images.unsplash.com/photo-1516962080544-eac695c93791?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Pocket Memo Pad (Set of 3)",
            "category": "Notebooks",
            "price": 89.00,
            "description": "Small enough to carry anywhere for quick notes.",
            "stock": 200,
            "image": "https://images.unsplash.com/photo-1586075010633-2470bb201717?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Pens
        {
            "name": "Parker Jotter Ballpoint Pen",
            "category": "Pens",
            "price": 250.00,
            "description": "Iconic design with stainless steel barrel.",
            "stock": 60,
            "image": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Gel Pen Multi-Color Set (12)",
            "category": "Pens",
            "price": 180.00,
            "description": "Smooth flowing gel ink in vibrant colors.",
            "stock": 80,
            "image": "https://images.unsplash.com/photo-1511556102220-3004622f939e?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Luxury Fountain Pen",
            "category": "Pens",
            "price": 1250.00,
            "description": "Gold-nibbed fountain pen for executive writing.",
            "stock": 15,
            "image": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Mechanical Pencil Pro 0.5mm",
            "category": "Pens",
            "price": 145.00,
            "description": "Precision mechanical pencil for technical drawing.",
            "stock": 120,
            "image": "https://images.unsplash.com/photo-1516051662087-3b1525d88f6d?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },

        # Art Supplies
        {
            "name": "Watercolor Paint Set (24 Colors)",
            "category": "Art Supplies",
            "price": 899.00,
            "description": "Artist grade watercolors with mixing palette.",
            "stock": 25,
            "image": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Professional Sketching Pencils",
            "category": "Art Supplies",
            "price": 450.00,
            "description": "Set of 12 pencils ranging from 4H to 6B.",
            "stock": 55,
            "image": "https://images.unsplash.com/photo-1562509176-7bc77f394f99?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Canvas Board 12x16 (Pack of 5)",
            "category": "Art Supplies",
            "price": 650.00,
            "description": "Triple-primed cotton canvas for oil and acrylic.",
            "stock": 40,
            "image": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Pastel Chalk Set",
            "category": "Art Supplies",
            "price": 320.00,
            "description": "Richly pigmented soft pastels for smooth blending.",
            "stock": 35,
            "image": "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },

        # Office & Desk
        {
            "name": "Desk Organizer with Phone Stand",
            "category": "Office",
            "price": 499.00,
            "description": "Multifunctional bamboo desk organizer.",
            "stock": 20,
            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "File Tray (3-Tier Metal)",
            "category": "Office",
            "price": 750.00,
            "description": "Keep your documents organized with this mesh tray.",
            "stock": 15,
            "image": "https://images.unsplash.com/photo-1589133917861-125026ed392b?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Sticky Note Dispenser",
            "category": "Office",
            "price": 125.00,
            "description": "Weighted dispenser for easy one-handed access.",
            "stock": 60,
            "image": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Heavy Duty Stapler",
            "category": "Office",
            "price": 280.00,
            "description": "Staples up to 50 sheets easily with reduced effort.",
            "stock": 40,
            "image": "https://images.unsplash.com/photo-1582234032402-92131236f06a?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },

        # Electronics
        {
            "name": "Scientific Calculator FX-991ES",
            "category": "Electronics",
            "price": 1050.00,
            "description": "Dual power scientific calculator with 417 functions.",
            "stock": 50,
            "image": "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Wireless Laser Pointer for PPT",
            "category": "Electronics",
            "price": 550.00,
            "description": "Plug and play wireless presenter with red laser.",
            "stock": 30,
            "image": "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },

        # Paper Products
        {
            "name": "Premium A4 Printing Paper",
            "category": "Paper Products",
            "price": 320.00,
            "description": "Residue free high brightness papers for crystal clear print.",
            "stock": 500,
            "image": "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Glossy Photo Paper (20 Sheets)",
            "category": "Paper Products",
            "price": 240.00,
            "description": "Instant dry, water resistant and smudge proof.",
            "stock": 150,
            "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Legal Size Notepad (Yellow)",
            "category": "Paper Products",
            "price": 65.00,
            "description": "Classic yellow paper with margin lines.",
            "stock": 300,
            "image": "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "name": "Color Cardstock Pack (50)",
            "category": "Paper Products",
            "price": 199.00,
            "description": "Heavy weight cardstock for DIY crafts.",
            "stock": 100,
            "image": "https://images.unsplash.com/photo-1516962080544-eac695c93791?w=600",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    # Clear existing
    collection.delete_many({})
    print("Cleared existing products.")
    
    # Insert
    result = collection.insert_many(products)
    print(f"Successfully seeded {len(result.inserted_ids)} products into sjg_db.")

if __name__ == "__main__":
    seed()
