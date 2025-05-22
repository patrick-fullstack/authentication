import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

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
            toast.success("OTP sent to your email");
            return;
          }
        } catch (error) {
          // Use type assertion for the error
          const axiosError = error as AxiosError<ApiErrorResponse>;
          toast.error(axiosError.response?.data?.message || "Login failed");
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
            toast.success("OTP sent to your email");
            return;
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          toast.error(
            axiosError.response?.data?.message || "Registration failed"
          );
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (otp, isRegistration = false) => {
        try {
          set({ isLoading: true });
          const tempUserId = get().tempUserId;

          if (!tempUserId) {
            toast.error("Session expired");
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

          if (data.success && data.token) {
            // Store token in Zustand
            set({
              token: data.token,
              user: data.user,
              isAuthenticated: true,
              tempUserId: null,
            });

            // Update Authorization header for future requests
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${data.token}`;

            // ADD THIS: Set token as a cookie that middleware can access
            document.cookie = `token=${data.token}; path=/; max-age=2592000; SameSite=Strict`;

            toast.success(
              isRegistration ? "Registration successful!" : "Login successful!"
            );
            return true;
          }
          return false;
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          toast.error(
            axiosError.response?.data?.message ||
              (isRegistration ? "Registration failed" : "Login failed")
          );
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await api
            .post("/auth/logout")
            .catch((e) => console.error("Logout API error:", e));
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

          // IMPORTANT: Clear the token cookie for middleware
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

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
            toast.success("Password has been reset successfully");
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          toast.error(
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
            toast.success("Password reset instructions sent to your email");
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          toast.error(
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
            toast.success("Profile updated successfully");
          }
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          toast.error(
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
            toast.success("Password updated successfully");
          }
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          toast.error(
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

      partialize: (state) => ({
        token: state.rememberSession ? state.token : null,
        user: state.rememberSession ? state.user : null,
        isAuthenticated: state.rememberSession ? state.isAuthenticated : false,
        rememberSession: state.rememberSession,
      }),
    }
  )
);
