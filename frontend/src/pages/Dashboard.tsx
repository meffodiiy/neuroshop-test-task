import React, { useState, useEffect, useContext, FormEvent, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { getTelegramAccounts, createTelegramAccount, authenticateTelegramAccount, deleteTelegramAccount, logoutTelegramAccount, getTelegramChats } from '../services/api';
import { TelegramAccount, TelegramChat, NewAccountForm } from '../types/telegram';
import axios from 'axios';

import Navigation from '../components/common/Navigation';
import ErrorAlert from '../components/common/ErrorAlert';
import AuthenticationModal from '../components/dashboard/AuthenticationModal';
import AccountForm from '../components/dashboard/AccountForm';
import AccountList from '../components/dashboard/AccountList';
import ChatList from '../components/dashboard/ChatList';

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<TelegramAccount | null>(null);
  const [chats, setChats] = useState<TelegramChat[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  const chatListRef = useRef<HTMLDivElement>(null);

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newAccount, setNewAccount] = useState<NewAccountForm>({
    phone_number: ''
  });

  const [authStep, setAuthStep] = useState<string>('');
  const [authMessage, setAuthMessage] = useState<string>('');
  const [authAccount, setAuthAccount] = useState<TelegramAccount | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [twoFactorPassword, setTwoFactorPassword] = useState<string>('');

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchChats = useCallback(async (accountId: number): Promise<void> => {
    setLoadingChats(true);
    setError('');

    try {
      const response = await getTelegramChats(accountId);
      setChats(response.data);
    } catch (err) {
      setError('Failed to fetch chats');
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchChats(selectedAccount.id);
    }
  }, [selectedAccount, fetchChats]);

  const fetchAccounts = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const response = await getTelegramAccounts();
      setAccounts(response.data);

      if (response.data.length > 0 && !selectedAccount) {
        setSelectedAccount(response.data[0]);
      }
    } catch (err) {
      setError('Failed to fetch Telegram accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    try {
      const response = await createTelegramAccount(newAccount);
      const account = response.data;

      setAccounts([...accounts, account]);
      setShowAddForm(false);

      setNewAccount({
        phone_number: ''
      });

      handleStartAuthentication(account);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to add Telegram account');
      } else {
        setError('Failed to add Telegram account');
      }
      console.error(err);
    }
  };

  const handleStartAuthentication = async (account: TelegramAccount): Promise<void> => {
    setError('');
    setAuthAccount(account);

    try {
      const response = await authenticateTelegramAccount({
        account_id: account.id,
        phone_number: account.phone_number
      });

      setAuthStep(response.data.auth_step);
      setAuthMessage(response.data.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to start authentication');
      } else {
        setError('Failed to start authentication');
      }
      console.error(err);
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!authAccount || !verificationCode) return;

    setError('');

    try {
      const response = await authenticateTelegramAccount({
        account_id: authAccount.id,
        verification_code: verificationCode
      });

      setAuthStep(response.data.auth_step);
      setAuthMessage(response.data.message);

      if (response.data.auth_step === 'password_needed') {
        setVerificationCode('');
      }

      if (response.data.auth_step === 'success') {
        setVerificationCode('');
        setTwoFactorPassword('');
        setAuthAccount(null);
        setAuthStep('');
        fetchAccounts();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to verify code');
      } else {
        setError('Failed to verify code');
      }
      console.error(err);
    }
  };

  const handleVerifyPassword = async (): Promise<void> => {
    if (!authAccount || !twoFactorPassword) return;

    setError('');

    try {
      const response = await authenticateTelegramAccount({
        account_id: authAccount.id,
        password: twoFactorPassword
      });

      setAuthStep(response.data.auth_step);
      setAuthMessage(response.data.message);

      if (response.data.auth_step === 'success') {
        setVerificationCode('');
        setTwoFactorPassword('');
        setAuthAccount(null);
        setAuthStep('');
        fetchAccounts();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to verify password');
      } else {
        setError('Failed to verify password');
      }
      console.error(err);
    }
  };

  const handleDeleteAccount = async (accountId: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    setError('');

    try {
      await deleteTelegramAccount(accountId);
      setAccounts(accounts.filter(account => account.id !== accountId));

      if (selectedAccount && selectedAccount.id === accountId) {
        setSelectedAccount(accounts.length > 1 ? accounts[0] : null);
        setChats([]);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to delete Telegram account');
      } else {
        setError('Failed to delete Telegram account');
      }
      console.error(err);
    }
  };

  const handleLogoutAccount = async (accountId: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to log out from this Telegram account?')) {
      return;
    }

    setError('');

    try {
      await logoutTelegramAccount(accountId);
      fetchAccounts(); // Refresh the accounts list
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to log out from Telegram account');
      } else {
        setError('Failed to log out from Telegram account');
      }
      console.error(err);
    }
  };

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const handleChatClick = (chatId: number, chatTitle: string): void => {
    if (selectedAccount) {
      navigate(`/chats/${selectedAccount.id}/${chatId}?title=${encodeURIComponent(chatTitle)}`);
    }
  };

  const handleCancelAuth = () => {
    setAuthAccount(null);
    setAuthStep('');
    setVerificationCode('');
    setTwoFactorPassword('');
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {authAccount && authStep && (
        <AuthenticationModal
          authAccount={authAccount}
          authStep={authStep}
          authMessage={authMessage}
          verificationCode={verificationCode}
          twoFactorPassword={twoFactorPassword}
          setVerificationCode={setVerificationCode}
          setTwoFactorPassword={setTwoFactorPassword}
          handleVerifyCode={handleVerifyCode}
          handleVerifyPassword={handleVerifyPassword}
          onCancel={handleCancelAuth}
        />
      )}

      <Navigation 
        title="Telegram Web Client" 
        showLogoutButton={true} 
        onLogout={handleLogout} 
      />

      <div className="py-6 flex-grow flex flex-col overflow-hidden">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main className="flex-grow overflow-hidden">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 h-full flex flex-col">
            <ErrorAlert message={error} />

            <div className="mt-4 bg-white shadow-lg overflow-hidden sm:rounded-lg border border-gray-200 flex-grow flex flex-col">
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Telegram Accounts</h3>
                  <p className="mt-1 text-sm text-gray-500">Manage your Telegram accounts and chats</p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {showAddForm ? 'Cancel' : 'Add Account'}
                </button>
              </div>

              {showAddForm && (
                <AccountForm
                  onSubmit={handleAddAccount}
                  newAccount={newAccount}
                  setNewAccount={setNewAccount}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              <div className="border-t border-gray-200 flex-grow flex flex-col overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 h-full">
                  <div className="col-span-1 overflow-y-auto h-full">
                    <AccountList
                      accounts={accounts}
                      selectedAccount={selectedAccount}
                      onSelectAccount={setSelectedAccount}
                      onStartAuthentication={handleStartAuthentication}
                      onLogoutAccount={handleLogoutAccount}
                      onDeleteAccount={handleDeleteAccount}
                      loading={loading}
                    />
                  </div>

                  <div ref={chatListRef} className="col-span-2 overflow-y-auto h-full">
                    {selectedAccount && !selectedAccount.is_authorized && (
                      <div className="mt-2 text-center">
                        <button
                          onClick={() => handleStartAuthentication(selectedAccount)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Authorize Now
                        </button>
                      </div>
                    )}
                    <ChatList
                      chats={chats}
                      selectedAccount={selectedAccount}
                      onChatClick={handleChatClick}
                      loadingChats={loadingChats}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
