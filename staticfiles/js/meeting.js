const meetingContainer = document.querySelector('.meeting-container');
const meetingId = meetingContainer.dataset.roomId;
console.log('Meeting ID:', meetingId);

const chatSocket = new WebSocket(
    (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws/chat/' + meetingId + '/'
);

chatSocket.onopen = function(e) {
    console.log('WebSocket connection established');
};

chatSocket.onerror = function(e) {
    console.error('WebSocket error:', e);
};

chatSocket.onclose = function(e) {
    console.log('WebSocket connection closed:', e.code, e.reason);
};

// DOM Elements
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const muteBtn = document.getElementById('toggleMic');
const videoBtn = document.getElementById('toggleVideo');
const screenShareBtn = document.getElementById('toggleScreen');
const hangupBtn = document.getElementById('leaveCall');
const chatToggleBtn = document.getElementById('toggleChat');
const chatCloseBtn = document.getElementById('closeChat');
const container = document.querySelector('.meeting-container');
const chatLog = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSubmit = document.getElementById('sendMessage');
const screenShareModal = document.getElementById('screenShareModal');
// AI message styling
const style = document.createElement('style');
style.textContent = `
    .ai-message {
        background-color: #e3f2fd;
        border-radius: 10px;
        padding: 8px 12px;
        margin: 4px 0;
        max-width: 80%;
        align-self: flex-start;
    }
    .user-message {
        background-color: #e8eaf6;
        border-radius: 10px;
        padding: 8px 12px;
        margin: 4px 0;
        max-width: 80%;
        align-self: flex-end;
    }
`;
document.head.appendChild(style);

// Add a simple connected indicator
document.body.insertAdjacentHTML('beforeend', '<div id="connectionStatus" style="position:fixed;top:10px;right:20px;z-index:1000;background:#23272b;color:#fff;padding:8px 18px;border-radius:8px;font-size:1.1rem;box-shadow:0 2px 8px rgba(0,0,0,0.12);">Connecting...</div>');
const connectionStatus = document.getElementById('connectionStatus');

// WebRTC Configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

let localStream;
let peerConnection;
let isMuted = false;
let isVideoOff = false;
let isScreenSharing = false;

let isOfferer = false;

// Initialize WebRTC and signaling
async function initializeWebRTC() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        localVideo.srcObject = localStream;
        createPeerConnection();
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        connectionStatus.textContent = 'Waiting for guest...';
    } catch (error) {
        connectionStatus.textContent = 'Camera/mic error';
        console.error('Error accessing media devices:', error);
    }
}

function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            chatSocket.send(JSON.stringify({
                type: 'candidate',
                candidate: event.candidate
            }));
        }
    };
    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
        connectionStatus.textContent = 'Connected!';
    };
    peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === 'disconnected') {
            connectionStatus.textContent = 'Disconnected';
        }
    };
}

// --- Signaling logic ---
let hasReceivedOffer = false;
// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing WebRTC...');
    try {
        await initializeWebRTC();
        console.log('WebRTC initialized successfully');
    } catch (error) {
        console.error('Error initializing WebRTC:', error);
        connectionStatus.textContent = 'Failed to initialize';
    }
});

chatSocket.onopen = async function() {
    console.log('WebSocket connection opened');
    // Wait a moment to ensure both users are connected
    setTimeout(() => {
        // If not already in a call, the first user to join becomes the offerer
        if (!hasReceivedOffer) {
            isOfferer = true;
            createAndSendOffer();
            console.log('Creating and sending offer as first user');
        }
    }, 1000);
};

chatSocket.onmessage = async function(e) {
    const data = JSON.parse(e.data);
    if (data.type === 'offer') {
        hasReceivedOffer = true;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        chatSocket.send(JSON.stringify({
            type: 'answer',
            answer: answer
        }));
        connectionStatus.textContent = 'Connected!';
    } else if (data.type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        connectionStatus.textContent = 'Connected!';
    } else if (data.type === 'candidate') {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else if (data.type === 'chat_message') {
        handleChatMessage(data);
    }
};

async function createAndSendOffer() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    chatSocket.send(JSON.stringify({
        type: 'offer',
        offer: offer
    }));
}

// Chat Functions
function handleChatMessage(data) {
    console.log('Handling incoming message:', data);
    try {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = data.message;
        chatLog.appendChild(messageDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
        console.log('Message displayed in chat');
    } catch (error) {
        console.error('Error handling chat message:', error);
    }
}

function sendChatMessage() {
    console.log('Sending chat message');
    try {
        const message = chatInput.value;
        if (message) {
            console.log('Sending message:', message);
            chatSocket.send(JSON.stringify({
                type: 'chat_message',
                message: message
            }));
            chatInput.value = '';
            console.log('Message sent successfully');
        } else {
            console.log('Empty message, not sending');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

chatSubmit.onclick = sendChatMessage;

chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
    }
});

// Chat panel toggle
let chatOpen = false;
chatToggleBtn.onclick = function() {
    console.log('Chat toggle button clicked');
    try {
        chatOpen = !chatOpen;
        if (chatOpen) {
            container.classList.add('chat-open');
            document.querySelector('.chat-panel').classList.add('open');
            console.log('Chat panel opened');
        } else {
            container.classList.remove('chat-open');
            document.querySelector('.chat-panel').classList.remove('open');
            console.log('Chat panel closed');
        }
    } catch (error) {
        console.error('Error toggling chat panel:', error);
    }
};

chatCloseBtn.onclick = function() {
    chatOpen = false;
    container.classList.remove('chat-open');
    document.querySelector('.chat-panel').classList.remove('open');
};

chatInput.onkeypress = function(e) {
    if (e.key === 'Enter') {
        chatSubmit.click();
    }
};



// Screen Sharing Functions
screenShareBtn.onclick = function() {
    console.log('Screen share button clicked');
    try {
        screenShareModal.style.display = 'block';
        console.log('Screen share modal opened');
    } catch (error) {
        console.error('Error opening screen share modal:', error);
    }
};

document.getElementById('shareScreen').onclick = async function() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        });
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
        sender.replaceTrack(videoTrack);
        isScreenSharing = true;
        screenShareModal.style.display = 'none';
    } catch (error) {
        console.error('Error sharing screen:', error);
    }
};

document.getElementById('shareWindow').onclick = async function() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        });
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
        sender.replaceTrack(videoTrack);
        isScreenSharing = true;
        screenShareModal.style.display = 'none';
        processAICommand('analyze_screen');
    } catch (error) {
        console.error('Error sharing screen with AI:', error);
    }
};

document.getElementById('cancelShare').onclick = function() {
    screenShareModal.style.display = 'none';
};

// Control Functions
muteBtn.onclick = function() {
    console.log('Mute button clicked');
    try {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        isMuted = !isMuted;
        muteBtn.classList.toggle('active', isMuted);
        console.log('Audio track enabled:', audioTrack.enabled);
    } catch (error) {
        console.error('Error toggling audio:', error);
    }
};

videoBtn.onclick = function() {
    console.log('Video button clicked');
    try {
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        isVideoOff = !isVideoOff;
        videoBtn.classList.toggle('active', isVideoOff);
        console.log('Video track enabled:', videoTrack.enabled);
    } catch (error) {
        console.error('Error toggling video:', error);
    }
};

hangupBtn.onclick = function() {
    console.log('Hangup button clicked');
    try {
        handleDisconnection();
        console.log('Disconnection handled');
    } catch (error) {
        console.error('Error handling disconnection:', error);
    }
};

function handleDisconnection() {
    if (peerConnection) {
        peerConnection.close();
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    window.location.href = '/dashboard/';
}

const videosContainer = document.querySelector('.video-grid');
const floatingVideosContainer = document.querySelector('.floating-videos');

// Update layout based on user count, screen sharing, and chat state
function updateLayout() {
    const remoteVideoVisible = remoteVideo.srcObject !== null;
    const localVideoVisible = localVideo.srcObject !== null;

    // Clear floating videos container
    floatingVideosContainer.innerHTML = '';

    if (isScreenSharing) {
        container.classList.add('screen-sharing');
        container.classList.remove('alone', 'two-users');

        // Show shared screen as main video (localVideo assumed to be shared screen)
        videosContainer.style.display = 'none';
        floatingVideosContainer.style.display = 'flex';

        // Add floating videos for local and remote streams
        if (localVideoVisible) {
            const localClone = localVideo.cloneNode(true);
            localClone.muted = true;
            floatingVideosContainer.appendChild(localClone);
        }
        if (remoteVideoVisible) {
            const remoteClone = remoteVideo.cloneNode(true);
            floatingVideosContainer.appendChild(remoteClone);
        }
    } else {
        container.classList.remove('screen-sharing');
        videosContainer.style.display = 'flex';
        floatingVideosContainer.style.display = 'none';

        if (remoteVideoVisible && localVideoVisible) {
            container.classList.add('two-users');
            container.classList.remove('alone');
        } else {
            container.classList.add('alone');
            container.classList.remove('two-users');
        }
    }
}

initializeWebRTC();
