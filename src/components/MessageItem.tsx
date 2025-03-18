import React from 'react';
import { Message } from '../types/chat';

interface MessageItemProps {
    message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    return (
        <div className={`message ${message.role}`}>
            <div className="message-content">
                {message.content.split('\n').map((line: string, i: number) => (
                    <span key={i}>
                        {line}
                        {i < message.content.split('\n').length - 1 && <br />}
                    </span>
                ))}
            </div>
        </div>
    );
};
