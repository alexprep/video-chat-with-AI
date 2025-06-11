# videochat/asgi.py

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

# Point to your new project's settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'videochat.settings')

# Import your app's routing
import videochat_app.routing

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(
                URLRouter(
                    videochat_app.routing.websocket_urlpatterns # Point to your app's routing
                )
            )
        ),
    }
)