# videochat/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # <--- IMPORTANT: This URL path will be like http://127.0.0.1:8000/videochat_app/
    path('videochat_app/', include('videochat_app.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
