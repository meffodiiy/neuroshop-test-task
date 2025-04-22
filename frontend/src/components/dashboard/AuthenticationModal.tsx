import React from 'react';
import { TelegramAccount, AuthResponse } from '../../types/telegram';

interface AuthenticationModalProps {
  authAccount: TelegramAccount | null;
  authStep: string;
  authMessage: string;
  verificationCode: string;
  twoFactorPassword: string;
  setVerificationCode: (code: string) => void;
  setTwoFactorPassword: (password: string) => void;
  handleVerifyCode: () => Promise<void>;
  handleVerifyPassword: () => Promise<void>;
  onCancel: () => void;
}

const AuthenticationModal: React.FC<AuthenticationModalProps> = ({
  authAccount,
  authStep,
  authMessage,
  verificationCode,
  twoFactorPassword,
  setVerificationCode,
  setTwoFactorPassword,
  handleVerifyCode,
  handleVerifyPassword,
  onCancel
}) => {
  if (!authAccount || !authStep) return null;

  // Helper function to render the authentication modal content based on the current step
  const renderAuthModalContent = (): React.ReactNode => {
    switch (authStep) {
      case 'code_needed':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Code</h3>
            <p className="text-sm text-gray-500 mb-4">{authMessage}</p>
            <div className="mb-4">
              <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700 mb-1">
                Enter the code sent to your phone
              </label>
              <input
                type="text"
                id="verification_code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={onCancel}
                className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyCode}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Verify
              </button>
            </div>
          </div>
        );

      case 'password_needed':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 mb-4">{authMessage}</p>
            <div className="mb-4">
              <label htmlFor="two_factor_password" className="block text-sm font-medium text-gray-700 mb-1">
                Enter your 2FA password
              </label>
              <input
                type="password"
                id="two_factor_password"
                value={twoFactorPassword}
                onChange={(e) => setTwoFactorPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={onCancel}
                className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPassword}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Verify
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication Successful</h3>
            <p className="text-sm text-gray-500 mb-4">{authMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {renderAuthModalContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthenticationModal;