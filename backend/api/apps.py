from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """Test MongoDB connection on startup (in background thread)."""
        import threading

        def check_mongo():
            try:
                # Re-use the singleton from mongodb.py so we don't open a second connection
                from api.mongodb import mongo_client
                db = mongo_client.get_database()
                cols = db.list_collection_names()

                print("\n" + "=" * 55)
                print("  [OK] MongoDB Connected Successfully!")
                print(f"  Database     : {db.name}")
                print(f"  Collections  : {', '.join(cols) if cols else '(empty)'}")
                print("=" * 55 + "\n")
                
                # Seed gearsator coupon on startup
                try:
                    db['coupons'].update_one(
                        {'code': 'gearsator'}, 
                        {'$set': {
                            'code': 'gearsator',
                            'discount_type': 'percentage',
                            'discount_value': 10,
                            'is_active': True,
                            'description': 'Special discount code for Gearsator'
                        }}, 
                        upsert=True
                    )
                    print("  [OK] Successfully configured 'gearsator' coupon")
                except Exception as coupon_err:
                    print(f"  [ERROR] Failed to setup coupon: {coupon_err}")

            except Exception as e:
                short_err = str(e)[:150]
                print("\n" + "=" * 55)
                print("  [ERROR] MongoDB Connection FAILED!")
                print(f"  Error  : {short_err}")
                print("  Fix    : Check MONGODB_URI in backend/.env")
                print("           and verify your internet connection.")
                print("=" * 55 + "\n")

        t = threading.Thread(target=check_mongo, name="check_mongo", daemon=True)
        t.start()
