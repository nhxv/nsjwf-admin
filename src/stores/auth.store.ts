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
  username: sessionStorage.getItem("username"),
  role: +sessionStorage.getItem("role"),
  token: localStorage.getItem("token"),
  signIn: (resData: SignInResponse) => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    localStorage.removeItem("token");
    sessionStorage.setItem("username", JSON.stringify(resData.username));
    sessionStorage.setItem("role", JSON.stringify(resData.roleId));
    localStorage.setItem("token", resData.token);
    set({ username: sessionStorage.getItem("username") });
    set({ role: +sessionStorage.getItem("role") });
    set({ token: localStorage.getItem("token") });
  },
  signOut: () => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    localStorage.removeItem("token");
    set({ username: null });
    set({ role: null });
    set({ token: null });
  },
}));