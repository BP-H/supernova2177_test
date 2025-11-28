
import { SystemMetrics, GraphData, VibeNode, Proposal, AuthResponse, User } from '../types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://supernova2177test-production.up.railway.app').replace(/\/$/, '');

let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

// Fallback Data for Simulation Mode
const FALLBACK_METRICS: SystemMetrics = {
  status: 'simulation',
  timestamp: new Date().toISOString(),
  metrics: {
    total_harmonizers: 1042,
    total_vibenodes: 8503,
    community_wellspring: '54200.50',
    current_system_entropy: 1150.5
  },
  mission: 'To create order and meaning from chaos through collective resonance.'
};

const FALLBACK_GRAPH: GraphData = {
  nodes: Array.from({ length: 15 }, (_, i) => ({
    id: `sim_node_${i}`,
    label: `Resonance Node ${i}`,
    type: Math.random() > 0.7 ? 'harmonizer' : 'vibenode',
    degree_centrality: Math.random(),
    echo: Math.random() * 10
  })),
  edges: Array.from({ length: 20 }, (_, i) => ({
    source: `sim_node_${Math.floor(Math.random() * 15)}`,
    target: `sim_node_${Math.floor(Math.random() * 15)}`,
    type: 'entangled',
    strength: Math.random()
  })),
  metrics: { node_count: 15, edge_count: 20, density: 0.1 }
};

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
    console.warn(`Fetch warning for ${url}:`, error);
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
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Login failed');
      return await response.json();
    } catch (e) {
      console.warn("Live login failed, using demo fallback if applicable");
      // For demo purposes, if the backend login fails, we might throw 
      // to let the UI handle it or provide a simulation token if hardcoded credentials match
      if (username === 'demo') {
        return { access_token: 'demo_token_123', token_type: 'bearer' };
      }
      throw e;
    }
  },

  register: async (user: Partial<User> & { password: string }) => {
    return await fetchJson<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      return await fetchJson<User>('/users/me');
    } catch (e) {
      // Fallback for demo/simulation if live endpoint fails (404/500)
      if (authToken) {
        return {
          id: 999,
          username: 'Traveler',
          species: 'human',
          harmony_score: '100',
          creative_spark: '5000',
          network_centrality: 0.5
        };
      }
      throw e;
    }
  },

  // Content
  getVibeNodes: async (): Promise<VibeNode[]> => {
    // Try to get explicit list, fallback to graph derivation
    try {
      // The backend might not have a clean list endpoint, relying on graph
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
      return [];
    }
  },

  createVibeNode: async (data: Partial<VibeNode>) => {
    return await fetchJson<VibeNode>('/vibenodes/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  likeVibeNode: async (id: number) => {
    try {
      return await fetchJson<{ message: string }>(`/vibenodes/${id}/like`, {
        method: 'POST'
      });
    } catch (e) {
      return { message: 'Simulated Like' };
    }
  },

  // Governance
  getProposals: async (filter?: string, search?: string): Promise<Proposal[]> => {
    try {
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
    } catch {
      return [];
    }
  },

  voteProposal: async (proposalId: number, vote: 'up' | 'down', species: string) => {
    try {
      return await fetchJson<any>('/votes', {
        method: 'POST',
        body: JSON.stringify({
          proposal_id: proposalId,
          choice: vote,
          species: species
        })
      });
    } catch (e) {
      console.warn("Vote simulation");
      return { status: 'simulated' };
    }
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
    try {
      return await fetchJson<SystemMetrics>('/status');
    } catch (e) {
      return FALLBACK_METRICS;
    }
  },

  getNetworkAnalysis: async (limit = 100): Promise<GraphData> => {
    try {
      // Try without trailing slash first if that was an issue, or with slash
      return await fetchJson<GraphData>(`/network-analysis/?limit=${limit}`);
    } catch (e) {
      return FALLBACK_GRAPH;
    }
  }
};
