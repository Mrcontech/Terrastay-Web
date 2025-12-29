
import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Globe, Shield, CreditCard, LogOut, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SettingsView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [nin, setNin] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

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
            fetchProfile(); // Refresh profile state
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelfieFile(file);
            setSelfiePreview(URL.createObjectURL(file));
        }
    };

    const submitVerification = async () => {
        if (!nin || !selfieFile) {
            alert('Please provide both NIN and a selfie.');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload Selfie
            const fileExt = selfieFile.name.split('.').pop();
            const fileName = `${profile.id}/selfie_${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('agent-verification')
                .upload(fileName, selfieFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('agent-verification')
                .getPublicUrl(fileName);

            // 2. Update Profile with Verification Info
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    nin: nin,
                    selfie_url: publicUrl,
                    verification_status: 'pending'
                })
                .eq('id', profile.id);

            if (updateError) throw updateError;

            alert('Identity verification submitted successfully! Our team will review it shortly.');
            fetchProfile(); // Refresh status
            setActiveTab('profile');
        } catch (error: any) {
            alert('Verification submission failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'verification', label: 'Identity Verification', icon: Shield, role: 'agent' },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Billing & Payouts', icon: CreditCard },
    ];

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Navigation Sidebar */}
                <div className="md:w-64 space-y-1">
                    {tabs.map((tab: any) => {
                        // Only show agent specific tabs if user is an agent (currently skipping strict check for demo)
                        if (tab.role === 'agent' && profile?.role !== 'agent') return null;

                        return (
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
                        );
                    })}

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
                                <div className="flex items-center gap-3">
                                    <p className="text-gray-500 text-sm">Update your public profile and contact information.</p>
                                    {profile.is_identity_verified && (
                                        <div className="flex items-center gap-1 bg-[#c0ff72]/10 text-[#c0ff72] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#c0ff72]/20">
                                            <Check size={10} />
                                            VERIFIED AGENT
                                        </div>
                                    )}
                                </div>
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

                    {activeTab === 'verification' && profile && (
                        <div className="space-y-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Identity Verification</h3>
                                <p className="text-gray-500 text-sm">This is required to become a verified agent on Terrastay.</p>
                            </div>

                            {profile.verification_status === 'pending' ? (
                                <div className="bg-[#c0ff72]/5 border border-[#c0ff72]/20 rounded-3xl p-10 text-center space-y-4">
                                    <div className="w-16 h-16 bg-[#c0ff72]/10 rounded-full flex items-center justify-center mx-auto text-[#c0ff72]">
                                        <Loader2 size={32} className="animate-spin" />
                                    </div>
                                    <h4 className="text-xl font-bold">Verification Pending</h4>
                                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                        We've received your information. Your identity is currently being reviewed by our administration team.
                                    </p>
                                </div>
                            ) : profile.verification_status === 'approved' ? (
                                <div className="bg-[#c0ff72]/5 border border-[#c0ff72]/20 rounded-3xl p-10 text-center space-y-4">
                                    <div className="w-16 h-16 bg-[#c0ff72] rounded-full flex items-center justify-center mx-auto text-black">
                                        <Check size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold">Identity Verified</h4>
                                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                        Congratulations! Your identity has been verified. You now have the "Verified Agent" badge.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">National Identity Number (NIN)</label>
                                                <input
                                                    type="text"
                                                    value={nin}
                                                    onChange={(e) => setNin(e.target.value)}
                                                    placeholder="Enter your 11-digit NIN"
                                                    className="w-full bg-[#0f1113] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-[#c0ff72] outline-none"
                                                />
                                            </div>

                                            <div className="p-6 bg-[#0f1113] border border-white/5 rounded-3xl space-y-4">
                                                <h4 className="font-bold text-sm">Verification Guidelines</h4>
                                                <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
                                                    <li>Ensure your selfie is clear and well-lit</li>
                                                    <li>Your face must be fully visible without hats or sunglasses</li>
                                                    <li>NIN must match the name on your profile</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-1">Selfie Verification</label>
                                            <div
                                                onClick={() => document.getElementById('selfie-upload')?.click()}
                                                className="aspect-[4/5] bg-[#0f1113] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-[#c0ff72]/30 transition-all overflow-hidden relative group"
                                            >
                                                {selfiePreview ? (
                                                    <>
                                                        <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <p className="text-white text-xs font-bold">Change Image</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                                            <User size={32} className="text-gray-500" />
                                                        </div>
                                                        <p className="text-gray-500 text-sm font-medium">Click to upload selfie</p>
                                                        <p className="text-gray-600 text-[10px] mt-1">JPG or PNG, max 5MB</p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                id="selfie-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleSelfieChange}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={submitVerification}
                                            disabled={uploading || !nin || !selfieFile}
                                            className="bg-[#c0ff72] text-black px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:shadow-[0_0_25px_rgba(192,255,114,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Submitting Verification...
                                                </>
                                            ) : (
                                                <>
                                                    Submit for Verification
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab !== 'profile' && activeTab !== 'verification' && (
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
