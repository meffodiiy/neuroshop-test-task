import { createContext } from 'react';

export type User = {
  token: string;
}

export type AuthContextType = {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export default AuthContext;
