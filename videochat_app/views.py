# videochat_app/views.py

from django.shortcuts import render

def lobby(request):
    return render(request, 'videochat_app/lobby.html') # Updated template path