import api from "./api";

export interface LoginPayload {
  phone: string;
  pin: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: any;
}

export const loginAPI = async (payload: LoginPayload): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", payload);
  return res.data.data; // disesuaikan dengan struktur respons backend kamu
};
