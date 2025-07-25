import React, { useState } from 'react';
import socketIO from 'socket.io-client';
import './App.css'; // We'll keep a basic CSS file for minimal styling

// --- Screen 1: Enter Name ---
const EnterNameScreen = ({ onEnterChat }) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
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
    const socket = socketIO.connect('http://localhost:4000')
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(['User1', 'User2', 'User3']); // Static for now

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { sender: userName, text: message }]);
      setMessage('');
    }
  };

  return (
      <div className="container chat-container">
        <h1>Welcome, {userName}!</h1>

        <div className="chat-area">
          <div className="online-users">
            <h2>Online Users</h2>
            <ul>
              {onlineUsers.map((user, index) => (
                  <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
          <div className="chatbox">
            <h2>Chat</h2>
            <div className="messages">
              {messages.length === 0 ? (
                  <p>No messages yet. Say hello!</p>
              ) : (
                  messages.map((msg, index) => (
                      <div key={index} className={`message ${msg.sender === userName ? 'my-message' : 'other-message'}`}>
                        <strong>{msg.sender}:</strong> {msg.text}
                      </div>
                  ))
              )}
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
  const [screen, setScreen] = useState('enterName'); // 'enterName' or 'chat'
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