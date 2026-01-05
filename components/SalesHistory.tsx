
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Payment } from '../types';
import { TrendingUp, Building2, Calendar, DollarSign, Loader2 } from 'lucide-react';

const SalesHistory: React.FC = () => {
    const [rentals, setRentals] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user role to see if they are admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const isAdmin = profile?.role === 'admin';

            let query = supabase
                .from('payments')
                .select('*, lodges(*), profiles(*)')
                .eq('status', 'success')
                .order('created_at', { ascending: false });

            if (!isAdmin) {
                // For agents, we need to filter payments for lodges they own
                const { data: myLodges } = await supabase
                    .from('lodges')
                    .select('id')
                    .eq('owner_id', user.id);

                const lodgeIds = myLodges?.map(l => l.id) || [];
                if (lodgeIds.length > 0) {
                    query = query.in('lodge_id', lodgeIds);
                } else {
                    setRentals([]);
                    setLoading(false);
                    return;
                }
            }

            const { data, error } = await query;
            if (error) throw error;
            setRentals(data || []);
        } catch (error) {
            console.error('Error fetching rentals:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#16181b] p-8 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="animate-spin text-[#c0ff72] mb-4" size={32} />
                <p className="text-gray-500 text-sm italic font-questrial">Loading rental records...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#16181b] p-8 rounded-[2rem] border border-white/5">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold font-questrial text-white">Rental Earnings</h3>
                    <p className="text-gray-500 text-xs mt-1 font-questrial uppercase tracking-widest">Successful Transactions</p>
                </div>
                <div className="p-3 bg-[#c0ff72]/10 rounded-2xl">
                    <TrendingUp size={20} className="text-[#c0ff72]" />
                </div>
            </div>

            <div className="space-y-4">
                {rentals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <DollarSign size={48} className="text-gray-700 mb-4 font-bold" />
                        <p className="text-gray-500 font-medium font-questrial">No rental income yet</p>
                        <p className="text-gray-600 text-xs mt-1 font-questrial">Once a student pays for your lodge, it will appear here.</p>
                    </div>
                ) : (
                    rentals.map((rental) => (
                        <div key={rental.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#c0ff72]/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#c0ff72]/10 flex items-center justify-center">
                                        <Building2 size={18} className="text-[#c0ff72]" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-[#c0ff72] transition-colors line-clamp-1">
                                            {rental.metadata?.lodgeTitle || rental.lodges?.title || 'Unknown Property'}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar size={12} className="text-gray-500" />
                                            <p className="text-[10px] text-gray-500 font-questrial">
                                                {new Date(rental.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#c0ff72] text-sm font-bold">₦{Number(rental.amount).toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-500 font-questrial mt-1 uppercase tracking-tighter">Net Earnings</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                                        {rental.profiles?.avatar_url ? (
                                            <img src={rental.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-[#212429]" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-questrial">
                                        Rented by <span className="text-gray-300 font-bold">{rental.profiles?.full_name || 'Student'}</span>
                                    </p>
                                </div>
                                <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                    <p className="text-[8px] text-gray-500 font-questrial uppercase tracking-widest">
                                        ID: {rental.reference.slice(-8)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SalesHistory;
