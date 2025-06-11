# videochat_app/routing.py

from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    # <--- IMPORTANT: This WebSocket path uses 'ws/chat/lobby/'
    # Your JavaScript will connect to ws://127.0.0.1:8000/ws/chat/lobby/
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
]