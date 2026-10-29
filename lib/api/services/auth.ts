import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export const authService = {
  sync(body: { password: string | null; provider: string }) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.sync,
      data: body,
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
      firebaseAuth: false,
    });
  },

  validateResetToken(token: string) {
    return apiRequest({
      method: "GET",
      url: endpoints.auth.passwordValidate,
      params: { token },
      firebaseAuth: false,
    });
  },

  resetPassword(body: { token: string; password: string; confirmPassword: string }) {
    return apiRequest({
      method: "POST",
      url: endpoints.auth.passwordReset,
      data: body,
      firebaseAuth: false,
    });
  },
};
