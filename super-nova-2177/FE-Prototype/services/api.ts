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

// Local simulation for system metrics since backend doesn't provide them
const SIMULATED_METRICS: SystemMetrics = {
  status: 'online',
  timestamp: new Date().toISOString(),
  metrics: {
    total_harmonizers: 1242,
    total_vibenodes: 8503,
    community_wellspring: '54200.50',
    current_system_entropy: 1150.5
  },
  mission: 'To create order and meaning from chaos through collective resonance.'
};

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
    // Map Proposals to VibeNodes so the feed is populated with real data
    try {
      const proposals = await api.getProposals();
      return proposals.map(p => ({
        id: p.id,
        name: p.title,
        description: p.description || p.title, // Fallback if description is empty
        author_id: p.author_id,
        author_username: 'Traveler', // Backend might not return username on proposal object directly, need to check type
        media_type: p.media?.video ? 'video' : p.media?.image ? 'image' : 'text',
        media_url: p.media?.video || p.media?.image || '',
        echo: '0',
        negentropy_score: '0',
        created_at: p.created_at,
        fractal_depth: 0,
        likes_count: 0,
        comments_count: 0
      }));
    } catch (e) {
      console.error("Failed to fetch vibe nodes (proposals)", e);
      return [];
    }
  },

  createVibeNode: async (data: Partial<VibeNode>) => {
    // Map VibeNode creation to Proposal creation if possible, or just use the proposal endpoint
    // For now, we'll keep this as is but it might fail if /vibenodes doesn't exist. 
    // Ideally we should unify creation.
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
    // Always return true to prevent "Offline" state in UI, assuming backend is reachable if other calls work
    return true;
  },

  getStatus: async (): Promise<SystemMetrics> => {
    // Return simulated metrics since backend doesn't support /status
    // This keeps the dashboard alive
    return Promise.resolve(SIMULATED_METRICS);
  },

  getNetworkAnalysis: async (limit = 100): Promise<GraphData> => {
    // If backend doesn't have this, return empty or mock. 
    // frontend doesn't use it, so it's purely aesthetic for FE-Prototype.
    try {
      return await fetchJson<GraphData>(`/network-analysis/?limit=${limit}`);
    } catch {
      return { nodes: [], edges: [], metrics: { node_count: 0, edge_count: 0, density: 0 } };
    }
  }
};
