import React from 'react';
import { TelegramMessage } from '../../types/telegram';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: TelegramMessage[];
  loading: boolean;
  formatDate: (dateString: string) => string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading, formatDate }) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="px-4 py-5 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="px-4 py-5 text-center text-gray-500">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No messages found in this chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <ul className="space-y-4">
        {messages.map(message => (
          <MessageItem 
            key={message.id} 
            message={message} 
            formatDate={formatDate} 
          />
        ))}
      </ul>
    </div>
  );
};

export default MessageList;