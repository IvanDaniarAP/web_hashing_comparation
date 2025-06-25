import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface User {
  uid: string;
  email: string;
  displayName: string;
  walletAddress?: string;
  createdAt: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (token && userData && tokenExpiry) {
      const now = new Date().getTime();
      const expiry = parseInt(tokenExpiry);
      
      if (now < expiry) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('tokenExpiry');
        }
      } else {
        // Token expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        toast.error('Session expired. Please sign in again.');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const response = await authAPI.register({ email, password, displayName });
      const { user: userData, token } = response.data;
      
      // Set token expiry to 30 minutes from now
      const expiry = new Date().getTime() + (30 * 60 * 1000);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokenExpiry', expiry.toString());
      setUser(userData);
      
      toast.success('Account created successfully! You received 100 SUSD!');
      navigate('/dashboard');
      return userData;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token } = response.data;
      
      // Set token expiry to 30 minutes from now
      const expiry = new Date().getTime() + (30 * 60 * 1000);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokenExpiry', expiry.toString());
      setUser(userData);
      
      toast.success('Signed in successfully!');
      navigate('/dashboard');
      return userData;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      setUser(null);
      toast.success('Signed out successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authAPI.resetPassword({ email });
      toast.success('Password reset email sent!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      throw error;
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    logOut,
    resetPassword
  };
};