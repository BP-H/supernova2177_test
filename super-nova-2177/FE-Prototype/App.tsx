
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { RefreshCcw, Wifi, WifiOff, Plus } from 'lucide-react';

import { Dashboard } from './components/Dashboard';
import { VibeFeed } from './components/VibeFeed';
import { Governance } from './components/Governance';
import { CosmicChat } from './components/CosmicChat';
import { NetworkGraph } from './components/NetworkGraph';
import { Sidebar } from './components/Sidebar';
import { CreatePostModal } from './components/CreatePostModal';
import { api } from './services/api';
import { SystemMetrics, GraphData, VibeNode, Proposal } from './types';
import { useAuth } from './context/AuthContext';

const MainLayout: React.FC = () => {
    const { user, login } = useAuth();

    // Data State
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    const [vibeNodes, setVibeNodes] = useState<VibeNode[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [entropyHistory, setEntropyHistory] = useState<{ name: string, entropy: number }[]>([]);

    // UI State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(false);

    // Auth Form State (Simple inline for demo)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const fetchData = async () => {
        // Don't set full loading on refresh to avoid flickering, just initial load
        if (!metrics) setLoading(true);

        const health = await api.checkHealth();
        setIsOnline(health);

        try {
            // Fetch in parallel but handle failures individually in api service
            const [statusData, netData, nodesData, govData] = await Promise.all([
                api.getStatus(),
                api.getNetworkAnalysis(50),
                api.getVibeNodes(),
                api.getProposals()
            ]);

            setMetrics(statusData);
            setGraphData(netData);
            setVibeNodes(nodesData);
            setProposals(govData);

            // Update history
            setEntropyHistory(prev => {
                const newPoint = {
                    name: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    entropy: statusData.metrics.current_system_entropy
                };
                // Avoid duplicate time points if fetching too fast
                if (prev.length > 0 && prev[prev.length - 1].name === newPoint.name) return prev;

                const newHistory = [...prev, newPoint];
                if (newHistory.length > 20) newHistory.shift(); // Keep last 20 points
                return newHistory;
            });

            if ((statusData.status === 'offline' || statusData.status === 'simulation') && !health) {
                setError("Simulated Reality");
            } else {
                setError(null);
            }
        } catch (error) {
            console.error("System Failure:", error);
            setError("Critical Sync Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
                <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <h1 className="text-3xl font-orbitron font-bold text-center text-white mb-2">SUPERNOVA_2177</h1>
                    <p className="text-center text-gray-400 font-mono text-sm mb-8">Enter the Neural Lattice</p>

                    <input
                        type="text"
                        placeholder="Identity"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mb-4 focus:border-nova-cyan outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Access Code"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white mb-6 focus:border-nova-pink outline-none"
                    />
                    <button
                        onClick={async () => {
                            try {
                                const res = await api.login(username, password);
                                login(res.access_token);
                            } catch {
                                // Demo fallback login
                                if (username) login('demo_token');
                            }
                        }}
                        className="w-full bg-gradient-to-r from-nova-purple to-nova-pink text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform"
                    >
                        Connect
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black text-white pl-24 pr-6 py-6 font-sans">
            <Sidebar />
            <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

            <main className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8 flex justify-between items-end pb-4">
                    <div>
                        <h1 className="text-5xl font-orbitron font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            SUPERNOVA<span className="text-nova-cyan">_2177</span>
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-gray-500 font-mono text-xs uppercase tracking-widest">Resonance Engine v5.0</span>
                            <div className="h-px w-12 bg-gray-800"></div>
                            <span className="text-nova-pink font-mono text-xs uppercase">
                                {isOnline ? 'LIVE FEED' : 'SIMULATION MODE'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-4">
                            <div className={`text-xs font-mono flex items-center gap-2 ${isOnline ? 'text-nova-acid' : 'text-yellow-500'}`}>
                                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                                {isOnline ? 'SYSTEM OPTIMAL' : 'OFFLINE SIMULATION'}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-white text-black hover:bg-nova-cyan hover:scale-105 transition-all p-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                <Routes>
                    <Route path="/" element={
                        <div className="space-y-8 animate-float">
                            {metrics && <Dashboard metrics={metrics} history={entropyHistory} />}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-orbitron text-white">Neural Feed</h3>
                                    </div>
                                    <VibeFeed nodes={vibeNodes} />
                                </div>
                                <div className="space-y-8">
                                    <div className="glass-panel p-1 rounded-2xl">
                                        <NetworkGraph data={graphData || { nodes: [], edges: [], metrics: { node_count: 0, edge_count: 0, density: 0 } }} />
                                    </div>
                                    <CosmicChat />
                                </div>
                            </div>
                        </div>
                    } />
                    <Route path="/vibes" element={<VibeFeed nodes={vibeNodes} />} />
                    <Route path="/nexus" element={<div className="max-w-4xl mx-auto h-[80vh]"><CosmicChat /></div>} />
                    <Route path="/graph" element={<div className="h-[80vh] glass-panel rounded-3xl overflow-hidden"><NetworkGraph data={graphData || { nodes: [], edges: [], metrics: { node_count: 0, edge_count: 0, density: 0 } }} /></div>} />
                    <Route path="/gov" element={<Governance proposals={proposals} />} />
                </Routes>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <MainLayout />
        </HashRouter>
    );
};

export default App;
