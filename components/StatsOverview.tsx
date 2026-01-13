
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

      // Fetch user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';

      // 1. Total Listings
      let lodgeQuery = supabase.from('lodges').select('*', { count: 'exact', head: true });
      if (!isAdmin) lodgeQuery = lodgeQuery.eq('owner_id', user.id);
      const { count: lodgeCount } = await lodgeQuery;

      // 2. Total Revenue from successful payments
      let revQuery = supabase.from('payments').select('amount').eq('status', 'success');
      if (!isAdmin) {
        // If agent, we need to filter by lodges they own
        const { data: agentLodges } = await supabase.from('lodges').select('id').eq('owner_id', user.id);
        const lodgeIds = agentLodges?.map(l => l.id) || [];
        if (lodgeIds.length > 0) revQuery = revQuery.in('lodge_id', lodgeIds);
        else revQuery = revQuery.eq('id', '00000000-0000-0000-0000-000000000000'); // Force zero if no lodges
      }
      const { data: paymentsData } = await revQuery;
      const totalRevenue = (paymentsData || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

      // 3. Rented Lodges count
      const rentedCount = paymentsData?.length || 0;

      // 4. Pending Inspections
      let pendingQuery = supabase.from('bookings').select('*, lodges!inner(owner_id)', { count: 'exact', head: true }).eq('status', 'pending');
      if (!isAdmin) pendingQuery = pendingQuery.eq('lodges.owner_id', user.id);
      const { count: pendingCount } = await pendingQuery;

      setStats([
        { label: 'Total Listings', value: (lodgeCount || 0).toString(), unit: 'Lodges', loading: false },
        { label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, unit: '', loading: false },
        { label: 'Rented Lodges', value: (rentedCount || 0).toString(), unit: 'Sold', loading: false },
        { label: 'Pending Inquiries', value: (pendingCount || 0).toString(), unit: 'Requests', loading: false },
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
