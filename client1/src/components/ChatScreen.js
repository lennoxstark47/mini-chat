// src/components/ChatScreen.js
import React from 'react';
import { useChat } from '../context/ChatContext';
import OnlineUsersList from './chat/OnlineUsersList';
import MessagesArea from './chat/MessagesArea';
import MessageInput from './chat/MessageInput';

const ChatScreen = () => {
    const { userName, activeChat } = useChat();

    return (
        <div className="container chat-container">
            <h1>Welcome, {userName}!</h1>

            <div className="chat-area">
                <OnlineUsersList /> {/* Sidebar for online users */}

                {/* Main Chat Content */}
                <div className="main-chat-content">
                    <div className="chat-header">
                        Chat with {activeChat}
                    </div>
                    <MessagesArea /> {/* Message display area */}
                    <MessageInput /> {/* Message input and send button */}
                </div>
            </div>
        </div>
    );
};

export default ChatScreen;