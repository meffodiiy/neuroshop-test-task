import React, { FormEvent, ChangeEvent, useState } from 'react';
import { NewAccountForm } from '../../types/telegram';

interface AccountFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  newAccount: NewAccountForm;
  setNewAccount: (account: NewAccountForm) => void;
  onCancel: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({
  onSubmit,
  newAccount,
  setNewAccount,
  onCancel
}) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setNewAccount({
      ...newAccount,
      [name]: value
    });
  };

  return (
    <div className="px-4 py-5 sm:p-6 border-b border-gray-200 bg-gray-50">
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="phone_number"
                id="phone_number"
                placeholder="+1234567890"
                value={newAccount.phone_number}
                onChange={handleInputChange}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Enter your phone number with country code (e.g., +1234567890)</p>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          >
            Add Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;