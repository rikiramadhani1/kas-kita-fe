import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../service/api";

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  user: any;
  login: (identifier: string, secret: string, isAdmin?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load token + user di awal
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (
    identifier: string,
    secret: string,
    isAdmin: boolean = false
  ) => {
    try {
      localStorage.clear();

      const endpoint = isAdmin ? "/auth/admin" : "/auth";
      const payload = isAdmin
        ? { email: identifier, password: secret }
        : { phone: identifier, pin: secret };

      const res = await api.post(endpoint, payload);

      const { accessToken, refreshToken, user: userDataFromAPI } = res.data.data;

      // simpan token & user
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userDataFromAPI));
      setUser(userDataFromAPI);

      setIsLoggedIn(true);
    } catch (err: any) {
      throw new Error(err.response?.data?.meta?.message || "Login gagal");
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

