import { apiRequest } from "./client";
import type {
  AuthenticatedUser,
  ForgotPasswordRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  TokenResponse,
  UserLoginRequest,
  UserRegisterRequest,
  VerifyEmailRequest,
} from "../types/auth";

export async function registerUser(
  data: UserRegisterRequest,
): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>({
    method: "POST",
    path: "/api/auth/register",
    body: data,
  });
}

export async function loginUser(
  data: UserLoginRequest,
): Promise<TokenResponse> {
  return apiRequest<TokenResponse>({
    method: "POST",
    path: "/api/auth/login",
    body: data,
  });
}

export async function getCurrentUser(
  accessToken: string,
): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>({
    method: "GET",
    path: "/api/auth/me",
    accessToken,
  });
}

export async function verifyEmail(
  data: VerifyEmailRequest,
): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>({
    method: "POST",
    path: "/api/auth/verify-email",
    body: data,
  });
}

export async function resendVerification(
  data: ResendVerificationRequest,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({
    method: "POST",
    path: "/api/auth/resend-verification",
    body: data,
  });
}

export async function requestPasswordReset(
  data: ForgotPasswordRequest,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({
    method: "POST",
    path: "/api/auth/forgot-password",
    body: data,
  });
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>({
    method: "POST",
    path: "/api/auth/reset-password",
    body: data,
  });
}
