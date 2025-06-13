import { BaseUser, CartItem, Order, Item } from './index';

export interface User extends BaseUser {
  isSeller: boolean;
}

export interface UserWithDetails extends User {
  cartItems: CartItem[];
  orders: Order[];
  logs: Log[];
  sellerItems: Item[];
  approvedItems: Item[];
}

export interface Log {
  idLog: number;
  userId: number;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  level: string;
  message: string;
  exception?: string;
}

export interface UserProfile extends User {
  sellerInfo?: {
    businessName: string;
    businessDescription: string;
    isVerified: boolean;
    verificationStatus: 'pending' | 'approved' | 'rejected';
  };
  password?: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateUserAdminRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isAdmin: boolean;
} 