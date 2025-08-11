export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Optional for Google OAuth users
  googleId?: string; // Google OAuth ID
  avatar?: string; // Profile picture URL
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
  password?: string;
  googleId?: string;
  avatar?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleAuthData {
  idToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
} 