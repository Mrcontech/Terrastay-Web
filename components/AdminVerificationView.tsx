
import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle, Search, Building2, MapPin, Loader2, Home, Filter, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lodge } from '../types';

const AdminVerificationView: React.FC = () => {
    const [lodges, setLodges] = useState<Lodge[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'lodges' | 'agents'>('lodges');

    useEffect(() => {
        if (viewMode === 'lodges') {
            fetchPendingLodges();
        } else {
            fetchPendingAgents();
        }
    }, [viewMode]);

    const fetchPendingAgents = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('verification_status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAgents(data || []);
        } catch (error) {
            console.error('Error fetching pending agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingLodges = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('lodges')
                .select('*')
                .eq('is_verified', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLodges(data || []);
        } catch (error) {
            console.error('Error fetching pending lodges:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (lodgeId: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') {
                const { error } = await supabase
                    .from('lodges')
                    .update({ is_verified: true })
                    .eq('id', lodgeId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('lodges')
                    .delete()
                    .eq('id', lodgeId);
                if (error) throw error;
            }
            setLodges(prev => prev.filter(l => l.id !== lodgeId));
        } catch (error) {
            console.error(`Error during ${action}:`, error);
        }
    };

    const handleAgentAction = async (agentId: string, action: 'approve' | 'reject') => {
        try {
            const updates = action === 'approve'
                ? { verification_status: 'approved', is_identity_verified: true }
                : { verification_status: 'rejected', is_identity_verified: false };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', agentId);

            if (error) throw error;
            setAgents(prev => prev.filter(a => a.id !== agentId));
        } catch (error) {
            console.error(`Error during agent ${action}:`, error);
        }
    };

    const filteredLodges = lodges.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.area.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredAgents = agents.filter(a =>
        (a.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.nin || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#c0ff72] mb-4" size={40} />
                <p className="text-gray-500 font-medium">Loading verification queue...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        {viewMode === 'lodges' ? 'Property Verification' : 'Agent Identity Verification'}
                        <span className="bg-yellow-400/10 text-yellow-400 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black">
                            {viewMode === 'lodges' ? lodges.length : agents.length} Pending
                        </span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {viewMode === 'lodges'
                            ? 'Review and approve new property listings for the mobile app.'
                            : 'Verify the identity of agents through NIN and Selfie documents.'}
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex bg-[#16181b] p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setViewMode('lodges')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'lodges' ? 'bg-[#c0ff72] text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Properties
                        </button>
                        <button
                            onClick={() => setViewMode('agents')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'agents' ? 'bg-[#c0ff72] text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Agents
                        </button>
                    </div>

                    <div className="relative flex-1 sm:w-64 sm:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder={viewMode === 'lodges' ? "Search properties..." : "Search agents by name/NIN..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#16181b] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
                        />
                    </div>
                </div>
            </div>

            {viewMode === 'lodges' ? (
                filteredLodges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-[#16181b] rounded-[3rem] border border-white/5">
                        <ShieldCheck size={64} className="text-gray-800 mb-6" />
                        <h3 className="text-xl font-bold text-gray-300">All Caught Up!</h3>
                        <p className="text-gray-500 max-w-sm mt-2">There are no new properties waiting for verification at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* ... existing lodge map ... */}
                        {filteredLodges.map((lodge) => (
                            <div key={lodge.id} className="bg-[#16181b] rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-[#c0ff72]/20 transition-all flex flex-col md:flex-row">
                                {/* Image Preview */}
                                <div className="w-full md:w-48 h-48 bg-[#212429] relative overflow-hidden">
                                    {lodge.image_urls && lodge.image_urls.length > 0 ? (
                                        <img src={lodge.image_urls[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                            <Building2 size={40} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-black/60 backdrop-blur-md text-[9px] font-bold text-white px-2 py-1 rounded-lg uppercase tracking-wider">
                                            New Listing
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-8 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold group-hover:text-[#c0ff72] transition-colors">{lodge.title}</h3>
                                            <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1">
                                                <MapPin size={12} /> {lodge.area}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#c0ff72] font-black text-xl leading-none">{lodge.price}</p>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter mt-1">Per Session</p>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                            {lodge.description || 'No description provided for this property listing.'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/5">
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Beds</p>
                                                <p className="text-xs font-bold">{lodge.bedrooms || 1}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Baths</p>
                                                <p className="text-xs font-bold">{lodge.bathrooms || 1}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAction(lodge.id, 'reject')}
                                                className="px-6 py-2.5 rounded-xl bg-red-400/10 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-400 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction(lodge.id, 'approve')}
                                                className="px-6 py-2.5 rounded-xl bg-[#c0ff72]/10 text-[#c0ff72] text-xs font-bold uppercase tracking-widest hover:bg-[#c0ff72] hover:text-black transition-all flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={14} /> Approve
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )) : (
                filteredAgents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-[#16181b] rounded-[3rem] border border-white/5">
                        <User size={64} className="text-gray-800 mb-6" />
                        <h3 className="text-xl font-bold text-gray-300">Clean Agent Queue!</h3>
                        <p className="text-gray-500 max-w-sm mt-2">There are no agents waiting for identity verification.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {filteredAgents.map((agent) => (
                            <div key={agent.id} className="bg-[#16181b] rounded-[2.5rem] border border-white/5 overflow-hidden p-8 flex flex-col md:flex-row gap-8">
                                {/* Selfie Review */}
                                <div className="w-full md:w-48 aspect-[4/5] bg-[#212429] rounded-2xl overflow-hidden">
                                    {agent.selfie_url ? (
                                        <img src={agent.selfie_url} className="w-full h-full object-cover" alt="Agent Selfie" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>

                                {/* Agent Details */}
                                <div className="flex-1 flex flex-col">
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-1">Full Name</p>
                                            <h3 className="text-2xl font-bold text-white">{agent.full_name}</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-1">Phone Number</p>
                                                <p className="text-sm font-bold text-gray-300">{agent.phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-1">NIN Number</p>
                                                <p className="text-sm font-bold text-[#c0ff72] tracking-widest">{agent.nin || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-1">Agent Bio</p>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                {agent.bio || 'No bio provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-6 mt-6 border-t border-white/5">
                                        <button
                                            onClick={() => handleAgentAction(agent.id, 'reject')}
                                            className="px-6 py-3 rounded-xl bg-red-400/10 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-400 hover:text-white transition-all flex items-center gap-2 flex-1 justify-center"
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleAgentAction(agent.id, 'approve')}
                                            className="px-6 py-3 rounded-xl bg-[#c0ff72]/10 text-[#c0ff72] text-xs font-black uppercase tracking-widest hover:bg-[#c0ff72] hover:text-black transition-all flex items-center gap-2 flex-1 justify-center"
                                        >
                                            <CheckCircle2 size={14} /> Approve Verified
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default AdminVerificationView;
