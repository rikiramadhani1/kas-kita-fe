import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../service/api";

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  user: any;
  login: (phone: string, pin: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

  const login = async (phone: string, pin: string) => {
    try {
      localStorage.clear(); // hapus token lama

      const res = await api.post("/auth", { phone, pin });

      console.log("🔥 LOGIN RESPONSE:", res.data); // tambahkan ini
      
      const { accessToken, refreshToken } = res.data.data;

      // simpan token
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setIsLoggedIn(true);
      setUser(res.data.data.user || null);
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

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


