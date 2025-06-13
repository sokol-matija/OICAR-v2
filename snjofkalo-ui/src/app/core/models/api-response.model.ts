export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: any | null;
}

export interface PagedApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T;
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  errors: any | null;
} 