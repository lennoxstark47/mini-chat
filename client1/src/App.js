// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import EnterNameScreen from './components/EnterNameScreen';
import ChatScreen from './components/ChatScreen';
import './App.css';

function App() {
    return (
        <div className="App">
            <Router>
                <ChatProvider> {/* All components within ChatProvider can access chat context */}
                    <Routes>
                        <Route path="/" element={<EnterNameScreen />} />
                        <Route path="/chat" element={<ChatScreen />} />
                    </Routes>
                </ChatProvider>
            </Router>
        </div>
    );
}

export default App;