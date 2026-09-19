const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ApiClient {
  private getHeaders(token?: string | null): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T = any>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      token?: string | null;
      query?: Record<string, string | number | undefined>;
    } = {}
  ): Promise<ApiResponse<T>> {
    let url = `${API_BASE_URL}${endpoint}`;
    if (options.query) {
      const params = new URLSearchParams();
      Object.entries(options.query).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, String(val));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: this.getHeaders(options.token),
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const json = await response.json();
      if (!response.ok && !json.error) {
        return {
          success: false,
          error: {
            code: 'HTTP_ERROR',
            message: `Server returned HTTP status ${response.status}`,
          },
        };
      }

      return json;
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: err?.message || 'Failed to connect to BloodBridge API server',
        },
      };
    }
  }

  // Health Endpoint
  async getHealth() {
    return this.request<{ status: string; database: string }>('/api/health');
  }

  // Auth APIs
  async syncUser(token: string, payload: { name: string; role: 'DONOR' | 'HOSPITAL' | 'ADMIN'; phone?: string }) {
    return this.request<any>('/api/auth/sync', { method: 'POST', body: payload, token });
  }

  async getMe(token: string) {
    return this.request<any>('/api/auth/me', { token });
  }

  // Donor APIs
  async createDonorProfile(token: string, payload: any) {
    return this.request<any>('/api/donors', { method: 'POST', body: payload, token });
  }

  async getMyDonorProfile(token: string) {
    return this.request<any>('/api/donors/me', { token });
  }

  async updateMyDonorProfile(token: string, payload: any) {
    return this.request<any>('/api/donors/me', { method: 'PATCH', body: payload, token });
  }

  async updateDonorAvailability(token: string, availabilityStatus: 'AVAILABLE' | 'UNAVAILABLE' | 'PAUSED') {
    return this.request<any>('/api/donors/me/availability', {
      method: 'PATCH',
      body: { availabilityStatus },
      token,
    });
  }

  // Hospital APIs
  async createHospitalProfile(token: string, payload: any) {
    return this.request<any>('/api/hospitals', { method: 'POST', body: payload, token });
  }

  async getMyHospitalProfile(token: string) {
    return this.request<any>('/api/hospitals/me', { token });
  }

  async updateMyHospitalProfile(token: string, payload: any) {
    return this.request<any>('/api/hospitals/me', { method: 'PATCH', body: payload, token });
  }

  // Blood Request APIs
  async createBloodRequest(token: string, payload: any) {
    return this.request<any>('/api/requests', { method: 'POST', body: payload, token });
  }

  async getBloodRequests(query?: any) {
    return this.request<any[]>('/api/requests', { query });
  }

  async getBloodRequestById(id: string) {
    return this.request<any>(`/api/requests/${id}`);
  }

  async updateRequestStatus(token: string, id: string, status: string) {
    return this.request<any>(`/api/requests/${id}/status`, {
      method: 'PATCH',
      body: { status },
      token,
    });
  }

  // Matching APIs
  async runMatchingForRequest(token: string, requestId: string) {
    return this.request<{ requestId: string; totalMatches: number; matches: any[] }>(`/api/requests/${requestId}/match`, {
      method: 'POST',
      token,
    });
  }

  async getMatchesForRequest(token: string, requestId: string) {
    return this.request<{ requestId: string; matches: any[] }>(`/api/requests/${requestId}/matches`, { token });
  }

  async acceptMatch(token: string, matchId: string) {
    return this.request<any>(`/api/matches/${matchId}/accept`, { method: 'POST', token });
  }

  async rejectMatch(token: string, matchId: string) {
    return this.request<any>(`/api/matches/${matchId}/reject`, { method: 'POST', token });
  }
}

export const api = new ApiClient();
