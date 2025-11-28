
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Radio, MessageSquare, Network, Globe, LogOut, User as UserIcon, Bot, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LiquidGlass } from './LiquidGlass';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout, updateSpecies } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Dash', icon: LayoutDashboard },
    { path: '/vibes', label: 'Vibes', icon: Radio },
    { path: '/nexus', label: 'Nexus', icon: MessageSquare },
    { path: '/graph', label: 'Graph', icon: Network },
    { path: '/gov', label: 'Gov', icon: Globe },
  ];

  return (
    <LiquidGlass className="fixed left-4 top-4 bottom-4 w-20 rounded-3xl flex flex-col items-center py-8 z-50">
      <div className="mb-8 relative group cursor-pointer">
        <div className="w-10 h-10 bg-gradient-to-br from-nova-purple to-nova-pink rounded-xl animate-spin-slow shadow-[0_0_20px_rgba(242,0,137,0.5)]"></div>
      </div>
      
      <div className="flex-1 w-full space-y-4 flex flex-col items-center">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`p-3 rounded-xl transition-all duration-300 group relative ${isActive ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={24} />
              <div className="absolute left-16 bg-black/80 backdrop-blur border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-mono whitespace-nowrap z-50 pointer-events-none translate-x-2 group-hover:translate-x-0 duration-200">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-4 w-full flex flex-col items-center">
         {user && (
             <div className="group relative">
                 <button className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                     user.species === 'ai' ? 'border-nova-acid text-nova-acid bg-nova-acid/10' :
                     user.species === 'company' ? 'border-nova-purple text-nova-purple bg-nova-purple/10' :
                     'border-nova-pink text-nova-pink bg-nova-pink/10'
                 }`}>
                     {user.species === 'ai' ? <Bot size={20} /> : user.species === 'company' ? <Building2 size={20} /> : <UserIcon size={20} />}
                 </button>
                 
                 {/* Species Selector Tooltip */}
                 <div className="absolute left-14 bottom-0 bg-black/90 backdrop-blur border border-white/20 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible w-32 space-y-1">
                     <p className="text-[10px] text-gray-400 uppercase font-mono mb-1 text-center">Select Species</p>
                     <button onClick={() => updateSpecies('human')} className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-white/10 text-xs text-nova-pink"><UserIcon size={12}/> Human</button>
                     <button onClick={() => updateSpecies('ai')} className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-white/10 text-xs text-nova-acid"><Bot size={12}/> AI</button>
                     <button onClick={() => updateSpecies('company')} className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-white/10 text-xs text-nova-purple"><Building2 size={12}/> Company</button>
                 </div>
             </div>
         )}
         
         <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors p-2">
            <LogOut size={20} />
         </button>
      </div>
    </LiquidGlass>
  );
};
