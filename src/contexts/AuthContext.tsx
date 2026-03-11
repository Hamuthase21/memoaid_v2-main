import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://192.168.1.4:5000/api'; // Updated for mobile access

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to restore user from localStorage
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setError(null);
      } catch (err) {
        setError('Failed to restore user session');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const userData: User = {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
      };

      setUser(userData);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (err) {
      console.error('Sign in error:', err);
      let errorMessage = 'Sign in failed';

      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage = 'Network error: Unable to connect to server. Please check your internet connection and ensure the server is running.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Sign up failed');
      }

      const data = await response.json();
      const userData: User = {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
      };

      setUser(userData);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      throw err;
    }
  };

  const signOut = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
