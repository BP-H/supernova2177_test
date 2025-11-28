/// <reference types="vite/client" />

import { SystemMetrics, GraphData, VibeNode, Proposal, AuthResponse, User } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://supernova2177test-production.up.railway.app').replace(/\/$/, '');

let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Handle unauthorized (logout)
        localStorage.removeItem('token');
        authToken = null;
        throw new Error('Unauthorized');
      }
      throw new Error(`API Error ${response.status}: ${endpoint}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

export const api = {
  setToken: (token: string) => {
    authToken = token;
    localStorage.setItem('token', token);
  },

  logout: () => {
    authToken = null;
    localStorage.removeItem('token');
  },

  // Auth
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Login failed');
    return await response.json();
  },

  register: async (user: Partial<User> & { password: string }) => {
    return await fetchJson<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return await fetchJson<User>('/users/me');
  },

  // Content
  getVibeNodes: async (): Promise<VibeNode[]> => {
    // Try to get explicit list, fallback to graph derivation if needed but prefer real endpoint
    try {
      // Check if there is a direct endpoint, otherwise use graph
      // For now, we will stick to graph derivation but WITHOUT silent fail to empty list if graph fails
      const graph = await api.getNetworkAnalysis(50);
      return graph.nodes
        .filter(n => n.type === 'vibenode')
        .map(n => ({
          id: parseInt(n.id.replace('v_', '')) || Math.floor(Math.random() * 100000),
          name: n.label,
          description: 'Content derived from Neural Lattice.',
          author_id: 0,
          author_username: 'Unknown',
          media_type: 'text',
          echo: (n.echo || 0).toString(),
          negentropy_score: '0',
          created_at: new Date().toISOString(),
          fractal_depth: 0,
          likes_count: 0,
          comments_count: 0
        }));
    } catch (e) {
      console.error("Failed to fetch vibe nodes via graph", e);
      throw e;
    }
  },

  createVibeNode: async (data: Partial<VibeNode>) => {
    return await fetchJson<VibeNode>('/vibenodes/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  likeVibeNode: async (id: number) => {
    return await fetchJson<{ message: string }>(`/vibenodes/${id}/like`, {
      method: 'POST'
    });
  },

  // Governance
  getProposals: async (filter?: string, search?: string): Promise<Proposal[]> => {
    let url = '/proposals';
    const params = new URLSearchParams();

    if (filter && filter !== 'All') {
      const filterMap: Record<string, string> = {
        'Latest': 'latest',
        'Oldest': 'oldest',
        'Top Liked': 'topLikes',
        'Less Liked': 'fewestLikes',
        'Popular': 'popular',
        'AI': 'ai',
        'Company': 'company',
        'Human': 'human'
      };
      if (filterMap[filter]) {
        params.append('filter', filterMap[filter]);
      }
    }

    if (search) {
      params.append('search', search);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return await fetchJson<Proposal[]>(url);
  },

  voteProposal: async (proposalId: number, vote: 'up' | 'down', species: string) => {
    return await fetchJson<any>('/votes', {
      method: 'POST',
      body: JSON.stringify({
        proposal_id: proposalId,
        choice: vote,
        species: species
      })
    });
  },

  createProposal: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/proposals`, {
      method: 'POST',
      body: formData,
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    });

    if (!response.ok) {
      throw new Error('Failed to create proposal');
    }
    return await response.json();
  },

  // System
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/healthz`);
      return res.ok;
    } catch { return false; }
  },

  getStatus: async (): Promise<SystemMetrics> => {
    return await fetchJson<SystemMetrics>('/status');
  },

  getNetworkAnalysis: async (limit = 100): Promise<GraphData> => {
    return await fetchJson<GraphData>(`/network-analysis/?limit=${limit}`);
  }
};
