import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, logoutUser, signupUser } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const response = await getCurrentUser();
        if (mounted) {
          setUser(response.data.user);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      signup: async (name, email, password, confirmPassword) => {
        const response = await signupUser(name, email, password, confirmPassword);
        setUser(response.data.user);
        return response;
      },
      login: async (email, password) => {
        const response = await loginUser(email, password);
        setUser(response.data.user);
        return response;
      },
      logout: async () => {
        await logoutUser();
        setUser(null);
      },
      refreshUser: async () => {
        const response = await getCurrentUser();
        setUser(response.data.user);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
