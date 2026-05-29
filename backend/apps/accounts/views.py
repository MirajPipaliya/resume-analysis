from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from config.mongodb import users_collection

class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        # Check if username is actually an email
        if '@' in username:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user_obj = User.objects.get(email=username)
                username = user_obj.username
            except User.DoesNotExist:
                pass
                
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            # Ensure user is synced to Mongo (just as an example of keeping Mongo updated)
            users_collection.update_one(
                {'id': user.id},
                {'$set': {'username': user.username, 'role': user.role}},
                upsert=True
            )
            return Response({
                'success': True,
                'data': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'role': user.role
                    }
                },
                'message': 'Login successful',
                'errors': []
            })
        return Response({
            'success': False,
            'data': None,
            'message': 'Invalid credentials',
            'errors': ['Invalid username or password']
        }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'success': True, 'data': None, 'message': 'Logout successful', 'errors': []})
        except Exception as e:
            return Response({'success': False, 'data': None, 'message': str(e), 'errors': [str(e)]}, status=status.HTTP_400_BAD_REQUEST)

import random
import datetime
from django.core.mail import send_mail
from django.conf import settings
from config.mongodb import otps_collection, users_collection
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterStartView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        full_name = request.data.get('full_name')

        if not all([email, username, password, full_name]):
            return Response({'success': False, 'message': 'All fields are required'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'success': False, 'message': 'Username already taken'}, status=400)
        
        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

        # Store in Mongo
        otps_collection.update_one(
            {'email': email},
            {'$set': {
                'otp': otp_code, 
                'expires_at': expires_at,
                'registration_data': {
                    'username': username,
                    'password': password,
                    'full_name': full_name
                }
            }},
            upsert=True
        )

        # Send Email
        try:
            send_mail(
                subject='Byte Solutions - Verify your account',
                message=f'Hello {full_name},\n\nYour verification code is: {otp_code}\n\nThis code expires in 10 minutes.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({'success': False, 'message': f'Failed to send email: {str(e)}'}, status=500)

        return Response({'success': True, 'message': 'OTP sent to email', 'data': {'email': email}})

class VerifyOTPView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({'success': False, 'message': 'Email and OTP are required'}, status=400)

        record = otps_collection.find_one({'email': email})
        if not record:
            return Response({'success': False, 'message': 'No pending registration found for this email'}, status=400)
        
        print(f"DEBUG OTP - DB OTP: {repr(record['otp'])} ({type(record['otp'])}) | PROVIDED OTP: {repr(otp)} ({type(otp)})")
        
        if str(record['otp']) != str(otp):
            return Response({'success': False, 'message': 'Invalid OTP'}, status=400)
        
        if datetime.datetime.utcnow() > record['expires_at']:
            return Response({'success': False, 'message': 'OTP has expired'}, status=400)
        
        reg_data = record['registration_data']
        
        try:
            user = User.objects.create_user(
                username=reg_data['username'],
                email=email,
                password=reg_data['password']
            )
            
            # Sync to Mongo
            users_collection.update_one(
                {'id': user.id},
                {'$set': {
                    'username': user.username, 
                    'email': email,
                    'full_name': reg_data['full_name'],
                    'role': 'candidate'
                }},
                upsert=True
            )

            # Delete OTP record
            otps_collection.delete_one({'email': email})

            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'Account created successfully',
                'data': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': email,
                        'role': 'candidate'
                    }
                }
            })
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=400)


from rest_framework.permissions import BasePermission
from bson.objectid import ObjectId

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'Admin' or request.user.is_superuser))

class AdminUserListView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users_cursor = users_collection.find({}, {'_id': 0})
        users_list = list(users_cursor)
        return Response({'success': True, 'data': users_list})

class AdminUserDetailView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def put(self, request, user_id):
        # Update user role
        new_role = request.data.get('role')
        if not new_role:
            return Response({'success': False, 'message': 'Role is required'}, status=400)
            
        # Update in Mongo
        result = users_collection.update_one(
            {'id': int(user_id)},
            {'$set': {'role': new_role}}
        )
        
        # Update in Django DB
        User = get_user_model()
        try:
            user = User.objects.get(id=int(user_id))
            user.role = new_role
            user.save()
        except User.DoesNotExist:
            pass

        return Response({'success': True, 'message': 'User role updated'})

    def delete(self, request, user_id):
        # Delete from Mongo
        users_collection.delete_one({'id': int(user_id)})
        
        # Delete from Django DB
        User = get_user_model()
        try:
            User.objects.filter(id=int(user_id)).delete()
        except Exception:
            pass
            
        return Response({'success': True, 'message': 'User deleted'})
