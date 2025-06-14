# videochat_app/urls.py

from django.urls import path
from . import views, api_views

app_name = 'videochat_app'  # Add namespace

urlpatterns = [
    path('', views.lobby, name='lobby'),  # Root URL now serves the lobby
    path('meeting/<str:room_id>/', views.meeting, name='meeting'),
    
    # AI Chat API endpoints
    path('api/ai/chat/', api_views.ai_chat, name='ai_chat'),
    path('api/ai/screen-analysis/', api_views.ai_screen_analysis, name='ai_screen_analysis'),
    path('api/ai/reset/', api_views.reset_ai_chat, name='reset_ai_chat'),
]