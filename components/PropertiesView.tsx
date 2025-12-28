
import React, { useEffect, useState } from 'react';
import { Building, MapPin, Star, MoreVertical, Filter, Plus, Search, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lodge } from '../types';

interface PropertiesViewProps {
  onAddLodge: () => void;
}

const PropertiesView: React.FC<PropertiesViewProps> = ({ onAddLodge }) => {
  const [lodges, setLodges] = useState<Lodge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMyLodges();
  }, []);

  const fetchMyLodges = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lodges')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLodges(data || []);
    } catch (error) {
      console.error('Error fetching lodges:', error);
    } finally {
      setLoading(false);
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
        <p className="text-gray-500 font-medium">Fetching your properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search my lodges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16181b] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
            />
          </div>
          <button className="p-2 bg-[#16181b] border border-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
            <Filter size={20} />
          </button>
        </div>
        <button
          onClick={onAddLodge}
          className="w-full sm:w-auto bg-[#c0ff72] text-black px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(192,255,114,0.3)] transition-all"
        >
          <Plus size={20} />
          Add New Lodge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLodges.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-[#16181b] rounded-3xl border border-white/5 border-dashed">
            <Building className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 font-medium">You haven't listed any lodges yet.</p>
            <button onClick={onAddLodge} className="mt-4 text-[#c0ff72] text-sm font-bold hover:underline">Create your first listing</button>
          </div>
        ) : (
          filteredLodges.map((lodge) => (
            <div key={lodge.id} className="bg-[#16181b] rounded-3xl border border-white/5 overflow-hidden group hover:border-[#c0ff72]/30 transition-all flex flex-col">
              <div className="relative h-48">
                <img
                  src={lodge.image_urls?.[0] || 'https://images.unsplash.com/photo-1555854816-802f188090e4?auto=format&fit=crop&q=80&w=2070'}
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                  alt={lodge.title}
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${lodge.is_verified ? 'bg-[#c0ff72] text-black' : 'bg-yellow-400/20 text-yellow-400 shadow-xl backdrop-blur-md'
                    }`}>
                    {lodge.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
                    <Star size={12} fill="#c0ff72" className="text-[#c0ff72]" />
                    <span className="text-xs font-bold text-white">{lodge.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg group-hover:text-[#c0ff72] transition-colors truncate">{lodge.title}</h3>
                    <p className="text-gray-500 text-xs flex items-center gap-1 truncate">
                      <MapPin size={12} /> {lodge.area}
                    </p>
                  </div>
                  <button className="p-1 text-gray-500 hover:text-white flex-shrink-0">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Pricing</p>
                    <p className="text-lg font-bold text-white">{lodge.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Status</p>
                    <p className={`text-sm font-bold ${lodge.is_verified ? 'text-gray-300' : 'text-yellow-400'}`}>
                      {lodge.is_verified ? 'Active' : 'Under Review'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertiesView;
