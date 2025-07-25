// src/components/EnterNameScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';

const EnterNameScreen = () => {
    const [inputName, setInputName] = useState('');
    const { setUserName, socket } = useChat(); // Get setUserName and socket from context
    const navigate = useNavigate(); // Hook for navigation

    const handleSubmit = () => {
        if (inputName.trim()) {
            setUserName(inputName); // Set username in global state
            socket.emit('userName', inputName); // Tell the server the user's name
            navigate('/chat'); // Navigate to the chat page
        }
    };

    return (
        <div className="container">
            <h1>Enter Your Name</h1>
            <input
                type="text"
                placeholder="Your name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="name-input"
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleSubmit();
                    }
                }}
            />
            <button onClick={handleSubmit} className="chat-button">
                Chat
            </button>
        </div>
    );
};

export default EnterNameScreen;