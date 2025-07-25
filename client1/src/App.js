import React, { useState, useEffect, useRef } from 'react';
import socketIO from 'socket.io-client';
import './App.css';

// 1. Create a variable to hold the socket instance outside of any component.
// This ensures it's created only once when the module is first loaded.
let socket = null;

// Function to get or create the socket instance
const getSocket = () => {
    if (!socket) {
        socket = socketIO.connect('http://192.168.1.102:4000', {
            // Optional: Add some connection options if needed
            // For example, if you want to explicitly disable autoConnect and connect later
            // autoConnect: false,
        });
        console.log('Socket.IO client connected:', socket.id);
    }
    return socket;
};

// --- Screen 1: Enter Name ---
const EnterNameScreen = ({ onEnterChat }) => {
    const [name, setName] = useState('');

    const handleSubmit = () => {
        if (name.trim()) {
            const currentSocket = getSocket(); // Ensure socket is created/available
            // If autoConnect is false, you'd call currentSocket.connect() here.
            currentSocket.emit('userName', name); // Emit userName to server
            onEnterChat(name);
        }
    };

    return (
        <div className="container">
            <h1>Enter Your Name</h1>
            <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="name-input"
            />
            <button onClick={handleSubmit} className="chat-button">
                Chat
            </button>
        </div>
    );
};

// --- Screen 2: Chat Interface ---
const ChatScreen = ({ userName }) => {
    // Get the shared socket instance
    const currentSocket = getSocket();

    const [message, setMessage] = useState('');
    const [publicMessages, setPublicMessages] = useState([]);
    const [privateMessages, setPrivateMessages] = useState({});
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [currentChatPartner, setCurrentChatPartner] = useState(null);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Emit userName to server when ChatScreen mounts
        if (userName) {
            currentSocket.emit('userName', userName);
        }

        // Setup listeners
        currentSocket.on('messageResponse', (data) => {
            setPublicMessages((prevMessages) => [...prevMessages, data]);
        });

        currentSocket.on('privateMessageResponse', (data) => {
            setPrivateMessages((prevMsgs) => {
                const updatedMsgs = { ...prevMsgs };
                // Determine the key for storing private messages.
                // If it's your own message, the partner is the recipient; otherwise, it's the sender.
                const partnerId = data.socketID === currentSocket.id ? data.recipientSocketId : data.socketID;
                if (!updatedMsgs[partnerId]) {
                    updatedMsgs[partnerId] = [];
                }
                updatedMsgs[partnerId].push(data);
                return updatedMsgs;
            });
        });

        currentSocket.on('onlineUsers', (users) => {
            setOnlineUsers(users.filter(user => user.socketId !== currentSocket.id));
        });

        // Cleanup: Remove listeners when component unmounts
        return () => {
            currentSocket.off('messageResponse');
            currentSocket.off('privateMessageResponse');
            currentSocket.off('onlineUsers');
        };
    }, [userName, currentSocket]); // Add currentSocket to dependencies if it could change (though not in this setup)

    useEffect(() => {
        scrollToBottom();
    }, [publicMessages, privateMessages, currentChatPartner]);

    const handleSendMessage = () => {
        if (message.trim()) {
            const messageData = {
                sender: userName,
                text: message,
                id: `${currentSocket.id}${Date.now()}${Math.random()}`,
                socketID: currentSocket.id,
            };

            if (currentChatPartner) {
                currentSocket.emit('privateMessage', {
                    ...messageData,
                    recipientSocketId: currentChatPartner.socketId,
                });
            } else {
                currentSocket.emit('message', messageData);
            }
            setMessage('');
        }
    };

    const handleUserClick = (user) => {
        setCurrentChatPartner(user);
        setPrivateMessages((prevMsgs) => ({
            ...prevMsgs,
            [user.socketId]: prevMsgs[user.socketId] || []
        }));
    };

    const displayMessages = currentChatPartner
        ? privateMessages[currentChatPartner.socketId] || []
        : publicMessages;

    return (
        <div className="container chat-container">
            <h1>Welcome, {userName}!</h1>

            <div className="chat-area">
                <div className="online-users">
                    <h2>Online Users</h2>
                    <ul className="user-list">
                        <li
                            className={`user-item ${currentChatPartner === null ? 'active' : ''}`}
                            onClick={() => setCurrentChatPartner(null)}
                        >
                            General Chat
                        </li>
                        {onlineUsers.length === 0 ? (
                            <li className="user-item-placeholder">No one else online.</li>
                        ) : (
                            onlineUsers.map((user) => (
                                <li
                                    key={user.socketId}
                                    className={`user-item ${currentChatPartner?.socketId === user.socketId ? 'active' : ''}`}
                                    onClick={() => handleUserClick(user)}
                                >
                                    {user.userName}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
                <div className="chatbox">
                    <h2>
                        Chat
                        {currentChatPartner && ` with ${currentChatPartner.userName}`}
                        {!currentChatPartner && ' (General)'}
                    </h2>
                    <div className="messages">
                        {displayMessages.length === 0 ? (
                            <p className="no-messages">No messages yet. Say hello!</p>
                        ) : (
                            displayMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`message ${msg.socketID === currentSocket.id ? 'my-message' : 'other-message'}`}
                                >
                                    <strong>{msg.sender}:</strong> {msg.text}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="message-input-area">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                            className="message-input"
                        />
                        <button onClick={handleSendMessage} className="send-button">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
function App() {
    const [screen, setScreen] = useState('enterName');
    const [userName, setUserName] = useState('');

    const handleEnterChat = (name) => {
        setUserName(name);
        setScreen('chat');
    };

    return (
        <div className="App">
            {screen === 'enterName' ? (
                <EnterNameScreen onEnterChat={handleEnterChat} />
            ) : (
                <ChatScreen userName={userName} />
            )}
        </div>
    );
}

export default App;