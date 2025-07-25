// src/components/chat/MessagesArea.js
import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';

const MessagesArea = () => {
    const { userName, messages, activeChat, socketId } = useChat();
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of messages whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="messages-area">
            {messages.length === 0 ? (
                <p>No messages yet. Say hello!</p>
            ) : (
                messages.map((msg) => (
                    // Client-side filtering for display based on active chat:
                    // - Always show if it's 'General Chat'
                    // - Show if I'm the sender and the recipient is the active chat (private or general)
                    // - Show if the sender is the active chat and the message is for me or general broadcast
                    (
                        activeChat === 'General Chat' ||
                        (msg.sender === userName && (msg.recipient === activeChat || msg.recipient === 'all')) ||
                        (msg.sender === activeChat && (msg.recipient === userName || msg.recipient === 'all'))
                    ) && (
                        <div
                            key={msg.id}
                            className={`message ${msg.socketID === socketId ? 'my-message' : 'other-message'}`}
                        >
                            <strong>{msg.sender}:</strong> {msg.text}
                        </div>
                    )
                ))
            )}
            <div ref={messagesEndRef} /> {/* Element for auto-scrolling */}
        </div>
    );
};

export default MessagesArea;