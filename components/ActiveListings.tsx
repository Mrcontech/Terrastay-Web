import React, { useEffect, useState } from 'react';
import { LayoutGrid, List, MoreHorizontal, Building, MapPin, Star, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lodge } from '../types';
import VerificationPerksCard from './VerificationPerksCard';

interface ActiveListingsProps {
  onEditLodge: (lodge: Lodge) => void;
}

const ActiveListings: React.FC<ActiveListingsProps> = ({ onEditLodge }) => {
  const [listings, setListings] = useState<Lodge[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lodge? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('lodges').delete().eq('id', id);
      if (error) throw error;
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (error: any) {
      alert(error.message || 'Error deleting lodge');
    }
  };

  useEffect(() => {
    fetchMyRecentListings();
    const channel = supabase.channel('lodges_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'lodges' }, () => { fetchMyRecentListings(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMyRecentListings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Verification Status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_identity_verified')
        .eq('id', user.id)
        .single();

      setIsVerified(profile?.is_identity_verified || false);

      // 2. Fetch Listings
      const { data, error } = await supabase.from('lodges').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(4);
      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#16181b] p-8 rounded-[2rem] border border-white/5 h-full animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#16181b] p-5 sm:p-8 rounded-[2rem] border border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg sm:text-xl font-bold">My Recent Properties</h3>
          <p className="text-gray-500 text-xs mt-1">Quick view of your active portfolio</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#c0ff72] text-black shadow-[0_0_15px_rgba(192,255,114,0.3)]' : 'bg-[#212429] text-gray-500 hover:text-white'}`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#c0ff72] text-black shadow-[0_0_15px_rgba(192,255,114,0.3)]' : 'bg-[#212429] text-gray-500 hover:text-white'}`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      <VerificationPerksCard
        isVerified={isVerified}
        onVerifyClick={() => {/* Logic for verification modal */ }}
      />


      <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
        {listings.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <Building size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-500 font-medium">You haven't listed any properties yet.</p>
            <p className="text-gray-600 text-xs mt-1 max-w-[200px]">Start adding your lodges to begin receiving inspection requests.</p>
          </div>
        ) : (
          listings.map((item) => (
            <div
              key={item.id}
              className={`
                group border border-transparent hover:border-white/5 hover:bg-white/[0.03] transition-all rounded-2xl
                ${viewMode === 'grid' ? 'flex flex-col p-4 relative' : 'flex items-center gap-3 sm:gap-6 p-3 sm:p-5'}
              `}
            >
              <div className={`
                bg-[#212429] overflow-hidden flex items-center justify-center text-gray-400 group-hover:text-[#c0ff72] transition-colors flex-shrink-0
                ${viewMode === 'grid' ? 'w-full h-40 rounded-xl mb-4' : 'w-14 h-14 rounded-2xl'}
              `}>
                {item.image_urls?.[0] ? (
                  <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <Building size={viewMode === 'grid' ? 48 : 24} />
                )}
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className={`flex ${viewMode === 'grid' ? 'justify-between items-start mb-2' : 'items-center gap-3 mb-1'}`}>
                  <h4 className="font-bold text-sm sm:text-base truncate group-hover:text-[#c0ff72] transition-colors">{item.title}</h4>
                  <div className={`
                    px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider flex-shrink-0
                    ${item.is_verified ? 'bg-[#c0ff72]/10 text-[#c0ff72]' : 'bg-yellow-400/10 text-yellow-400'}
                  `}>
                    {item.is_verified ? 'Live' : 'Pending'}
                  </div>
                </div>

                <div className={`flex ${viewMode === 'grid' ? 'flex-col gap-2' : 'items-center gap-2'} text-xs text-gray-500`}>
                  <p className="flex items-center gap-1.5 truncate"><MapPin size={12} /> {item.area}</p>

                  {viewMode === 'list' && (
                    <>
                      <span className="sm:hidden w-1 h-1 rounded-full bg-gray-700" />
                      <span className="sm:hidden text-white font-bold">{item.price}</span>
                    </>
                  )}

                  {viewMode === 'grid' && (
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Star size={14} className="text-[#c0ff72]" fill="#c0ff72" />
                        <span className="font-bold">{item.rating || 'N/A'}</span>
                      </div>
                      <span className="text-white font-bold bg-[#212429] px-3 py-1.5 rounded-lg">{item.price}</span>
                    </div>
                  )}
                </div>
              </div>

              {viewMode === 'list' && (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-gray-400 flex-shrink-0 px-4 border-l border-white/5">
                    <Star size={16} className="text-[#c0ff72]" fill="#c0ff72" />
                    <span className="text-xs font-bold">{item.rating || 'N/A'}</span>
                  </div>

                  <div className="hidden sm:block bg-[#212429] px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white flex-shrink-0 tracking-wider">
                    {item.price}
                  </div>
                </>
              )}

              <div className={viewMode === 'grid' ? "absolute top-4 right-4" : "relative ml-auto sm:ml-0"}>
                <button
                  onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                  className={`p-2 text-gray-600 hover:text-white flex-shrink-0 transition-colors ${viewMode === 'grid' ? 'bg-black/50 backdrop-blur-md rounded-lg hover:bg-black/70 text-white' : ''}`}
                >
                  <MoreHorizontal size={viewMode === 'grid' ? 18 : 22} />
                </button>

                {activeMenu === item.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                    <div className="absolute right-0 mt-2 w-36 bg-[#212429] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <button onClick={() => { onEditLodge(item); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-300 hover:bg-[#c0ff72] hover:text-black transition-all flex items-center gap-2">
                        <Plus size={14} className="rotate-45" /> Edit Details
                      </button>
                      <button onClick={() => { handleDelete(item.id); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all border-t border-white/5">
                        Delete Listing
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveListings;
