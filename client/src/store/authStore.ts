import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";
import { AxiosError } from "axios";
import Cookies from "js-cookie";
import { createJSONStorage } from "zustand/middleware";
import { StateStorage } from "zustand/middleware";
import { authToast } from "@/utils/toast";

const cookieStorage: StateStorage = {
  getItem: (name: string) => {
    const cookie = Cookies.get(name);
    if (cookie) {
      return cookie;
    }
    return null;
  },
  setItem: (name: string, value: string) => {
    try {
      // Parse the value to get rememberSession
      const { state } = JSON.parse(value);

      // Set cookie with appropriate expiration
      const expires = state.rememberSession ? 30 : undefined; // 30 days or session cookie
      Cookies.set(name, value, {
        expires: expires,
        path: "/",
        sameSite: "strict",
      });
    } catch (error) {
      console.error("Error saving to cookie storage:", error);
    }
  },
  removeItem: (name: string) => {
    Cookies.remove(name, { path: "/" });
  },
};

interface User {
  id: string;
  email: string;
  name?: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
}

interface AuthState {
  // Auth state
  token: string | null;
  user: User | null;
  tempUserId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberSession: boolean;
  updateProfile: (name: string) => Promise<boolean>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;

  // Auth actions
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyOtp: (otp: string, isRegistration?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setRememberSession: (remember: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      user: null,
      tempUserId: null,
      isAuthenticated: false,
      isLoading: false,
      rememberSession: false,

      // Auth actions
      login: async (email, password, rememberMe = false) => {
        try {
          set({ isLoading: true, rememberSession: rememberMe });
          const { data } = await api.post("/auth/login", { email, password });

          if (data.success && data.userId) {
            set({ tempUserId: data.userId });
            authToast.otpSent(); // Updated to use our custom toast
            return;
          }
        } catch (error) {
          // Use type assertion for the error
          const axiosError = error as AxiosError<ApiErrorResponse>;
          authToast.error(axiosError.response?.data?.message || "Login failed");
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        try {
          set({ isLoading: true });
          const { data } = await api.post("/auth/register", {
            name,
            email,
            password,
          });

          if (data.success && data.userId) {
            set({ tempUserId: data.userId });
            authToast.otpSent(); // Updated to use our custom toast
            return;
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          authToast.error(
            axiosError.response?.data?.message || "Registration failed"
          );
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (otp, isRegistration = false) => {
        set({ isLoading: true });
        try {
          const tempUserId = get().tempUserId;

          if (!tempUserId) {
            authToast.error("Session expired");
            throw new Error("No temporary user ID found");
          }

          // Use appropriate endpoint based on registration or login
          const endpoint = isRegistration
            ? "/auth/verify-registration"
            : "/auth/verify-login";

          const { data } = await api.post(endpoint, {
            userId: tempUserId,
            otp,
          });

          // Set token in API headers
          api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

          // Set authentication token cookie
          // This is separate from the Zustand state cookie
          const expires = get().rememberSession ? 30 : undefined; // days or session cookie
          Cookies.set("token", data.token, {
            expires: expires,
            path: "/",
            sameSite: "strict",
          });

          // Set in Zustand state
          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            tempUserId: null,
          });

          // Use different toast messages based on action
          if (isRegistration) {
            authToast.registerSuccess();
          } else {
            authToast.loginSuccess();
          }
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          authToast.error(
            axiosError.response?.data?.message ||
              (isRegistration ? "Registration failed" : "Login failed")
          );
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await api
            .post("/auth/logout")
            .catch((e) => console.error("Logout API error:", e));

          // Show logout toast notification
          authToast.logout();
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          // Clear auth state
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            tempUserId: null,
          });

          // Remove Authorization header
          delete api.defaults.headers.common["Authorization"];

          // Remove all auth cookies
          Cookies.remove("token", { path: "/" });
          Cookies.remove("auth-storage", { path: "/" });

          set({ isLoading: false });
        }
      },

      resetPassword: async (token, password) => {
        try {
          set({ isLoading: true });
          const { data } = await api.post(`/auth/reset-password/${token}`, {
            password,
          });

          if (data.success) {
            authToast.passwordReset();
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          authToast.error(
            axiosError.response?.data?.message || "Password reset failed"
          );
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      forgotPassword: async (email) => {
        try {
          set({ isLoading: true });
          const { data } = await api.post("/auth/forgot-password", { email });

          if (data.success) {
            authToast.info("Password reset instructions sent to your email");
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          authToast.error(
            axiosError.response?.data?.message ||
              "Forgot password request failed"
          );
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (name: string) => {
        try {
          set({ isLoading: true });
          const { data } = await api.put("/auth/profile", { name });

          if (data.success && data.user) {
            // Update the user in store
            set({
              user: data.user,
            });
            authToast.success("Profile updated successfully");
          }
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          authToast.error(
            axiosError.response?.data?.message || "Failed to update profile"
          );
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        try {
          set({ isLoading: true });
          const { data } = await api.put("/auth/password", {
            currentPassword,
            newPassword,
          });

          if (data.success) {
            authToast.success("Password updated successfully");
          }
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          authToast.error(
            axiosError.response?.data?.message || "Failed to update password"
          );
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return false;
        }

        try {
          set({ isLoading: true });
          // Set Authorization header with token from store
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const { data } = await api.get("/auth/me");
          console.log("Auth check response:", data);

          if (data.success && data.user) {
            set({ user: data.user, isAuthenticated: true });
            return true;
          } else {
            // If user data can't be fetched, clear auth state
            set({ token: null, user: null, isAuthenticated: false });
            delete api.defaults.headers.common["Authorization"];

            // Clear the token cookie
            document.cookie =
              "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

            return false;
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          // Handle authentication error
          set({ token: null, user: null, isAuthenticated: false });
          delete api.defaults.headers.common["Authorization"];

          // Clear the token cookie
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      setRememberSession: (remember) => set({ rememberSession: remember }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => cookieStorage),

      // Store everything regardless of rememberSession
      // The expiration handling is done in the cookie storage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberSession: state.rememberSession,
      }),
    }
  )
);
