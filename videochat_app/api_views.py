from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from django.conf import settings
import json
import asyncio
from .ai_chat import AIChatHandler

# Initialize AI chat handler
ai_handler = AIChatHandler()

@csrf_protect
@require_http_methods(["POST"])
async def ai_chat(request):
    """Handle AI chat requests.

    Args:
        request: The HTTP request object containing the message in its body.

    Returns:
        JsonResponse containing the AI's response or error message.
    """
    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()

        if not message:
            return JsonResponse({
                'success': False,
                'error': 'Message cannot be empty'
            }, status=400)

        # Process the message using the AI handler
        response = await ai_handler.process_message(message)

        if response['success']:
            return JsonResponse({
                'success': True,
                'response': response['response'],
                'message_type': response['message_type']
            })
        else:
            return JsonResponse({
                'success': False,
                'error': response['error']
            }, status=500)

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_protect
@require_http_methods(["POST"])
async def ai_screen_analysis(request):
    """Handle AI screen share analysis requests.

    Args:
        request: The HTTP request object containing the screenshot data.

    Returns:
        JsonResponse containing the analysis results or error message.
    """
    try:
        data = json.loads(request.body)
        screenshot_data = data.get('screenshot')

        # Process the screenshot using the AI handler
        response = await ai_handler.process_screen_share(screenshot_data)

        if response['success']:
            return JsonResponse({
                'success': True,
                'response': response['response'],
                'message_type': response['message_type']
            })
        else:
            return JsonResponse({
                'success': False,
                'error': response['error']
            }, status=500)

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_protect
@require_http_methods(["POST"])
def reset_ai_chat(request):
    """Reset the AI chat session.

    Args:
        request: The HTTP request object.

    Returns:
        JsonResponse indicating success or failure.
    """
    try:
        ai_handler.reset_chat()
        return JsonResponse({
            'success': True,
            'message': 'Chat session reset successfully'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)