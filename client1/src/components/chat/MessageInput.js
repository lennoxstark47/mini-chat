// src/components/chat/MessageInput.js
import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';

const MessageInput = () => {
    const [inputMessage, setInputMessage] = useState('');
    const { sendMessage } = useChat();

    const handleSend = () => {
        sendMessage(inputMessage);
        setInputMessage(''); // Clear input after sending
    };

    return (
        <div className="message-input-area">
            <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleSend();
                    }
                }}
                className="message-input"
            />
            <button onClick={handleSend} className="send-button">
                Send
            </button>
        </div>
    );
};

export default MessageInput;