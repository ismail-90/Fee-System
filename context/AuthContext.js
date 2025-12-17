'use client';
import { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, getProfileAPI } from "@/services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔹 Initialize Auth (ONCE) */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // 🔥 FETCH FULL PROFILE (campus yahan se ayega)
          const profileRes = await getProfileAPI();

          const fullUser = {
            ...parsedUser,
            campus: profileRes.campus,
          };

          setUser(fullUser);
          localStorage.setItem("user", JSON.stringify(fullUser));
        } catch (error) {
          console.error("Auth init error:", error);
          clearAuthData();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /* 🔹 LOGIN */
  const login = async (email, password, role) => {
    try {
      const data = await loginAPI(email, password, role);

      const basicUser = {
        id: data.profile.id,
        name: data.profile.name,
        email: data.profile.email,
        role: data.profile.role,
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(basicUser));
      setUser(basicUser);

      // 🔥 Immediately fetch profile + campus
      const profileRes = await getProfileAPI();

      const fullUser = {
        ...basicUser,
        campus: profileRes.campus,
      };

      setUser(fullUser);
      localStorage.setItem("user", JSON.stringify(fullUser));

      return { success: true, role: fullUser.role };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  /* 🔹 LOGOUT */
  const logout = () => {
    clearAuthData();
    setUser(null);
    window.location.href = "/";
  };

  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAuthenticated = !!user && !!localStorage.getItem("token");

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
