'use client';
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Simple authentication logic
    if (email === 'ali@gmail.com' && password === '123') {
      setUser({ role: 'admin', name: 'Admin User' });
      return true;
    } else if (email === 'accountant@school.com' && password === 'accountant123') {
      setUser({ role: 'accountant', name: 'Accountant User' });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}