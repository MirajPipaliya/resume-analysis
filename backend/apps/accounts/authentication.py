from rest_framework.authentication import BaseAuthentication
from django.contrib.auth import get_user_model
from config.mongodb import users_collection

class DemoAuthentication(BaseAuthentication):
    def authenticate(self, request):
        User = get_user_model()
        demo_username = 'demo_admin'
        demo_email = 'demo_admin@example.com'
        
        user, created = User.objects.get_or_create(
            username=demo_username,
            defaults={
                'email': demo_email,
                'role': 'Admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            user.set_password('demo_password')
            user.save()
            
        # Ensure user is synced to Mongo (safely)
        try:
            users_collection.update_one(
                {'id': user.id},
                {'$set': {
                    'username': user.username,
                    'email': user.email,
                    'full_name': 'Demo Admin',
                    'role': 'Admin'
                }},
                upsert=True
            )
        except Exception as e:
            print(f"Failed to sync user to mongo: {e}")
            
        return (user, None)
