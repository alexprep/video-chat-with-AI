# Django Video Chat App with Gemini AI

A modern, open-access video chat app (Google Meet style) with real-time video, screen sharing, chat, and Gemini AI integration. No authentication required—anyone can join via link.

---

## Features
- **Open-access video meetings** (no login/signup)
- **Unique meeting links**
- **Google Meet-inspired UI/UX**
- **WebRTC video/audio** (peer-to-peer)
- **Screen sharing**
- **Real-time chat** (with AI triggers)
- **Gemini AI chat integration** ( "! " )
- **Responsive design** (desktop & mobile)

---

## Requirements
- Python 3.10+
- Node.js (for static build, optional)
- Redis (for Django Channels)
- Google Gemini API key (for AI chat)
- (Optional) Google Cloud service account JSON (for Vision/Language features)

---

## Setup Instructions

1. **Clone the repo & create virtual environment:**
   ```sh
   git clone <repo-url>
   cd web_chat_app
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # Or: source venv/bin/activate  # On Mac/Linux
   pip install -r requirements.txt
   ```

2. **Set up .env:**
   - Create a `.env` file in the project root:
     ```
     GOOGLE_API_KEY=your-gemini-api-key-here
     ```
   - (Optional) For Vision/Language: add `GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json`

3. **Start Redis:**
   - Make sure Redis is running on `localhost:6379`.

4. **Run Django server:**
   ```sh
   python manage.py migrate
   python manage.py runserver
   ```

5. **Open the app:**
   - Go to [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
   - Create or share a meeting link from the lobby.

---

## How to Use
- **Join a meeting:** Share/click the meeting link.
- **Video/Audio:** Allow camera/mic access.
- **Screen Share:** Click "Share Screen".
- **Chat:** Use the chat panel.
- **AI Chat:**
  - Type `! your question` for instant AI.
  - Say "Hey Jarvis ..." during screen share for confirmation flow.

---

## Troubleshooting
- **404 on /login/**: Remove all authentication decorators/routes.
- **404 on /api/ai/process/**: Make sure the route is in `urls.py`.
- **500 error (Google auth):** Only use Gemini unless you have a service account for Vision/Language.
- **AI not responding:** Check `.env` and API key, restart server.
- **WebRTC not connecting:** Use two browsers/devices, check console for errors.

---

## Contributing
- Fork, branch, and PR as usual.
- Use `.env` for all secrets.
- See `PROJECT_HISTORY.txt` for full change log and lessons learned.

---

## License
MIT (or your choice) 