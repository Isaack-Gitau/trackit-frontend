export type UserRole = "user" | "moderator" | "admin";

export type AuthenticatedUser = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
};

export type UserRegisterRequest = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export type UserLoginRequest = {
  identifier: string;
  password: string;
};

export type VerifyEmailRequest = {
  token: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  new_password: string;
};
