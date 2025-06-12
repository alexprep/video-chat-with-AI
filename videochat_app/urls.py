# videochat_app/urls.py

from django.urls import path

from . import views

app_name = 'videochat_app'  # Add namespace

urlpatterns = [
    path('', views.lobby, name='lobby'),  # Root URL now serves the lobby
    path('meeting/<str:room_id>/', views.meeting, name='meeting'),
    path('api/ai/process/', views.process_ai_command, name='process_ai_command'),
]