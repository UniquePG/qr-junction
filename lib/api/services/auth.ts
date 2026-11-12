import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const authService = {
  register(body: { email: string; password: string; name?: string }) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.register,
      data: body,
      requireAuth: false,
    });
  },

  login(body: { email: string; password: string }) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.login,
      data: body,
      requireAuth: false,
    });
  },

  adminLogin(body: { email: string; password: string }) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.adminLogin,
      data: body,
      requireAuth: false,
    });
  },

  logout() {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.logout,
      requireAuth: false,
    });
  },

  me() {
    return apiRequest({
      method: "GET",
      url: endpoints.auth.me,
      requireAuth: false,
    });
  },

  google(idToken: string) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.google,
      data: {},
      requireAuth: false,
      firebaseIdToken: idToken,
    });
  },

  /** @deprecated Use google() */
  sync(body: { password: string | null; provider: string }) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.sync,
      data: body,
      requireAuth: false,
    });
  },

  sendOtp() {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.otpSend,
    });
  },

  verifyOtp(code: string) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.otpVerify,
      data: { code },
    });
  },

  forgotPassword(email: string) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.passwordForgot,
      data: { email },
      requireAuth: false,
    });
  },

  validateResetToken(token: string) {
    return apiRequest({
      method: "GET",
      url: endpoints.auth.passwordValidate,
      params: { token },
      requireAuth: false,
    });
  },

  resetPassword(body: { token: string; password: string; confirmPassword: string }) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.passwordReset,
      data: body,
      requireAuth: false,
    });
  },

  changePassword(body: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.passwordChange,
      data: body,
    });
  },
};
