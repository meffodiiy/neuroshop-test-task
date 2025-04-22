import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatView from './pages/ChatView';
import AuthContext, { User, AuthContextType } from './context/AuthContext';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const validateToken = async () => {
        try {
          await import('./services/api').then(({ getCurrentUser }) => {
            getCurrentUser()
              .then(() => {
                setUser({ token });
              })
              .catch(() => {
                localStorage.removeItem('token');
              })
              .finally(() => {
                setLoading(false);
              });
          });
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('token');
          setLoading(false);
        }
      };
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string): void => {
    localStorage.setItem('token', token);
    setUser({ token });
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/chats/:accountId/:chatId" element={user ? <ChatView /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
