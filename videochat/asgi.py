# videochat/asgi.py

import sys
import os

# Add parent directory to sys.path to fix import issues
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'videochat.settings') # <--- IMPORTANT: 'videochat.settings'

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

# Import your app's routing
import videochat_app.routing # <--- IMPORTANT: 'videochat_app.routing'

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(
                URLRouter(
                    videochat_app.routing.websocket_urlpatterns # <--- IMPORTANT: 'videochat_app.routing'
                )
            )
        ),
    }
)
