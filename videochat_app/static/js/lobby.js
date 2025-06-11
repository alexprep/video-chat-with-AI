// --- Chat Logic Starts Here ---
    const chatLog = document.querySelector('#chat-log');
    const chatMessageInput = document.querySelector('#chat-message-input');
    const chatMessageSubmit = document.querySelector('#chat-message-submit');

    const roomName = 'lobby';

    // Use correct WebSocket protocol based on page protocol
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const chatSocket = new WebSocket(
        wsScheme + '://' + window.location.host + '/ws/chat/' + roomName + '/'
    );

    if (chatMessageInput) {
        chatMessageInput.focus();
    } else {
        console.error("chatMessageInput element not found. Check ID in HTML.");
    }

    chatSocket.onopen = function(e) {
        console.log("Chat socket opened successfully!");
    };

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        if (data.type === 'chat_message') {
            const message = data.message;
            chatLog.innerHTML += `<p>${message}</p>`;
            chatLog.scrollTop = chatLog.scrollHeight;
        } else if (data.type === 'offer' || data.type === 'answer' || data.type === 'candidate') {
            handleSignalingMessage(data);
        } else if (data.type === 'hangup') {
            handleHangupSignal();
        }
    };

    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly. Code:', e.code, 'Reason:', e.reason);
        alert('Disconnected from chat. Please refresh the page.');
    };

    chatSocket.onerror = function(e) {
        console.error('Chat socket error:', e);
    };

    if (chatMessageInput) {
        chatMessageInput.onkeyup = function(e) {
            if (e.keyCode === 13) {
                chatMessageSubmit.click();
            }
        };
    }

    if (chatMessageSubmit) {
        chatMessageSubmit.onclick = function(e) {
            const message = chatMessageInput.value.trim();
            if (message) {
                if (chatSocket.readyState === WebSocket.OPEN) {
                    chatSocket.send(JSON.stringify({
                        'type': 'chat_message',
                        'message': message
                    }));
                    chatMessageInput.value = '';
                } else {
                    console.error("WebSocket is not open. Message not sent.");
                    alert("Cannot send message: Not connected to chat. Please refresh.");
                }
            }
        };
    }

    // --- WebRTC Logic Starts Here ---

    let localStream;
    let remoteStream;
    let peerConnection;

    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');
    const callBtn = document.getElementById('call-btn');
    const hangupBtn = document.getElementById('hangup-btn');

    // Disable call and hangup buttons initially
    callBtn.disabled = true;
    hangupBtn.disabled = true;

    if (callBtn) {
        callBtn.addEventListener('click', createOffer);
    }
    if (hangupBtn) {
        hangupBtn.addEventListener('click', hangUp);
    }

    const servers = {
        iceServers:[
            {
                urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
            }
        ]
    };

    async function init() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            localVideo.srcObject = localStream;
            console.log("Local media stream obtained.");
            callBtn.disabled = false;
        } catch (error) {
            console.error("Error accessing media devices:", error);
            alert("Could not access camera/microphone. You can still chat, but video calls will not send your video/audio without media access.");
            callBtn.disabled = false;
            localStream = null;
        }
    }

    async function createPeerConnection() {
        if (peerConnection) {
            console.log("PeerConnection already exists. Skipping recreation.");
            return;
        }

        peerConnection = new RTCPeerConnection(servers);
        remoteStream = new MediaStream();
        remoteVideo.srcObject = remoteStream;

        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
            console.log("Local tracks added to peer connection.");
        } else {
            console.warn("No local media stream available. Proceeding without adding local tracks.");
        }

        peerConnection.ontrack = async (event) => {
            event.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track);
            });
            console.log("Remote track added to remote stream.");
        };

        peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
                    chatSocket.send(JSON.stringify({
                        'type': 'candidate',
                        'candidate': event.candidate
                    }));
                    console.log('Sending ICE candidate:', event.candidate);
                } else {
                    console.error("WebSocket not open. Cannot send ICE candidate.");
                }
            }
        };

        peerConnection.onconnectionstatechange = (event) => {
            console.log('PeerConnection state change:', peerConnection.connectionState);
            if (peerConnection.connectionState === 'connected') {
                hangupBtn.disabled = false;
                callBtn.disabled = true;
            } else if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'closed') {
                hangupBtn.disabled = true;
                callBtn.disabled = false;
                remoteVideo.srcObject = null;
            }
        };
    }

    async function createOffer() {
        await createPeerConnection();

        if (!localStream) {
            console.warn("Attempting to create offer without local media stream. You will only receive video.");
        }

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
                chatSocket.send(JSON.stringify({
                    'type': 'offer',
                    'offer': offer
                }));
                console.log('Sending offer:', offer);
            } else {
                console.error("WebSocket not open. Cannot send offer.");
                alert("Failed to send offer: Not connected to chat server.");
            }
        } catch (error) {
            console.error("Error creating or sending offer:", error);
            alert("Failed to create call offer. Check console for details.");
        }
    }

    async function createAnswer(offer) {
        await createPeerConnection();
        try {
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
                chatSocket.send(JSON.stringify({
                    'type': 'answer',
                    'answer': answer
                }));
                console.log('Sending answer:', answer);
            } else {
                console.error("WebSocket not open. Cannot send answer.");
                alert("Failed to send answer: Not connected to chat server.");
            }
        } catch (error) {
            console.error("Error creating or sending answer:", error);
            alert("Failed to create call answer. Check console for details.");
        }
    }

    async function handleSignalingMessage(message) {
        if (!peerConnection) {
            await createPeerConnection();
        }

        if (message.type === 'offer') {
            console.log('Received offer:', message.offer);
            await createAnswer(message.offer);
        } else if (message.type === 'answer') {
            console.log('Received answer:', message.answer);
            if (peerConnection.remoteDescription === null || peerConnection.remoteDescription.type !== message.answer.type || peerConnection.remoteDescription.sdp !== message.answer.sdp) {
               await peerConnection.setRemoteDescription(message.answer);
            } else {
               console.warn("Received answer is redundant or already set.");
            }
        } else if (message.type === 'candidate') {
            console.log('Received ICE candidate:', message.candidate);
            if (peerConnection && peerConnection.remoteDescription) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                } catch (e) {
                    console.error("Error adding received ICE candidate:", e);
                }
            } else {
                 console.warn("PeerConnection or remoteDescription not ready for incoming ICE candidate. Candidate might be queued or ignored.", message.candidate);
            }
        }
    }

    function hangUp() {
        console.log('Attempting to hang up...');
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;

        if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
            chatSocket.send(JSON.stringify({
                'type': 'hangup'
            }));
        } else {
            console.warn("WebSocket not open. Cannot send hangup signal.");
        }
        console.log('Call ended locally and hangup signal sent (if socket open).');
        callBtn.disabled = false;
        hangupBtn.disabled = true;
        init();
    }

    async function handleHangupSignal() {
        console.log('Received hangup signal from other peer. Tearing down connection.');
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        remoteVideo.srcObject = null;
        callBtn.disabled = false;
        hangupBtn.disabled = true;
    }

    init();
