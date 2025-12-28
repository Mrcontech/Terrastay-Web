
import React, { useEffect, useState } from 'react';
import { Search, Calendar, Clock, Home, User, CheckCircle2, XCircle, Loader2, Filter, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';

const AdminBookingsView: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

    useEffect(() => {
        fetchAllBookings();
    }, []);

    const fetchAllBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*, lodges(*), profiles(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus as any } : b));
        } catch (error) {
            console.error('Error updating booking status:', error);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            (b.lodges?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.booking_code || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#c0ff72] mb-4" size={40} />
                <p className="text-gray-500 font-medium">Synchronizing inspection queue...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold">Platform Inspections</h2>
                    <p className="text-gray-500 text-sm mt-1">Full oversight of all property viewing requests.</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search code, property, student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#16181b] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72]"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="bg-[#16181b] border border-white/5 rounded-2xl px-4 py-3 text-sm text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#c0ff72] appearance-none cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBookings.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-[#16181b] rounded-[2rem] border border-white/5 border-dashed">
                        <Calendar className="mx-auto text-gray-700 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">No inspections found matching your filters.</p>
                    </div>
                ) : (
                    filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-[#16181b] rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-white/10 transition-all flex flex-col p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-white/5 rounded-2xl text-gray-400 group-hover:text-[#c0ff72] transition-colors">
                                    <Building2 size={24} />
                                </div>
                                <div className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] ${booking.status === 'confirmed' ? 'bg-[#c0ff72]/10 text-[#c0ff72]' :
                                    booking.status === 'cancelled' ? 'bg-red-400/10 text-red-400' :
                                        booking.status === 'completed' ? 'bg-blue-400/10 text-blue-400' :
                                            'bg-yellow-400/10 text-yellow-400'
                                    }`}>
                                    {booking.status}
                                </div>
                            </div>

                            <div className="flex-1 space-y-5">
                                <div>
                                    <h4 className="font-bold text-lg group-hover:text-white transition-colors truncate">{booking.lodges?.title || 'Unknown Lodge'}</h4>
                                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1.5 font-medium">
                                        <User size={12} /> Requested by {booking.profiles?.full_name || 'Anonymous'}
                                    </p>
                                    {booking.profiles?.school_name && (
                                        <p className="text-[#c0ff72] text-[10px] mt-0.5 font-bold uppercase tracking-wider">
                                            {booking.profiles.school_name}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Date</p>
                                        <p className="text-xs font-bold text-gray-300 flex items-center gap-2"><Calendar size={14} className="text-gray-700" /> {booking.inspection_date}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Time</p>
                                        <p className="text-xs font-bold text-gray-300 flex items-center gap-2"><Clock size={14} className="text-gray-700" /> {booking.inspection_time}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/[0.02] rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-0.5">Booking Code</p>
                                        <p className="text-sm font-bold text-white tracking-widest">{booking.booking_code}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                                    className="w-10 h-10 bg-red-400/10 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-400 hover:text-white transition-all"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                    className="w-10 h-10 bg-[#c0ff72]/10 text-[#c0ff72] rounded-xl flex items-center justify-center hover:bg-[#c0ff72] hover:text-black transition-all"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            </>
                                        )}
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

export default AdminBookingsView;
