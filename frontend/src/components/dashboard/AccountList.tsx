import React from 'react';
import { TelegramAccount } from '../../types/telegram';

interface AccountListProps {
  accounts: TelegramAccount[];
  selectedAccount: TelegramAccount | null;
  onSelectAccount: (account: TelegramAccount) => void;
  onStartAuthentication: (account: TelegramAccount) => Promise<void>;
  onLogoutAccount: (accountId: number) => Promise<void>;
  onDeleteAccount: (accountId: number) => Promise<void>;
  loading: boolean;
}

const AccountList: React.FC<AccountListProps> = ({
  accounts,
  selectedAccount,
  onSelectAccount,
  onStartAuthentication,
  onLogoutAccount,
  onDeleteAccount,
  loading
}) => {
  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading accounts...</div>;
  }

  if (accounts.length === 0) {
    return <div className="p-4 text-center text-gray-500">No accounts added yet</div>;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {accounts.map((account) => (
        <li
          key={account.id}
          className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${selectedAccount?.id === account.id ? 'bg-blue-50' : ''}`}
          onClick={() => onSelectAccount(account)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {account.photo ? (
                <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden mr-3">
                  <img
                    src={`data:image/jpeg;base64,${account.photo}`}
                    alt={account.first_name || 'Account'}
                    className="h-10 w-10 rounded-full"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-gray-500 font-medium">
                    {account.first_name ? account.first_name.charAt(0) : account.phone_number.charAt(1)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {account.first_name ? (
                    <>
                      {account.first_name} {account.last_name || ''}
                      {account.username && <span className="text-gray-500"> @{account.username}</span>}
                    </>
                  ) : (
                    <>Account {account.phone_number.substring(0, 3)}</>
                  )}
                </p>
                <p className="text-sm text-gray-500">{account.phone_number}</p>
                <p className="text-sm text-gray-500">
                  {account.is_authorized ? 'Authorized' : 'Not authorized'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {account.is_authorized ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogoutAccount(account.id);
                  }}
                  className="text-sm text-yellow-600 hover:text-yellow-900"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartAuthentication(account);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-900"
                >
                  Authorize
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAccount(account.id);
                }}
                className="text-sm text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AccountList;