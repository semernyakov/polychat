import React from 'react';
import { Message } from '../types/message';
import { formatTimestamp } from '../utils/settingsUtils';

interface MessageItemProps {
    message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const { role, content, timestamp } = message;
    
    const roleLabel = 
        role === 'user' ? 'Вы' :
        role === 'assistant' ? 'Groq' :
        'Ошибка';
    
    const roleClass = 
        role === 'user' ? 'groq-user-message' :
        role === 'assistant' ? 'groq-assistant-message' :
        'groq-error-message';
    
    return (
        <div className={`groq-message ${roleClass}`}>
            <div className="groq-message-header">
                <span className="groq-message-role">{roleLabel}</span>
                <span className="groq-message-time">{formatTimestamp(timestamp)}</span>
            </div>
            <div className="groq-message-content">
                {content.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        {index < content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
