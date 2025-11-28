
import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Users, Cpu, Briefcase } from 'lucide-react';
import { api } from '../services/api';
import { VoteSummary } from '../types';
import { useAuth } from '../context/AuthContext';

interface VoteControlProps {
   proposalId: number;
   summary: VoteSummary;
   initialUserVote?: 'up' | 'down' | null;
}

export const VoteControl: React.FC<VoteControlProps> = ({ proposalId, summary, initialUserVote }) => {
   const { user } = useAuth();
   const [userVote, setUserVote] = useState(initialUserVote);
   const [isVoting, setIsVoting] = useState(false);

   // Calculate totals
   const humanScore = (summary.up_human || 0) - (summary.down_human || 0);
   const aiScore = (summary.up_ai || 0) - (summary.down_ai || 0);
   const companyScore = (summary.up_company || 0) - (summary.down_company || 0);

   const totalScore = humanScore + aiScore + companyScore;

   const handleVote = async (direction: 'up' | 'down') => {
      if (!user || isVoting) return;
      setIsVoting(true);
      try {
         if (userVote === direction) {
            // Toggle off (remove vote)
            // Assuming backend supports DELETE /votes?proposal_id=... or similar, 
            // OR we just send a 'remove' request if API supports it.
            // Based on frontend LikesDeslikes.jsx, it calls DELETE.
            // We need to implement removeVote in api.ts or use a specific call.
            // For now, let's assume api.voteProposal handles it or we add a remove method.
            // Actually, let's add removeVote to api.ts in next step if not there, 
            // but for now let's try to just set it to null locally and call the API.
            // If api.voteProposal doesn't support removal, we might need to update api.ts.
            // Let's assume we can pass 'remove' or similar, or better yet, use a new method.
            // Wait, I didn't add removeVote to api.ts yet. I should have.
            // Let's use a workaround or just implement it.
            // I'll update api.ts to include removeVote in the next step if needed, 
            // but for now let's just try to toggle.

            // Actually, I'll just skip the API call for removal if I can't do it yet, 
            // but the plan said "Ensure voteProposal handles vote removal".
            // Let's assume I'll fix api.ts to have removeVote.
            await api.removeVote(proposalId);
            setUserVote(null);
         } else {
            await api.voteProposal(proposalId, direction, user.species);
            setUserVote(direction);
         }
      } catch (e) {
         console.error("Vote failed", e);
      } finally {
         setIsVoting(false);
      }
   };

   return (
      <div className="flex flex-col gap-2">
         {/* Visual Bar */}
         <div className="h-1.5 w-full bg-white/10 rounded-full flex overflow-hidden">
            <div style={{ flex: Math.max(0, humanScore) }} className="bg-nova-pink shadow-[0_0_10px_var(--nova-pink)]"></div>
            <div style={{ flex: Math.max(0, aiScore) }} className="bg-nova-acid shadow-[0_0_10px_var(--nova-acid)]"></div>
            <div style={{ flex: Math.max(0, companyScore) }} className="bg-nova-purple shadow-[0_0_10px_var(--nova-purple)]"></div>
         </div>

         <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
               <button
                  onClick={() => handleVote('up')}
                  className={`p-1 rounded hover:bg-white/10 transition-colors ${userVote === 'up' ? 'text-nova-acid' : 'text-gray-400'}`}
               >
                  <ArrowBigUp size={24} className={userVote === 'up' ? 'fill-nova-acid' : ''} />
               </button>
               <span className={`text-xl font-bold font-orbitron ${totalScore >= 0 ? 'text-white' : 'text-red-500'}`}>
                  {totalScore}
               </span>
               <button
                  onClick={() => handleVote('down')}
                  className={`p-1 rounded hover:bg-white/10 transition-colors ${userVote === 'down' ? 'text-red-500' : 'text-gray-400'}`}
               >
                  <ArrowBigDown size={24} className={userVote === 'down' ? 'fill-red-500' : ''} />
               </button>
            </div>

            {/* Breakdown Species Icons */}
            <div className="flex gap-3 text-xs font-mono text-gray-500">
               <div className="flex items-center gap-1" title="Human Score">
                  <Users size={12} className={humanScore > 0 ? "text-nova-pink" : ""} /> {humanScore}
               </div>
               <div className="flex items-center gap-1" title="AI Score">
                  <Cpu size={12} className={aiScore > 0 ? "text-nova-acid" : ""} /> {aiScore}
               </div>
               <div className="flex items-center gap-1" title="Company Score">
                  <Briefcase size={12} className={companyScore > 0 ? "text-nova-purple" : ""} /> {companyScore}
               </div>
            </div>
         </div>
      </div>
   );
};
