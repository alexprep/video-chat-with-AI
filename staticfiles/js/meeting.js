const meetingId = document.querySelector('[data-meeting-id]').dataset.meetingId;
const chatSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/chat/' + meetingId + '/'
);

// DOM Elements
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const muteBtn = document.getElementById('mute-btn');
const videoBtn = document.getElementById('video-btn');
const screenShareBtn = document.getElementById('screen-share-btn');
const hangupBtn = document.getElementById('hangup-btn');
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-message-input');
const chatSubmit = document.getElementById('chat-message-submit');
const screenShareModal = document.getElementById('screen-share-modal');
const aiFeatures = document.getElementById('ai-features');
const aiStatusIndicator = document.getElementById('ai-status-indicator');
const aiStatusText = document.getElementById('ai-status-text');

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
let isAIEnabled = false;

// Initialize WebRTC
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

        // Handle incoming ICE candidates
        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            if (data.type === 'offer') {
                handleOffer(data);
            } else if (data.type === 'answer') {
                handleAnswer(data);
            } else if (data.type === 'candidate') {
                handleCandidate(data);
            } else if (data.type === 'chat_message') {
                handleChatMessage(data);
            }
        };
    } catch (error) {
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
    };

    peerConnection.oniceconnectionstatechange = () => {
        if (peerConnection.iceConnectionState === 'disconnected') {
            handleDisconnection();
        }
    };
}

async function handleOffer(offer) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    chatSocket.send(JSON.stringify({
        type: 'answer',
        answer: answer
    }));
}

async function handleAnswer(answer) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

async function handleCandidate(candidate) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// Chat Functions
function handleChatMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.is_ai ? 'ai-message' : 'user-message'}`;
    messageDiv.textContent = data.message;
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

chatSubmit.onclick = function() {
    const message = chatInput.value;
    if (message) {
        if (message.startsWith('!Help')) {
            enableAI();
        } else if (isAIEnabled && message.toLowerCase().includes('jarvis')) {
            processAICommand(message);
        } else {
            chatSocket.send(JSON.stringify({
                type: 'chat_message',
                message: message
            }));
        }
        chatInput.value = '';
    }
};

chatInput.onkeypress = function(e) {
    if (e.key === 'Enter') {
        chatSubmit.click();
    }
};

// AI Functions
function enableAI() {
    isAIEnabled = true;
    aiStatusIndicator.classList.add('active');
    aiStatusText.textContent = 'AI Active';
    aiFeatures.style.display = 'block';
    handleChatMessage({
        is_ai: true,
        message: 'AI Assistant activated! Say "Jarvis" to use AI features.'
    });
}

async function processAICommand(message) {
    try {
        const response = await fetch('/api/ai/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        handleChatMessage({
            is_ai: true,
            message: data.response
        });
    } catch (error) {
        console.error('Error processing AI command:', error);
        handleChatMessage({
            is_ai: true,
            message: 'Sorry, I encountered an error processing your request.'
        });
    }
}

// Screen Sharing Functions
screenShareBtn.onclick = function() {
    screenShareModal.style.display = 'block';
};

document.getElementById('simple-share-btn').onclick = async function() {
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

document.getElementById('ai-share-btn').onclick = async function() {
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

document.getElementById('cancel-share-btn').onclick = function() {
    screenShareModal.style.display = 'none';
};

// Control Functions
muteBtn.onclick = function() {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    isMuted = !isMuted;
    muteBtn.classList.toggle('active', isMuted);
};

videoBtn.onclick = function() {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    isVideoOff = !isVideoOff;
    videoBtn.classList.toggle('active', isVideoOff);
};

hangupBtn.onclick = function() {
    handleDisconnection();
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

// Initialize
initializeWebRTC(); 