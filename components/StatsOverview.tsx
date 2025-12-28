
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'My Properties', value: '0', unit: 'Lodges', loading: true },
    { label: 'Total Favorites', value: '0', unit: 'Saves', loading: true },
    { label: 'Pending Inspections', value: '0', unit: 'Requests', loading: true },
    { label: 'Confirmed Today', value: '0', unit: 'Bookings', loading: true },
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch My Total Lodges
      const { count: lodgeCount } = await supabase
        .from('lodges')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      // Fetch Pending Inspections for my lodges
      const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*, lodges!inner(owner_id)', { count: 'exact', head: true })
        .eq('lodges.owner_id', user.id)
        .eq('status', 'pending');

      // Fetch Total Favorites for my lodges
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*, lodges!inner(owner_id)', { count: 'exact', head: true })
        .eq('lodges.owner_id', user.id);

      // Fetch Confirmed Inspections for today for my lodges
      const today = new Date().toISOString().split('T')[0];
      const { count: confirmedToday } = await supabase
        .from('bookings')
        .select('*, lodges!inner(owner_id)', { count: 'exact', head: true })
        .eq('lodges.owner_id', user.id)
        .eq('status', 'confirmed')
        .eq('inspection_date', today);

      setStats([
        { label: 'My Properties', value: (lodgeCount || 0).toString(), unit: 'Lodges', loading: false },
        { label: 'Total Favorites', value: (favoritesCount || 0).toString(), unit: 'Saves', loading: false },
        { label: 'Pending Inspections', value: (pendingCount || 0).toString(), unit: 'Requests', loading: false },
        { label: 'Total Confirmed', value: (confirmedToday || 0).toString(), unit: 'Bookings', loading: false },
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[#16181b] p-6 rounded-3xl border border-white/5 flex flex-col">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">{stat.label}</span>
          <div className="flex items-baseline gap-1">
            {stat.loading ? (
              <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
            ) : (
              <>
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-gray-500 text-xs">{stat.unit}</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
