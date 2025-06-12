# videochat_app/views.py

from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib import messages
from django.core.exceptions import ObjectDoesNotExist
import json
import uuid
from django.views.decorators.http import require_http_methods
from .ai_handler import AIHandler

def lobby(request):
    return render(request, 'videochat_app/lobby.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'redirect_url': '/dashboard/'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid username or password'
            }, status=400)
    
    return render(request, 'videochat_app/login.html')

def signup_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        
        errors = {}
        
        if User.objects.filter(username=username).exists():
            errors['username'] = 'Username already exists'
        
        if User.objects.filter(email=email).exists():
            errors['email'] = 'Email already exists'
        
        if password != confirm_password:
            errors['confirm_password'] = 'Passwords do not match'
        
        if not errors:
            user = User.objects.create_user(username=username, email=email, password=password)
            return JsonResponse({
                'success': True,
                'message': 'Account created successfully! Please sign in.',
                'redirect_url': '/login/'
            })
        else:
            return JsonResponse({
                'success': False,
                'errors': errors
            }, status=400)
    
    return render(request, 'videochat_app/signup.html')

@login_required
def dashboard_view(request):
    # Get user's friends and recent meetings
    user = request.user
    # You can add friend and meeting models later
    return render(request, 'videochat_app/dashboard.html', {
        'user': user
    })

def meeting(request, room_id):
    return render(request, 'videochat_app/meeting.html', {'room_id': room_id})

@login_required
def create_meeting(request):
    if request.method == 'POST':
        meeting_id = str(uuid.uuid4())
        return JsonResponse({
            'success': True,
            'meeting_id': meeting_id,
            'redirect_url': f'/meeting/{meeting_id}/'
        })
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    }, status=405)

@login_required
def invite_to_meeting(request, meeting_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({
                    'success': False,
                    'error': 'Email is required'
                }, status=400)
            
            # Here you can add logic to send invitation email
            return JsonResponse({
                'success': True,
                'message': f'Invitation sent to {email}'
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid request data'
            }, status=400)
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    }, status=405)

@login_required
def delete_account(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            password = data.get('password')
            
            if not password:
                return JsonResponse({
                    'success': False,
                    'error': 'Password is required'
                }, status=400)
            
            # Verify password before deletion
            if not request.user.check_password(password):
                return JsonResponse({
                    'success': False,
                    'error': 'Incorrect password'
                }, status=400)
            
            # Delete the user
            request.user.delete()
            logout(request)
            
            return JsonResponse({
                'success': True,
                'message': 'Account deleted successfully'
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid request data'
            }, status=400)
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    }, status=405)

@login_required
def delete_friend(request, friend_id):
    if request.method == 'POST':
        try:
            if not friend_id:
                return JsonResponse({
                    'success': False,
                    'error': 'Friend ID is required'
                }, status=400)
            
            # Here you would typically delete the friendship from your database
            # For now, we'll just return a success message
            return JsonResponse({
                'success': True,
                'message': 'Friend removed successfully'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    }, status=405)

@login_required
def logout_view(request):
    logout(request)
    return redirect('login')

@csrf_exempt
def process_ai_command(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            message = data.get('message')
            
            if not message:
                return JsonResponse({
                    'success': False,
                    'error': 'Message is required'
                }, status=400)
            
            # Strip "! " prefix if present
            if message.startswith('! '):
                message = message[2:]
            
            # Use Gemini AI for real response
            ai = AIHandler()
            response = ai.process_message(message)
            
            return JsonResponse({
                'success': True,
                'response': response
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid request data'
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    }, status=405)

@login_required
def start_call(request, friend_id):
    if request.method == 'POST':
        try:
            # Create a new meeting for the call
            meeting_id = str(uuid.uuid4())
            
            # Here you would typically:
            # 1. Create a meeting record in your database
            # 2. Send a notification to the friend
            # 3. Set up the WebSocket connection
            
            return JsonResponse({
                'success': True,
                'meeting_id': meeting_id
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    }, status=405)

@login_required
def join_meeting(request, meeting_id):
    if request.method == 'POST':
        try:
            # Here you would typically:
            # 1. Verify the meeting exists
            # 2. Check if the user is allowed to join
            # 3. Set up the WebSocket connection
            
            return JsonResponse({
                'success': True,
                'meeting_id': meeting_id
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    }, status=405)