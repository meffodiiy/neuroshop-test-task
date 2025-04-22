import React from 'react';
import { TelegramChat, TelegramAccount } from '../../types/telegram';

interface ChatListProps {
  chats: TelegramChat[];
  selectedAccount: TelegramAccount | null;
  onChatClick: (chatId: number, chatTitle: string) => void;
  loadingChats: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedAccount,
  onChatClick,
  loadingChats
}) => {
  if (!selectedAccount) {
    return <div className="p-4 text-center text-gray-500">Select an account to view chats</div>;
  }

  if (!selectedAccount.is_authorized) {
    return (
      <div className="p-4 text-center text-gray-500">
        This account is not authorized. Please authorize it first.
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-gray-200">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => onChatClick(chat.id, chat.title)}
          >
            <div className="flex items-center">
              {chat.thumb ? (
                <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                  <img
                    src={`data:image/jpeg;base64,${chat.thumb}`}
                    alt={chat.title}
                    className="h-10 w-10 rounded-full"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">{chat.title.charAt(0)}</span>
                </div>
              )}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{chat.title}</p>
                  {chat.unread_count > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {loadingChats && (
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm text-gray-500">Loading chats...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatList;