
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';

const RecentInspections: React.FC = () => {
    const [inspections, setInspections] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentInspections();
    }, []);

    const fetchRecentInspections = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch bookings for lodges owned by this agent
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          lodges!inner (title, owner_id),
          profiles (full_name)
        `)
                .eq('lodges.owner_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            setInspections(data || []);
        } catch (error) {
            console.error('Error fetching recent inspections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            fetchRecentInspections();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#16181b] p-8 rounded-[2rem] border border-white/5 h-full animate-pulse">
                <div className="h-6 w-48 bg-white/5 rounded mb-8" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#16181b] p-8 rounded-[2rem] border border-white/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold">Recent Inspections</h3>
                    <p className="text-gray-500 text-xs mt-1">Pending student viewing requests</p>
                </div>
                <button className="text-[#c0ff72] text-xs font-bold hover:underline flex items-center gap-1">
                    View All <ArrowRight size={14} />
                </button>
            </div>

            <div className="space-y-4 flex-1">
                {inspections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center grayscale opacity-50">
                        <Calendar size={40} className="text-gray-600 mb-3" />
                        <p className="text-gray-500 text-sm font-medium">No recent requests.</p>
                    </div>
                ) : (
                    inspections.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                            <div className="w-10 h-10 bg-[#212429] rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#c0ff72] transition-colors flex-shrink-0">
                                <User size={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{item.profiles?.full_name || 'Anonymous Student'}</h4>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate">
                                    <span className="text-[#c0ff72] font-bold">{item.lodges?.title}</span>
                                </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mb-1">
                                    <Calendar size={12} /> {item.inspection_date}
                                </div>
                                {item.status === 'pending' ? (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleUpdateStatus(item.id, 'confirmed')}
                                            className="p-1.5 bg-[#c0ff72]/10 text-[#c0ff72] rounded-lg hover:bg-[#c0ff72] hover:text-black transition-all"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                                            className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.status === 'confirmed' ? 'bg-[#c0ff72]/20 text-[#c0ff72]' :
                                            item.status === 'completed' ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-800 text-gray-500'
                                        }`}>
                                        {item.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentInspections;
