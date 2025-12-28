
import React, { useEffect, useState } from 'react';
import { LayoutGrid, List, MoreHorizontal, Building, MapPin, Star, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lodge } from '../types';

const ActiveListings: React.FC = () => {
  const [listings, setListings] = useState<Lodge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRecentListings();
  }, []);

  const fetchMyRecentListings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lodges')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

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
    <div className="bg-[#16181b] p-8 rounded-[2rem] border border-white/5 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold">My Recent Properties</h3>
          <p className="text-gray-500 text-xs mt-1">Quick view of your active portfolio</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 bg-[#212429] rounded-xl text-gray-500 hover:text-white transition-all"><List size={18} /></button>
          <button className="p-2.5 bg-[#c0ff72] rounded-xl text-black shadow-[0_0_15px_rgba(192,255,114,0.3)] transition-all"><LayoutGrid size={18} /></button>
        </div>
      </div>

      <div className="space-y-4">
        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <Building size={48} className="text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium">You haven't listed any properties yet.</p>
            <p className="text-gray-600 text-xs mt-1 max-w-[200px]">Start adding your lodges to begin receiving inspection requests.</p>
          </div>
        ) : (
          listings.map((item) => (
            <div key={item.id} className="flex items-center gap-6 p-5 rounded-2xl hover:bg-white/[0.03] transition-all group border border-transparent hover:border-white/5">
              <div className="w-14 h-14 bg-[#212429] rounded-2xl overflow-hidden flex items-center justify-center text-gray-400 group-hover:text-[#c0ff72] transition-colors flex-shrink-0">
                {item.image_urls?.[0] ? (
                  <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <Building size={24} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-base truncate group-hover:text-[#c0ff72] transition-colors">{item.title}</h4>
                  <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${item.is_verified ? 'bg-[#c0ff72]/10 text-[#c0ff72]' : 'bg-yellow-400/10 text-yellow-400'
                    }`}>
                    {item.is_verified ? 'Live' : 'Pending'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
                  <MapPin size={12} /> {item.area}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-gray-400 flex-shrink-0 px-4 border-l border-white/5">
                <Star size={16} className="text-[#c0ff72]" fill="#c0ff72" />
                <span className="text-xs font-bold">{item.rating || 'N/A'}</span>
              </div>

              <div className="bg-[#212429] px-5 py-2.5 rounded-xl text-xs font-bold text-white flex-shrink-0 tracking-wider">
                {item.price}
              </div>

              <button className="p-2 text-gray-600 hover:text-white flex-shrink-0 transition-colors">
                <MoreHorizontal size={22} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveListings;
