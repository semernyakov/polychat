import React, { Fragment } from 'react';
import { Message } from '../types/chat';

interface MessageItemProps {
    message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    return (
        <div className={`message ${message.role}`}>
            <div className="message-role">{message.role}</div>
            <div className="message-content">
                {message.text.split('\n').map((line, i) => (
                    <Fragment key={i}>
                        {line}
                        {i < message.text.split('\n').length - 1 && <br />}
                    </Fragment>
                ))}
            </div>
        </div>
    );
};
