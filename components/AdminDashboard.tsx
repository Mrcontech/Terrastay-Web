
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  X,
  Phone,
  Mail,
  Search,
  MoreHorizontal,
  Home,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lodge, UserProfile } from '../types';

const AdminDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Agents', value: '0', trend: 'Loading...', icon: <ShieldCheck size={18} className="text-[#c0ff72]" /> },
    { label: 'Mobile Users', value: '0', trend: 'Loading...', icon: <UserCheck size={18} className="text-blue-400" /> },
    { label: 'Pending Verifications', value: '0', trend: 'Lodges', icon: <AlertCircle size={18} className="text-yellow-400" /> },
  ]);
  const [pendingLodges, setPendingLodges] = useState<Lodge[]>([]);
  const [agents, setAgents] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const { count: agentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent');
      const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
      const { count: pendingCount } = await supabase.from('lodges').select('*', { count: 'exact', head: true }).eq('is_verified', false);
      const { data: paymentsRes } = await supabase.from('payments').select('amount, metadata').eq('status', 'success');

      let totalRevenue = 0;
      let totalTax = 0;
      let totalPlatformFee = 0;

      (paymentsRes || []).forEach(p => {
        const amount = Number(p.amount) || 0;
        totalRevenue += amount;

        if (p.metadata) {
          // Tax is explicitly stored
          const tax = Number(p.metadata.tax_amount) || 0;
          totalTax += tax;

          // Platform Fee is inside the base listing price (4% markup)
          // Base Amount = Original Price * 1.04
          // Original Price = Base Amount / 1.04
          // Fee = Base Amount - Original Price
          const baseAmount = Number(p.metadata.base_amount) || 0;
          const originalPrice = baseAmount / 1.04;
          const fee = baseAmount - originalPrice;
          totalPlatformFee += fee;
        }
      });

      setStats([
        { label: 'Gross Revenue', value: `₦${Math.floor(totalRevenue).toLocaleString()}`, trend: 'Platform total', icon: <TrendingUp size={18} className="text-[#c0ff72]" /> },
        { label: 'Platform Fees', value: `₦${Math.floor(totalPlatformFee).toLocaleString()}`, trend: '4% markup', icon: <Activity size={18} className="text-orange-400" /> },
        { label: 'Tax Collected', value: `₦${Math.floor(totalTax).toLocaleString()}`, trend: '2% processing', icon: <ShieldCheck size={18} className="text-blue-400" /> },
        { label: 'Total Agents', value: (agentCount || 0).toString(), trend: 'Verified partners', icon: <ShieldCheck size={18} className="text-blue-400" /> },
        { label: 'Platform Users', value: (studentCount || 0).toString(), trend: 'Active students', icon: <UserCheck size={18} className="text-purple-400" /> },
        { label: 'Verification Queue', value: (pendingCount || 0).toString(), trend: 'Pending lodges', icon: <AlertCircle size={18} className="text-yellow-400" /> },
      ]);

      // 2. Fetch Pending Lodges
      const { data: lodges } = await supabase.from('lodges').select('*').eq('is_verified', false).order('created_at', { ascending: false }).limit(5);
      setPendingLodges(lodges || []);

      // 3. Fetch Agents
      const { data: profileData } = await supabase.from('profiles').select('*').eq('role', 'agent').order('created_at', { ascending: false }).limit(10);
      setAgents(profileData || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyLodge = async (lodgeId: string, approved: boolean) => {
    try {
      if (approved) {
        await supabase.from('lodges').update({ is_verified: true }).eq('id', lodgeId);
      } else {
        await supabase.from('lodges').delete().eq('id', lodgeId);
      }
      setPendingLodges(prev => prev.filter(l => l.id !== lodgeId));
      fetchAdminData(); // Refresh all stats
    } catch (error) {
      console.error('Error verifying lodge:', error);
    }
  };

  const filteredAgents = agents.filter(a =>
    a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && stats[0].value === '0') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#c0ff72] mb-4" size={40} />
        <p className="text-gray-500 font-medium">Initializing Admin Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Admin Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#16181b] p-6 rounded-3xl border border-white/5 flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-bold mb-1">{stat.value}</h4>
              <p className="text-[10px] font-medium text-gray-400">{stat.trend}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Verification Queue - More Prominent */}
        <div className="lg:col-span-12 xl:col-span-4 bg-[#16181b] p-8 rounded-[2rem] border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Property Verification</h3>
              <p className="text-gray-500 text-xs mt-1">New listings pending review</p>
            </div>
            <AlertCircle size={20} className="text-yellow-400" />
          </div>

          <div className="space-y-4">
            {pendingLodges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <CheckCircle2 size={48} className="text-gray-700 mb-4" />
                <p className="text-gray-500 font-medium">Queue is empty</p>
                <p className="text-gray-600 text-xs mt-1">All properties are currently verified.</p>
              </div>
            ) : (
              pendingLodges.map((lodge) => (
                <div key={lodge.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-[#c0ff72]/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-bold truncate pr-4">{lodge.title}</span>
                    <span className="text-[10px] bg-[#c0ff72]/10 text-[#c0ff72] px-2 py-0.5 rounded uppercase font-bold tracking-wider whitespace-nowrap">
                      {lodge.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <p className="text-xs text-gray-500">{lodge.area}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => verifyLodge(lodge.id, false)}
                        className="w-8 h-8 rounded-xl bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => verifyLodge(lodge.id, true)}
                        className="w-8 h-8 rounded-xl bg-[#c0ff72]/10 flex items-center justify-center text-[#c0ff72] hover:bg-[#c0ff72] hover:text-black transition-all"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Agent Directory */}
        <div className="lg:col-span-12 xl:col-span-8 bg-[#16181b] p-8 rounded-[2rem] border border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-xl font-bold">Agent Directory</h3>
              <p className="text-gray-500 text-xs mt-1">Manage platform partners</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f1113] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-bold tracking-widest text-gray-500 border-b border-white/5">
                  <th className="pb-4 font-bold">Agent Profile</th>
                  <th className="pb-4 font-bold">Contact Details</th>
                  <th className="pb-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-gray-500 text-sm italic">No agents found matching your query.</td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden bg-[#212429] p-0.5">
                            {agent.avatar_url ? (
                              <img src={agent.avatar_url} className="w-full h-full object-cover rounded-xl" alt="" />
                            ) : (
                              <UserCheck size={20} className="text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-[#c0ff72] transition-colors">{agent.full_name || 'Anonymous Agent'}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Verified Partner</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5">
                        <div className="space-y-1.5">
                          <p className="text-xs text-gray-400 flex items-center gap-2"><Mail size={12} className="text-gray-600" /> {agent.email || 'No email'}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-2"><Phone size={12} className="text-gray-600" /> {agent.phone || 'No phone'}</p>
                        </div>
                      </td>
                      <td className="py-5 text-right">
                        <button className="p-3 bg-[#212429] rounded-xl text-gray-500 hover:text-white transition-all">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
