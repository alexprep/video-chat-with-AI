import os
from google.cloud import vision
from google.cloud import language_v1
import google.generativeai as genai
from PIL import Image
import io
import base64

class AIHandler:
    def __init__(self):
        # Initialize Google Cloud clients
        self.vision_client = vision.ImageAnnotatorClient()
        self.language_client = language_v1.LanguageServiceClient()
        
        # Initialize Gemini
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        self.model = genai.GenerativeModel('gemini-pro-vision')
        
    def process_message(self, message):
        """Process a regular chat message and generate a response"""
        try:
            # Use Gemini for chat responses
            response = self.model.generate_content(message)
            return response.text
        except Exception as e:
            print(f"Error processing message: {e}")
            return "I apologize, but I'm having trouble processing your request right now."

    def analyze_screen_content(self, image_data, query):
        """Analyze screen content using Vision AI and Gemini"""
        try:
            # Convert base64 image to bytes
            image_bytes = base64.b64decode(image_data)
            
            # Create image object
            image = Image.open(io.BytesIO(image_bytes))
            
            # Use Gemini Vision for analysis
            response = self.model.generate_content([query, image])
            
            return response.text
        except Exception as e:
            print(f"Error analyzing screen content: {e}")
            return "I apologize, but I'm having trouble analyzing the screen content right now."

    def extract_text_from_image(self, image_data):
        """Extract text from an image using Vision AI"""
        try:
            # Convert base64 image to bytes
            image_bytes = base64.b64decode(image_data)
            
            # Create Vision API image object
            image = vision.Image(content=image_bytes)
            
            # Perform text detection
            response = self.vision_client.text_detection(image=image)
            texts = response.text_annotations
            
            if texts:
                return texts[0].description
            return ""
        except Exception as e:
            print(f"Error extracting text: {e}")
            return ""

    def analyze_sentiment(self, text):
        """Analyze sentiment of text using Natural Language API"""
        try:
            document = language_v1.Document(
                content=text,
                type_=language_v1.Document.Type.PLAIN_TEXT
            )
            
            sentiment = self.language_client.analyze_sentiment(
                request={"document": document}
            ).document_sentiment
            
            return {
                'score': sentiment.score,
                'magnitude': sentiment.magnitude
            }
        except Exception as e:
            print(f"Error analyzing sentiment: {e}")
            return None 