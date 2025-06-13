// Base interfaces without circular dependencies
export interface BaseUser {
  idUser: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  requestedAnonymization: boolean;
  anonymizationRequestDate?: Date;
  anonymizationReason?: string;
  anonymizationNotes?: string;
}

export interface UserListResponse {
  idUser: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  isSeller: boolean;
  requestedAnonymization: boolean;
  anonymizationRequestDate?: Date | null;
  anonymizationReason?: string | null;
  anonymizationNotes?: string | null;
  daysUntilAnonymizationDeadline?: number | null;
  isAnonymizationUrgent: boolean;
  userType: string;
  displayName: string;
  statusIndicator: string;
  isExpanded?: boolean;
}

export interface BaseItem {
  idItem: number;
  itemCategoryId: number;
  sellerUserId?: number;
  title: string;
  description: string;
  stockQuantity: number;
  price: number;
  isActive: boolean;
  isFeatured: boolean;
  isApproved: boolean;
  approvedByAdminId?: number;
  approvalDate?: Date;
  rejectionReason?: string;
  itemStatus: string;
  commissionRate?: number;
  platformFee?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseItemCategory {
  idItemCategory: number;
  categoryName: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface BaseOrder {
  idOrder: number;
  orderNumber: string;
  userId: number;
  statusId: number;
  orderDate: Date;
  shippingAddress?: string;
  billingAddress?: string;
  orderNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseCartItem {
  idCartItem: number;
  userId: number;
  itemId: number;
  quantity: number;
  addedAt: Date;
} 