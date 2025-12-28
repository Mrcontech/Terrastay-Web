
import React, { useEffect, useState } from 'react';
import { Search, MapPin, UserCheck, ShieldCheck, Mail, Phone, MoreHorizontal, Loader2, Filter, School } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

const UsersView: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'agent' | 'admin'>('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#c0ff72] mb-4" size={40} />
                <p className="text-gray-500 font-medium">Loading platform directory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage all students, agents, and administrators.</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#16181b] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c0ff72] transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-[#16181b] p-1.5 rounded-2xl border border-white/5">
                        {(['all', 'student', 'agent', 'admin'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${roleFilter === r ? 'bg-[#c0ff72] text-black shadow-[0_0_15px_rgba(192,255,114,0.3)]' : 'text-gray-500 hover:text-white'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-[#16181b] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 border-b border-white/5">
                                <th className="px-8 py-5 font-bold">User Profile</th>
                                <th className="px-8 py-5 font-bold">Contact Details</th>
                                <th className="px-8 py-5 font-bold">School</th>
                                <th className="px-8 py-5 font-bold">Joined</th>
                                <th className="px-8 py-5 text-right font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-600 text-sm italic">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden bg-[#212429] p-0.5">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} className="w-full h-full object-cover rounded-xl" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 bg-[#16181b] rounded-xl font-bold text-lg">
                                                            {(user.full_name || 'U').charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-[#c0ff72] transition-colors">{user.full_name || 'Anonymous User'}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {user.role === 'admin' ? (
                                                            <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 uppercase tracking-wider">
                                                                <ShieldCheck size={10} /> Administrator
                                                            </span>
                                                        ) : user.role === 'agent' ? (
                                                            <span className="flex items-center gap-1 text-[9px] font-bold text-[#c0ff72] uppercase tracking-wider">
                                                                <UserCheck size={10} /> Property Agent
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                                                                <UserCheck size={10} /> Student
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5 font-medium">
                                                <p className="text-xs text-gray-400 flex items-center gap-2.5">
                                                    <Mail size={14} className="text-gray-600" /> {user.email || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-400 flex items-center gap-2.5">
                                                    <Phone size={14} className="text-gray-600" /> {user.phone || 'N/A'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs text-gray-400 flex items-center gap-2.5 font-medium">
                                                <School size={14} className="text-gray-600" /> {user.school_name || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs text-gray-500 font-medium">
                                                {new Date(user.created_at || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
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
    );
};

export default UsersView;
