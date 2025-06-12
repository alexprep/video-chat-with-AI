# Video Chat App Project History

## Project Overview
- Django-based open-access video chat app with Google Meet-like UI and Gemini AI chat integration.

---

## Major Features & Changes

1. **Authentication & Access:**
   - Removed all login, signup, dashboard, and friend management features.
   - Made the app open-access: anyone can join a meeting via link, no authentication required.
   - Deleted all related templates and code.

2. **Lobby & Meeting Room:**
   - Lobby generates unique meeting links (Omegle-style).
   - Meeting page supports video calls, screen sharing, and chat.

3. **UI/UX Overhaul:**
   - Modern, responsive design inspired by Google Meet.
   - Dynamic layouts: large centered video when alone, side-by-side when two users, floating tiles during screen share, chat overlay.
   - Fully responsive for mobile.

4. **WebRTC & Signaling:**
   - Peer-to-peer video/audio via WebRTC.
   - WebSocket signaling using Django Channels.
   - Fixed issues with video not showing for both users by auto-starting offer/answer exchange and matching element IDs.

5. **AI Integration:**
   - Chat supports AI triggers: `! ` for instant AI, "Hey Jarvis" for confirmation flow during screen share.
   - Integrated Gemini API for real AI responses.
   - Fixed backend to use only Gemini (text) unless Google Cloud service account is provided.

6. **.env & API Key Management:**
   - Added `.env` loading in Django settings for secure API key management.
   - Ensured `GOOGLE_API_KEY` is loaded for Gemini.
   - Documented need for service account if using Vision/Language APIs.

---

## Errors Encountered & Solutions

- **404 on /login/**: Caused by leftover @login_required; fixed by removing all authentication checks.
- **WebRTC not connecting:**
  - Cause: No auto-offer/answer, mismatched element IDs.
  - Fix: Updated JS to auto-connect and match template IDs.
- **AI chat only showed placeholder:**
  - Cause: Frontend was not calling backend; fixed by updating JS to use fetch to `/api/ai/process/`.
- **500 error (Google auth):**
  - Cause: Vision/Language clients require service account credentials.
  - Fix: Removed those clients for Gemini-only use, documented how to add them if needed.
- **404 on /api/ai/process/**: Route missing; fixed by adding to `urls.py`.

---

## Components Used

- Django 5.x
- Django Channels (WebSocket signaling)
- WebRTC (video/audio)
- Google Gemini API (AI chat)
- HTML/CSS/JS (custom, Google Meet-inspired)
- python-dotenv (for .env loading)

---

## Main Issues & Lessons Learned

- Removing authentication requires careful cleanup of all decorators and routes.
- WebRTC signaling must be robust and auto-connect for seamless UX.
- AI integration is easiest with Gemini API key, but Vision/Language require extra Google Cloud setup.
- Always match frontend JS element IDs to template.
- Use .env for all secrets and document requirements for contributors.

---

## Approaches

- Iterative UI/UX improvement based on user feedback and screenshots.
- Debugged by reading error messages, checking browser/server logs, and updating code accordingly.
- Kept code modular and open for future AI/vision expansion.
