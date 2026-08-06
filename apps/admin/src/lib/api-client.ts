/**
 * API Client - Centralized HTTP client for admin panel
 * Uses environment variables for base URL configuration
 * Handles authentication, error responses, and request/response formatting
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

interface RequestOptions extends RequestInit {
  throwOnError?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Use NEXT_PUBLIC_API_URL or fallback to localhost for development
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  }

  /**
   * Get authorization token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Build headers with authentication
   */
  private getHeaders(headers?: HeadersInit): HeadersInit {
    const token = this.getToken();
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    return {
      ...defaultHeaders,
      ...headers,
    };
  }

  /**
   * Make a request to the API
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { throwOnError = true, ...fetchOptions } = options;

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: this.getHeaders(fetchOptions.headers),
      });

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error = new Error(
          data?.error?.message || data?.message || 'API Error'
        );
        (error as any).status = response.status;
        (error as any).data = data;

        if (throwOnError) {
          throw error;
        }

        return {
          success: false,
          error: data?.error || { message: error.message },
        } as any;
      }

      return data.data || data;
    } catch (error) {
      if (throwOnError) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * File upload
   */
  async uploadFile(
    endpoint: string,
    file: File,
    options?: RequestOptions
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers: HeadersInit = token
      ? { 'Authorization': `Bearer ${token}` }
      : {};

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Singleton instance
export const apiClient = new ApiClient();

/**
 * Hook for using API client in components
 * Usage:
 *   const api = useApi();
 *   const data = await api.get('/entities');
 */
export function useApi() {
  return apiClient;
}
