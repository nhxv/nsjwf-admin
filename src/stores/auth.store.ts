import { SignInResponse } from './../models/sign-in-response.model';
import create from "zustand";

interface AuthState {
  username: string,
  role: number,
  token: string,
  signIn: (data: SignInResponse) => void,
  signOut: () => void,
}

export const useAuthStore = create<AuthState>((set) => ({
  username: localStorage.getItem("username"),
  role: +localStorage.getItem("role"),
  token: localStorage.getItem("token"),
  signIn: (resData: SignInResponse) => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.setItem("username", JSON.stringify(resData.username));
    localStorage.setItem("role", JSON.stringify(resData.roleId));
    localStorage.setItem("token", resData.token);
    set({ username: localStorage.getItem("username") });
    set({ role: +localStorage.getItem("role") });
    set({ token: localStorage.getItem("token") });
  },
  signOut: () => {
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    set({ username: null });
    set({ role: null });
    set({ token: null });
  },
}));