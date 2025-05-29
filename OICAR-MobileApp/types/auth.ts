export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface UserDTO {
  idUser?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  token: string;
}

export interface AuthError {
  message: string;
} 