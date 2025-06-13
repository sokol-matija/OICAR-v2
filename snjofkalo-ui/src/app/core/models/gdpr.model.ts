export interface GDPRRequest {
  id: string;
  userId: string;
  type: 'data_export' | 'anonymization' | 'deletion';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  adminNotes?: string;
}

export interface GDPRDataExport {
  userData: {
    profile: {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      address: string;
    };
    orders: {
      orderId: string;
      items: string[];
      totalAmount: number;
      status: string;
      createdAt: Date;
    }[];
    cartItems: {
      itemId: string;
      quantity: number;
      addedAt: Date;
    }[];
  };
  exportDate: Date;
} 