export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  confirmPassword?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokens {
  access_token: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  uid: string;
  avatar_url: string;
  provider: string;
}
