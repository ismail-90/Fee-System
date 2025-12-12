'use client';
import { createContext, useContext, useState, useEffect } from "react";
import { loginAPI } from "@/services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  

  // Load saved user on page refresh
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          clearAuthData();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Add event listener for storage changes (other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password, role) => {
    try {
      const data = await loginAPI(email, password, role);

      const userData = {
        id: data.profile.id,
        name: data.profile.name,
        email: data.profile.email,
        role: data.profile.role,
      };

      // Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      setUser(userData);

      return { 
        success: true, 
        role: data.profile.role,
        user: userData 
      };

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed";

      return { success: false, message: msg };
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    window.location.href = '/';
  };

  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem("token");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAuthenticated: isAuthenticated() 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}