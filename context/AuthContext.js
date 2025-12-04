'use client';
import { createContext, useContext, useState, useEffect } from "react";
import { loginAPI } from "@/services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved user on page refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const data = await loginAPI(email, password, role);

      // Profile from backend
      const userData = {
        id: data.profile.id,
        name: data.profile.name,
        email: data.profile.email,
        role: data.profile.role,
      };

      // Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", data.profile.role);

      setUser(userData);

      return { success: true, role: data.profile.role };

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed";

      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // Add this function to check authentication
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    return !!(token && savedUser);
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