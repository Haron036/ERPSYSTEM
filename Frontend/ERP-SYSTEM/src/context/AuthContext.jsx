import { createContext, useContext, useState, useCallback } from "react";
import { authApi, token } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => token.user());
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(email, password);
      token.set(res.token);
      token.setUser({ email: res.email, fullName: res.fullName, role: res.role });
      setUser({ email: res.email, fullName: res.fullName, role: res.role });
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    token.clearAll();
    setUser(null);
  }, []);

  const isAdmin   = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER" || isAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAdmin, isManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
