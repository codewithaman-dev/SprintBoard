import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then((result) => setUser(result.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async signIn(credentials) {
      const result = await authApi.login(credentials);
      setUser(result.user);
      return result.user;
    },
    async signUp(details) {
      const result = await authApi.register(details);
      setUser(result.user);
      return result.user;
    },
    async signOut() {
      await authApi.logout();
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
