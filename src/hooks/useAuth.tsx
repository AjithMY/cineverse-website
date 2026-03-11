import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe().then((res) => {
      if (res.user) setUser(res.user);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const login = async (credentials: any) => {
    const res = await api.login(credentials);
    if (res.user) setUser(res.user);
    else throw new Error(res.error);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    if (res.user) setUser(res.user);
    else throw new Error(res.error);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateProfile = async (data: any) => {
    const res = await api.updateProfile(data);
    if (res.user) setUser(res.user);
    else throw new Error(res.error);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
