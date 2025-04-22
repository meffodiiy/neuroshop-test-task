import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  title: string;
  showBackButton?: boolean;
  showLogoutButton?: boolean;
  onLogout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  title, 
  showBackButton = false, 
  showLogoutButton = false, 
  onLogout 
}) => {
  const navigate = useNavigate();

  const handleBack = (): void => {
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {showBackButton ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  ← Back to Dashboard
                </button>
              ) : (
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              )}
            </div>
          </div>
          {showLogoutButton && onLogout && (
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;