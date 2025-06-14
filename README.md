# Django Video Chat App with Gemini AI

A modern, open-access video chat app (Google Meet style) with real-time video, screen sharing, chat, and Gemini AI integration. No authentication required—anyone can join via link.

---

## Core Features

### Video Conferencing
- One-on-One and Group Video Chat
- Dynamic video grid layout
- Automatic quality adjustment
- Camera/microphone device selection

### Chat System
- Real-time messaging via WebSocket
- Message persistence during session
- Typing indicators and timestamps
- AI Assistant with `!` command prefix

### Screen Sharing
- Full screen and application window sharing
- Picture-in-picture mode during share
- Quality selection for bandwidth management
- Automatic layout adjustments

### AI Integration
- Instant AI responses with `!` prefix
- Context-aware conversations
- Real-time processing
- Support for various query types

---

## Technical Requirements
- Python 3.10+
- PostgreSQL 13+
- Redis 6+
- Node.js 18+ (optional, for frontend development)
- Google Gemini API key

---

## Setup Instructions

1. **Clone & Setup Environment:**
   ```bash
   git clone <repo-url>
   cd videochat
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

2. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Update with your settings:
     ```env
     DJANGO_SECRET_KEY=your-secret-key
     GOOGLE_API_KEY=your-gemini-api-key
     DB_NAME=videochat
     DB_USER=postgres
     DB_PASSWORD=your-password
     ```

3. **Database Setup:**
   ```bash
   # Create PostgreSQL database
   createdb videochat
   
   # Run migrations
   python manage.py migrate
   ```

4. **Redis Setup:**
   - Install Redis server
   - Ensure it's running on default port (6379)
   - Test connection: `redis-cli ping`

5. **Static Files:**
   ```bash
   python manage.py collectstatic
   ```

6. **Run Development Server:**
   ```bash
   python manage.py runserver
   ```

---

## Usage Guide

### Starting a Meeting
1. Visit the homepage
2. Click "Start Meeting" or enter a meeting ID
3. Allow camera/microphone permissions
4. Share the meeting link with participants

### During the Meeting

**Video Controls:**
- 🎥 Toggle camera
- 🎤 Toggle microphone
- 📺 Share screen
- ❌ Leave meeting

**Chat Features:**
- Regular text messages
- AI assistance: prefix with `!`
- Example: `! What's the weather today?`

**Screen Sharing:**
- Choose sharing mode (full screen/window)
- Select quality settings
- Use picture-in-picture view

---

## Development Notes

### Architecture
- Django + Channels for WebSocket
- WebRTC for peer-to-peer video
- Redis for message queuing
- PostgreSQL for data persistence

### Key Components
- `consumers.py`: WebSocket handlers
- `views.py`: HTTP endpoints
- `meeting.js`: Frontend logic
- `routing.py`: WebSocket routing

### Testing
```bash
# Run tests
python manage.py test

# Coverage report
coverage run manage.py test
coverage report
```

---

## Production Deployment

1. **Security Settings:**
   - Set `DEBUG=False`
   - Configure `ALLOWED_HOSTS`
   - Enable HTTPS settings
   - Set secure cookie flags

2. **Server Setup:**
   - Configure Nginx/Apache
   - Set up SSL certificates
   - Configure static file serving

3. **Process Management:**
   ```bash
   # Using Daphne
   daphne -b 0.0.0.0 -p 8000 videochat.asgi:application
   ```

---

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed:**
   - Check Redis connection
   - Verify ASGI configuration
   - Check browser console for errors

2. **Video Not Showing:**
   - Allow camera permissions
   - Check WebRTC configuration
   - Verify STUN/TURN settings

3. **Chat Not Working:**
   - Check WebSocket connection
   - Verify Redis service
   - Check browser console

---

## Future Roadmap

1. **Q2 2024:**
   - Mobile app development
   - Enhanced group features
   - Advanced AI capabilities

2. **Q3 2024:**
   - Custom backgrounds
   - Meeting recording
   - Real-time translation

3. **Q4 2024:**
   - End-to-end encryption
   - Breakout rooms
   - Advanced moderation

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT License - See LICENSE file for details