export interface User {
  id: string;
  name?: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  userId?: string;
}
