
import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Globe, Shield, CreditCard, LogOut, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SettingsView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Use getUser() for server-side verification, but handle errors
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error('Auth error detected:', authError);
                // Fallback to getSession for client-side state if getUser is restricted
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                    setProfile(data);
                    return;
                }
                throw authError;
            }

            if (user) {
                const { data, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (profileError) throw profileError;
                setProfile(data);
            }
        } catch (error: any) {
            console.error('Error in fetchProfile:', error);
            if (error.status === 403) {
                // If 403, the session is likely invalid. We should probably sign out or warn the user.
                console.warn('Session appeared invalid (403). Session may need to be refreshed.');
            }
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone,
                    bio: profile.bio,
                    avatar_url: profile.avatar_url
                })
                .eq('id', profile.id);

            if (error) throw error;
            alert('Profile updated successfully!');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Billing & Payouts', icon: CreditCard },
    ];

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Navigation Sidebar */}
                <div className="md:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-[#c0ff72] text-black font-bold'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={20} />
                            <span className="text-sm">{tab.label}</span>
                            {activeTab === tab.id && <div className="ml-auto w-1.5 h-1.5 bg-black rounded-full" />}
                        </button>
                    ))}

                    <div className="pt-8 px-4">
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="flex items-center gap-2 text-red-500/80 hover:text-red-500 text-sm font-bold transition-colors"
                        >
                            <LogOut size={18} />
                            Logout from Portal
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-[#16181b] border border-white/5 rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#c0ff72]/5 blur-3xl -mr-16 -mt-16" />

                    {activeTab === 'profile' && profile && (
                        <div className="space-y-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Account Details</h3>
                                <p className="text-gray-500 text-sm">Update your public profile and contact information.</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            className="w-full bg-[#0f1113] border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#c0ff72] outline-none"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={profile.phone || ''}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full bg-[#0f1113] border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#c0ff72] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-6 p-6 bg-[#0f1113] border border-white/5 rounded-2xl">
                                        <div className="w-20 h-20 rounded-full border-2 border-[#c0ff72]/20 overflow-hidden bg-white/5 flex items-center justify-center">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={32} className="text-gray-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-1">Profile Photo URL</label>
                                            <input
                                                type="text"
                                                value={profile.avatar_url || ''}
                                                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-[#c0ff72] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-1">About / Bio</label>
                                        <textarea
                                            value={profile.bio || ''}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            placeholder="Tell potential tenants about yourself and how you manage your properties..."
                                            className="w-full bg-[#0f1113] border border-white/5 rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-[#c0ff72] outline-none min-h-[120px] resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-1">Login Email</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full bg-[#0f1113]/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-600 cursor-not-allowed outline-none"
                                    />
                                    <p className="text-[10px] text-gray-600 mt-1 italic px-1">Email cannot be changed from the portal. Contact support for changes.</p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#c0ff72] text-black px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(192,255,114,0.3)] transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                        Save Profile Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab !== 'profile' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Shield size={48} className="text-gray-700 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">{tabs.find(t => t.id === activeTab)?.label}</h3>
                            <p className="text-gray-600 text-sm max-w-xs mt-2">These settings are currently managed via the mobile administrative panel for security.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
