import React from 'react';
import { Message } from '../types/chat';

interface MessageItemProps {
    message: Message;
    sender: 'user' | 'groq' | 'system';
    timestamp: number;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, sender, timestamp }) => {
    const formattedTime = new Date(timestamp).toLocaleTimeString();
    
    return (
        <div className={`message-item ${sender}-message`}>
            <div className="message-header">
                <span className="message-sender">
                    {sender === 'user' ? 'Вы' : sender === 'groq' ? 'Groq AI' : 'Система'}
                </span>
                <span className="message-time">{formattedTime}</span>
            </div>
            <div className="message-content">
                {message.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                        {line}
                        {i < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                ))}
            </div>
            {message.status === 'error' && (
                <div className="message-error-indicator">Ошибка</div>
            )}
        </div>
    );
};
