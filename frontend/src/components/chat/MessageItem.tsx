import React from 'react';
import { TelegramMessage } from '../../types/telegram';
import ReactMarkdown from 'react-markdown';

interface MessageItemProps {
  message: TelegramMessage;
  formatDate: (dateString: string) => string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, formatDate }) => {
  const fromCurrentUser = message.is_outgoing;
  
  return (
    <li 
      className={`p-4 rounded-lg max-w-[80%] shadow-sm ${
        fromCurrentUser 
          ? 'ml-auto bg-blue-100 border-blue-200 border' 
          : 'bg-white border-gray-200 border'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${
          fromCurrentUser ? 'text-blue-800' : 'text-gray-900'
        }`}>
          {message.sender}
        </span>
        <span className="text-xs text-gray-500 ml-2">{formatDate(message.date)}</span>
      </div>
      <div className={`prose prose-sm max-w-none ${
        fromCurrentUser ? 'text-blue-900' : 'text-gray-700'
      }`}>
        <ReactMarkdown>
          {message.text}
        </ReactMarkdown>
      </div>
    </li>
  );
};

export default MessageItem;