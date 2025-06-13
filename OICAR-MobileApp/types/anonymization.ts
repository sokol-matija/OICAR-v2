export interface AnonymizationRequest {
  idRequest?: number;
  userID: number;
  reason: string;
  requestDate: string; // ISO date string
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  processedDate?: string; // ISO date string
  notes?: string;
}

export interface CreateAnonymizationRequest {
  reason: string;
  notes?: string;
}

export interface AnonymizationResponse {
  success: boolean;
  data?: AnonymizationRequest;
  message?: string;
  errors?: string[];
}

export interface UserProfileWithAnonymization {
  idUser: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isAdmin?: boolean;
  hasAnonymizationRequest?: boolean;
  anonymizationRequest?: AnonymizationRequest;
} 