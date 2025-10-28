export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  uid: string;
  avatar_url: string;
  provider: string;
}
