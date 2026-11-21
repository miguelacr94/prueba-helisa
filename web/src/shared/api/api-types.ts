export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

