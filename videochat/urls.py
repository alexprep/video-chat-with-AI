# videochat/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('videochat_app/', include('videochat_app.urls')), # Updated app URL
]