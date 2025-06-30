import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';
import socketService from '../services/socketService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for existing token on mount
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      setToken(existingToken);
      // You might want to validate the token here
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      
      // Connect to Socket.IO
      socketService.connect(res.token);
    }
    return res;
  };

  const signup = async (data) => {
    return await authApi.signup(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    
    // Disconnect from Socket.IO
    socketService.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 