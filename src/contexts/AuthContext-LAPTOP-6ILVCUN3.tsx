import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple user setup without Firebase
    const mockUser: User = {
      id: 'test-user-123',
      fullName: 'Test User',
      email: 'test@example.com',
    };
    setUser(mockUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simple sign in - just set the user
    const mockUser: User = {
      id: 'test-user-123',
      fullName: 'Test User',
      email,
    };
    setUser(mockUser);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Simple sign up - just set the user
    const mockUser: User = {
      id: 'test-user-123',
      fullName,
      email,
    };
    setUser(mockUser);
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
