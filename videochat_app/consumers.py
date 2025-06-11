# videochat_app/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name # Keeps 'chat_lobby' for group name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        print(f"WebSocket connected: {self.channel_name} to {self.room_group_name}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket disconnected: {self.channel_name} from {self.room_group_name} with code {close_code}")

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        # Send message to room group
        if message_type == 'chat_message':
            message = text_data_json['message']
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )
        elif message_type in ['offer', 'answer', 'candidate', 'hangup']:
            # For WebRTC signaling, just forward the message to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': message_type,
                    **text_data_json # Forward all fields
                }
            )
        else:
            print(f"Unknown message type received: {message_type}")


    # Receive message from room group (chat message)
    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    # Receive WebRTC signaling messages from room group
    async def offer(self, event):
        await self.send(text_data=json.dumps(event))

    async def answer(self, event):
        await self.send(text_data=json.dumps(event))

    async def candidate(self, event):
        await self.send(text_data=json.dumps(event))

    async def hangup(self, event):
        await self.send(text_data=json.dumps(event))