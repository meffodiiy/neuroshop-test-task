import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getTelegramMessages } from '../services/api';
import { TelegramMessage } from '../types/telegram';
import axios from 'axios';

import Navigation from '../components/common/Navigation';
import ErrorAlert from '../components/common/ErrorAlert';
import MessageList from '../components/chat/MessageList';


type ChatParams = {
  accountId: string;
  chatId: string;
}

const ChatView: React.FC = () => {
  const { accountId, chatId } = useParams<ChatParams>();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [chatTitle, setChatTitle] = useState<string>(searchParams.get('title') || 'Chat');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!accountId || !chatId) return;

      setLoading(true);
      setError('');

      try {
        const messagesResponse = await getTelegramMessages(parseInt(accountId), parseInt(chatId));
        setMessages(messagesResponse.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.detail || 'Failed to fetch messages');
        } else {
          setError('Failed to fetch messages');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId, chatId]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation 
        title={chatTitle || 'Chat'} 
        showBackButton={true}
        onLogout={undefined}
      />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              {chatTitle || 'Chat'}
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <ErrorAlert message={error} />

            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg flex flex-col h-[70vh]">
              <div className="px-4 py-3 sm:px-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Messages</h3>
              </div>

              <MessageList 
                messages={messages} 
                loading={loading} 
                formatDate={formatDate} 
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatView;
