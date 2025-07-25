// src/context/ChatContext.js
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import socketIO from 'socket.io-client';

// Create the context
const ChatContext = createContext();

// Connect to the Socket.IO server once
// This connection will persist for the duration of the app if ChatProvider is at the root
const socket = socketIO.connect('http://192.168.1.105:4000');

export const ChatProvider = ({ children }) => {
    const [userName, setUserName] = useState('');
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [activeChat, setActiveChat] = useState('General Chat'); // 'General Chat' or a specific userName

    // useRef to keep track of the current messages state for reliable socket event handling
    const messagesRef = useRef(messages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        // --- Socket.IO Event Listeners ---

        // Listener for incoming messages
        socket.on('messageResponse', (data) => {
            // Use the ref to ensure we're updating based on the latest state
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        // Listener for updated online users list
        socket.on('onlineUsers', (users) => {
            setOnlineUsers(users);
        });

        // --- Cleanup function for socket listeners ---
        return () => {
            socket.off('messageResponse');
            socket.off('onlineUsers');
        };
    }, []); // Empty dependency array means these effects run once on mount

    // Function to send a message
    const sendMessage = (text) => {
        if (text.trim() && userName) {
            const messageData = {
                sender: userName,
                text: text,
                id: `${socket.id}-${Math.random()}-${Date.now()}`, // Unique ID for key prop
                socketID: socket.id, // Sender's socket ID
                recipient: activeChat === 'General Chat' ? 'all' : activeChat, // Target for the message
            };
            socket.emit('message', messageData);
        }
    };

    // The value that will be provided to consumers of this context
    const contextValue = {
        userName,
        setUserName,
        messages,
        onlineUsers,
        activeChat,
        setActiveChat,
        sendMessage,
        socketId: socket.id, // Expose current socket ID if needed by components
        socket, // Expose the socket instance directly for other emits (like userName)
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};

// Custom hook to easily consume the ChatContext
export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};