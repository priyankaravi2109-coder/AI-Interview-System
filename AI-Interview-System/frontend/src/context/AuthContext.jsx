import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("ai_interview_user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("ai_interview_user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);

      const loggedInUser = data.user || data;

      setUser(loggedInUser);

      localStorage.setItem(
        "ai_interview_user",
        JSON.stringify(loggedInUser)
      );

      if (data.token) {
        localStorage.setItem("ai_interview_token", data.token);
      }

      return {
        success: true,
        user: loggedInUser,
      };
    } catch (error) {
      console.error("Login failed:", error);

      const message =
        error?.response?.data?.message ||
        "Invalid email or password.";

      return {
        success: false,
        message,
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);

      localStorage.removeItem("ai_interview_user");
      localStorage.removeItem("ai_interview_token");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}