import os
import google.generativeai as genai
from django.conf import settings
from typing import Optional, Dict, Any

class AIChatHandler:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.chat = self.model.start_chat(history=[])
        self.setup_model_config()

    def setup_model_config(self):
        """Configure the model with appropriate settings."""
        generation_config = {
            'temperature': 0.7,
            'top_p': 0.8,
            'top_k': 40,
            'max_output_tokens': 1024,
        }
        safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
        ]
        self.model.generation_config = generation_config

    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process a message and return the AI response.

        Args:
            message: The user's message to process.

        Returns:
            Dict containing the response and any additional data.
        """
        try:
            # Add context about being a video chat assistant
            context = (
                "You are an AI assistant in a video chat application. "
                "You can help with meeting-related questions and general queries. "
                "Keep responses concise and helpful."
            )
            
            # Combine context with user message
            prompt = f"{context}\n\nUser: {message}\nAssistant:"
            
            response = await self.chat.send_message_async(prompt)
            
            return {
                'success': True,
                'response': response.text,
                'message_type': 'text'
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message_type': 'error'
            }

    async def process_screen_share(self, screenshot_data: Optional[str] = None) -> Dict[str, Any]:
        """Process screen share data and provide analysis or suggestions.

        Args:
            screenshot_data: Optional base64 encoded screenshot data.

        Returns:
            Dict containing the analysis results.
        """
        try:
            if not screenshot_data:
                return {
                    'success': False,
                    'error': 'No screenshot data provided',
                    'message_type': 'error'
                }

            # Use Gemini Pro Vision when screenshot analysis is implemented
            # For now, return a placeholder response
            return {
                'success': True,
                'response': 'Screen sharing is active. I can assist you with analyzing the shared content once image processing is implemented.',
                'message_type': 'text'
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message_type': 'error'
            }

    def reset_chat(self) -> None:
        """Reset the chat history and start a new conversation."""
        self.chat = self.model.start_chat(history=[])