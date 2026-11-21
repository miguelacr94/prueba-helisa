import type { ApiErrorResponse, ApiSuccessResponse } from './api-types';

export class ApiException extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface HttpRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiPrefix: string;

  constructor() {
    const rawBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    this.baseUrl = rawBase.replace(/\/$/, '');
    const rawPrefix = import.meta.env.VITE_API_PREFIX ?? '/api/v1';
    this.apiPrefix = rawPrefix.startsWith('/') ? rawPrefix : `/${rawPrefix}`;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullPath =
      cleanPath.startsWith(this.apiPrefix) || cleanPath.startsWith('/api/')
        ? cleanPath
        : `${this.apiPrefix}${cleanPath}`;
    const url = new URL(`${this.baseUrl}${fullPath}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    const { params, headers, ...init } = options;
    const url = this.buildUrl(path, params);

    const mergedHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...init,
        headers: mergedHeaders,
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!response.ok) {
        if (isJson) {
          const errorBody = (await response.json()) as ApiErrorResponse;
          throw new ApiException(
            errorBody.error?.code || 'UNKNOWN_ERROR',
            errorBody.error?.message || response.statusText || 'Error en la solicitud',
            response.status,
            errorBody.error?.details,
          );
        }
        const text = await response.text();
        throw new ApiException('HTTP_ERROR', text || response.statusText, response.status);
      }

      if (!isJson) {
        return (await response.text()) as unknown as T;
      }

      const body = (await response.json()) as ApiSuccessResponse<T> | T;

      if (typeof body === 'object' && body !== null && 'success' in body && 'data' in body) {
        return (body as ApiSuccessResponse<T>).data;
      }

      return body as T;
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        throw err;
      }
      throw new ApiException(
        'NETWORK_ERROR',
        err instanceof Error ? err.message : 'No se pudo conectar con el servidor',
        0,
      );
    }
  }

  get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
