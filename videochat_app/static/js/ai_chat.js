// AI Chat Integration with Gemini API

class AIChatHandler {
    constructor() {
        this.isProcessing = false;
        this.typingIndicator = null;
        this.createTypingIndicator();
    }

    createTypingIndicator() {
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.className = 'typing-indicator';
        this.typingIndicator.innerHTML = '<span>AI is typing</span><span class="dots">...</span>';
        this.typingIndicator.style.display = 'none';

        const style = document.createElement('style');
        style.textContent = `
            .typing-indicator {
                padding: 8px 12px;
                background: rgba(26, 115, 232, 0.1);
                border-radius: 8px;
                margin: 8px;
                color: #8ab4f8;
                font-style: italic;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .typing-indicator .dots {
                animation: typing 1.4s infinite;
            }
            @keyframes typing {
                0%, 20% { content: '.'; }
                40% { content: '..'; }
                60%, 100% { content: '...'; }
            }
        `;
        document.head.appendChild(style);
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages && this.typingIndicator) {
            this.typingIndicator.style.display = 'flex';
            chatMessages.appendChild(this.typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'none';
            if (this.typingIndicator.parentNode) {
                this.typingIndicator.parentNode.removeChild(this.typingIndicator);
            }
        }
    }

    async processAICommand(message) {
        if (this.isProcessing) {
            console.log('AI is already processing a request');
            return;
        }

        try {
            this.isProcessing = true;
            this.showTypingIndicator();

            const response = await fetch('/api/ai/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    message: message.substring(1).trim() // Remove the '!' prefix
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.displayAIResponse(data.response);

        } catch (error) {
            console.error('Error processing AI command:', error);
            this.displayAIResponse('Sorry, I encountered an error processing your request.');
        } finally {
            this.isProcessing = false;
            this.hideTypingIndicator();
        }
    }

    displayAIResponse(response) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai';
        messageDiv.textContent = response;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') return value;
        }
        return '';
    }
}

// Initialize AI Chat Handler
const aiChat = new AIChatHandler();

// Export for use in meeting.js
export { aiChat };