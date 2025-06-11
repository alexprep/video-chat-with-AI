# videochat_app/views.py

from django.shortcuts import render

def lobby(request):
    # <--- IMPORTANT: This points to 'videochat_app/lobby.html'
    return render(request, 'videochat_app/lobby.html')