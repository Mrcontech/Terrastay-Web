
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, MessageSquare, MapPin, Loader2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';

const BookingsView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          lodges!inner(*),
          profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('booking_code', bookingId);

      if (error) throw error;
      setBookings(prev => prev.map(b => b.booking_code === bookingId ? { ...b, status } : b));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#c0ff72] mb-4" size={40} />
        <p className="text-gray-500">Loading viewing requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#c0ff72]/10 p-3 rounded-2xl">
          <Calendar className="text-[#c0ff72]" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Inspection Inbox</h2>
          <p className="text-sm text-gray-500">Manage viewing requests from prospective students</p>
        </div>
      </div>

      <div className="bg-[#16181b] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Target Property</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No viewing requests yet.</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-white/10 bg-[#212429] flex items-center justify-center overflow-hidden">
                          {booking.profiles?.avatar_url ? (
                            <img src={booking.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <User size={14} className="text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{booking.profiles?.full_name || 'Anonymous'}</p>
                          <p className={`text-[10px] ${booking.profiles?.school_name ? 'text-[#c0ff72] font-bold' : 'text-gray-500'}`}>
                            {booking.profiles?.school_name || 'Standard User'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{booking.lodges?.title}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <MapPin size={10} /> {booking.lodges?.area}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-300">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock size={12} className="text-gray-500" />
                        {booking.inspection_date}
                      </div>
                      <div className="text-[10px] text-gray-500 pl-4">{booking.inspection_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-[#c0ff72]/10 text-[#c0ff72]' :
                        booking.status === 'completed' ? 'bg-blue-400/10 text-blue-400' :
                          booking.status === 'cancelled' ? 'bg-red-400/10 text-red-400' :
                            'bg-white/5 text-gray-400'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#c0ff72]">
                      {booking.booking_code}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(booking.booking_code, 'cancelled')}
                              className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all"
                            >
                              <XCircle size={16} />
                            </button>
                            <button
                              onClick={() => updateStatus(booking.booking_code, 'confirmed')}
                              className="w-8 h-8 rounded-lg bg-[#c0ff72]/10 flex items-center justify-center text-[#c0ff72] hover:bg-[#c0ff72] hover:text-black transition-all"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(booking.booking_code, 'completed')}
                            className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400 hover:bg-blue-400 hover:text-white transition-all"
                            title="Mark as Completed"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingsView;
