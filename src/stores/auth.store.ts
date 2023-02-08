import { SignInResponse } from './../models/sign-in-response.model';
import { create } from "zustand";

interface AuthState {
  nickname: string,
  role: number,
  token: string,
  signIn: (data: SignInResponse) => void,
  signOut: () => void,
}

export const useAuthStore = create<AuthState>((set) => ({
  nickname: localStorage.getItem("nickname"),
  role: +localStorage.getItem("role"),
  token: localStorage.getItem("token"),
  signIn: (resData: SignInResponse) => {
    localStorage.removeItem("nickname");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.setItem("nickname", JSON.stringify(resData.nickname));
    localStorage.setItem("role", JSON.stringify(resData.roleId));
    localStorage.setItem("token", resData.token);
    set({ nickname: localStorage.getItem("nickname") });
    set({ role: +localStorage.getItem("role") });
    set({ token: localStorage.getItem("token") });
  },
  signOut: () => {
    localStorage.removeItem("nickname");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    set({ nickname: null });
    set({ role: null });
    set({ token: null });
  },
}));