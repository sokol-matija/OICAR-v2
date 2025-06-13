import { BaseItem, BaseItemCategory, CartItem, OrderItem, User } from './index';

export interface Item extends BaseItem {
  images: ItemImage[];
}

export interface ItemCategory extends BaseItemCategory {}

export interface ItemApprovalRequest {
  itemId: string;
  sellerId: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  requestedAt: Date;
  processedAt?: Date;
}

export interface ItemWithDetails {
  idItem: number;
  itemCategoryID: number;
  categoryName: string;
  title: string;
  description: string;
  stockQuantity: number;
  price: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  sellerUserID?: number;
  sellerName?: string;
  isApproved: boolean;
  itemStatus: string;
  rejectionReason?: string;
  commissionRate?: number;
  platformFee?: number;
  approvalDate?: string;
  approvedByAdminName?: string;
  images: ItemImage[];
  isUserGenerated: boolean;
  needsApproval: boolean;
  itemSource: string;
  estimatedCommission: number;
  estimatedSellerEarnings: number;
  availabilityStatus: string;
  agreeToTerms?: boolean;
  primaryImage?: {
    contentType: string;
    imageData: string;
  };
  imageCount: number;
}

export interface ItemImage {
  idItemImage?: number;
  imageData: string;
  imageOrder: number;
  fileName?: string;
  contentType?: string;
  createdAt: string;
} 