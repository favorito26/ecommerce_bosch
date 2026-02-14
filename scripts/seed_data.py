import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
import uuid

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "bosch_ecommerce"

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "admin@bosch.com",
        "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lXVfqWB9/wOG",  # password: admin123
        "name": "Admin User",
        "phone": "+91 9876543210",
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing_admin = await db.users.find_one({"email": "admin@bosch.com"})
    if not existing_admin:
        await db.users.insert_one(admin_user)
        print("✓ Admin user created (admin@bosch.com / admin123)")
    
    # Sample products
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Bosch Serie 8 Built-in Oven",
            "description": "Experience ultimate cooking precision with PerfectBake sensor, EcoClean Direct cleaning, and 13 heating modes. The perfect companion for your modern kitchen.",
            "price": 89999,
            "category": "ovens",
            "images": [
                "https://images.unsplash.com/photo-1723259461381-59ab9fa18f5d?w=800&q=80",
                "https://images.unsplash.com/photo-1723259461381-59ab9fa18f5d?w=800&q=80"
            ],
            "stock": 15,
            "specifications": {
                "Capacity": "71 Litres",
                "Power": "3600W",
                "Heating Modes": "13",
                "Color": "Stainless Steel",
                "Warranty": "2 Years"
            },
            "ratings_avg": 4.5,
            "ratings_count": 28,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bosch PUE611BF1J 4 Burner Induction Cooktop",
            "description": "High-efficiency induction cooking with CombiZone feature, PowerBoost function, and touch control panel. Cook faster while saving energy.",
            "price": 49999,
            "category": "cooktops",
            "images": [
                "https://images.unsplash.com/photo-1762810931790-40b25e10b3e7?w=800&q=80",
                "https://images.unsplash.com/photo-1762810931790-40b25e10b3e7?w=800&q=80"
            ],
            "stock": 22,
            "specifications": {
                "Burners": "4",
                "Power": "7400W",
                "Control": "Touch",
                "Safety": "Auto Shut-off",
                "Warranty": "2 Years"
            },
            "ratings_avg": 4.7,
            "ratings_count": 45,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bosch Serie 6 14 Place Settings Dishwasher",
            "description": "Whisper-quiet dishwashing with Zeolith drying technology, VarioSpeed Plus for 3x faster cleaning, and AquaStop leak protection system.",
            "price": 69999,
            "category": "dishwashers",
            "images": [
                "https://images.unsplash.com/photo-1676907228185-6869277a9f8f?w=800&q=80",
                "https://images.unsplash.com/photo-1676907228185-6869277a9f8f?w=800&q=80"
            ],
            "stock": 18,
            "specifications": {
                "Place Settings": "14",
                "Programs": "6",
                "Noise Level": "44 dB",
                "Energy Rating": "5 Star",
                "Warranty": "2 Years"
            },
            "ratings_avg": 4.6,
            "ratings_count": 32,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bosch DWB96DM50I 90cm Wall Mounted Chimney",
            "description": "Powerful 900 m³/hr suction with German engineering, baffle filters for efficient oil absorption, and LED lighting for perfect illumination.",
            "price": 38999,
            "category": "chimneys",
            "images": [
                "https://images.unsplash.com/photo-1760067537565-1d4cbb8da0c3?w=800&q=80",
                "https://images.unsplash.com/photo-1760067537565-1d4cbb8da0c3?w=800&q=80"
            ],
            "stock": 25,
            "specifications": {
                "Suction": "900 m³/hr",
                "Size": "90 cm",
                "Filter Type": "Baffle",
                "Noise Level": "58 dB",
                "Warranty": "2 Years"
            },
            "ratings_avg": 4.4,
            "ratings_count": 19,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bosch Serie 4 Compact Built-in Microwave",
            "description": "Space-saving design with 21L capacity, AutoPilot programs, and QuickStart function. Perfect for reheating and defrosting.",
            "price": 34999,
            "category": "ovens",
            "images": [
                "https://images.unsplash.com/photo-1765766601532-90e9b96320c8?w=800&q=80",
                "https://images.unsplash.com/photo-1765766601532-90e9b96320c8?w=800&q=80"
            ],
            "stock": 30,
            "specifications": {
                "Capacity": "21 Litres",
                "Power": "900W",
                "Programs": "5 AutoPilot",
                "Control": "Touch",
                "Warranty": "2 Years"
            },
            "ratings_avg": 4.3,
            "ratings_count": 15,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bosch FlexInduction Gas Hob 4 Burners",
            "description": "Premium glass-on-steel design with brass burners, auto ignition, and flame failure safety device. Elegant and efficient.",
            "price": 29999,
            "category": "hobs",
            "images": [
                "https://images.unsplash.com/photo-1762810931790-40b25e10b3e7?w=800&q=80",
                "https://images.unsplash.com/photo-1762810931790-40b25e10b3e7?w=800&q=80"
            ],
            "stock": 28,
            "specifications": {
                "Burners": "4 Brass",
                "Material": "Glass on Steel",
                "Ignition": "Auto",
                "Safety": "Flame Failure",
                "Warranty": "2 Years"
            },
            "ratings_avg": 4.5,
            "ratings_count": 22,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bosch Serie 8 Pyrolytic Self-Cleaning Oven",
            "description": "Premium built-in oven with pyrolytic self-cleaning, 4D HotAir for perfect results on multiple levels, and meat probe for precise cooking.",
            "price": 125999,
            "category": "ovens",
            "images": [
                "https://images.unsplash.com/photo-1723259461381-59ab9fa18f5d?w=800&q=80",
                "https://images.unsplash.com/photo-1723259461381-59ab9fa18f5d?w=800&q=80"
            ],
            "stock": 10,
            "specifications": {
                "Capacity": "71 Litres",
                "Cleaning": "Pyrolytic",
                "Heating Modes": "13",
                "Features": "4D HotAir, Meat Probe",
                "Warranty": "2 Years"
            },
            "ratings_avg": 4.8,
            "ratings_count": 35,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bosch Full Touch Control Induction Hob",
            "description": "Revolutionary full-surface induction cooking with DirectSelect interface, PowerBoost for all zones, and ReStart function.",
            "price": 79999,
            "category": "cooktops",
            "images": [
                "https://images.unsplash.com/photo-1762810931790-40b25e10b3e7?w=800&q=80",
                "https://images.unsplash.com/photo-1762810931790-40b25e10b3e7?w=800&q=80"
            ],
            "stock": 12,
            "specifications": {
                "Type": "Full Surface",
                "Zones": "Flexible",
                "Control": "DirectSelect",
                "Features": "PowerBoost, ReStart",
                "Warranty": "2 Years"
            },
            "ratings_avg": 4.9,
            "ratings_count": 41,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Clear existing products
    await db.products.delete_many({})
    
    # Insert products
    await db.products.insert_many(products)
    print(f"✓ {len(products)} products added")
    
    print("\n=== Database Seeded Successfully ===")
    print("Admin Login: admin@bosch.com / admin123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
