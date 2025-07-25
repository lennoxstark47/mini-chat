// src/components/chat/OnlineUsersList.js
import React from 'react';
import { useChat } from '../../context/ChatContext';

const OnlineUsersList = () => {
    const { userName, onlineUsers, activeChat, setActiveChat } = useChat();

    return (
        <div className="online-users-panel">
            <h2>Online Users</h2>
            <ul>
                <li
                    className={activeChat === 'General Chat' ? 'active' : ''}
                    onClick={() => setActiveChat('General Chat')}
                >
                    General Chat
                </li>
                {onlineUsers.length === 0 ? (
                    <li>No one else online.</li>
                ) : (
                    onlineUsers.map((userObj) => (
                        userObj.userName !== userName && (
                            <li
                                key={userObj.socketId}
                                className={activeChat === userObj.userName ? 'active' : ''}
                                onClick={() => setActiveChat(userObj.userName)}
                            >
                                {userObj.userName}
                            </li>
                        )
                    ))
                )}
            </ul>
        </div>
    );
};

export default OnlineUsersList;