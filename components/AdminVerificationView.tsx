
import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle, Search, Building2, MapPin, Loader2, Home, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lodge } from '../types';

const AdminVerificationView: React.FC = () => {
    const [lodges, setLodges] = useState<Lodge[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPendingLodges();
    }, []);

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

    const filteredLodges = lodges.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.area.toLowerCase().includes(searchQuery.toLowerCase())
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
                        Property Verification
                        <span className="bg-yellow-400/10 text-yellow-400 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black">
                            {lodges.length} Pending
                        </span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Review and approve new property listings for the mobile app.</p>
                </div>

                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search properties or areas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#16181b] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
                    />
                </div>
            </div>

            {filteredLodges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-[#16181b] rounded-[3rem] border border-white/5">
                    <ShieldCheck size={64} className="text-gray-800 mb-6" />
                    <h3 className="text-xl font-bold text-gray-300">All Caught Up!</h3>
                    <p className="text-gray-500 max-w-sm mt-2">There are no new properties waiting for verification at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
            )}
        </div>
    );
};

export default AdminVerificationView;
