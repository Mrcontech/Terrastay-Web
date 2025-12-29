import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Upload, AlertCircle, CheckCircle2, Clock, User, IdCard, Camera, Loader2 } from 'lucide-react';

const IdentityVerificationView: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nin, setNin] = useState('');
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (error) throw error;

            // If profile doesn't exist, we'll use a skeleton mock for the ID
            // or wait for the first insert on verification submission
            setProfile(data || { id: user.id });
            setNin(data?.nin || '');
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelfieFile(file);
            setSelfiePreview(URL.createObjectURL(file));
        }
    };

    const submitVerification = async () => {
        if (!nin || !selfieFile) {
            alert('Please provide both NIN and a selfie.');
            return;
        }

        if (nin.length !== 11) {
            alert('NIN must be exactly 11 digits.');
            return;
        }

        setUploading(true);
        try {
            const fileExt = selfieFile.name.split('.').pop();
            const fileName = `${profile.id}/selfie_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('agent-verification')
                .upload(fileName, selfieFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('agent-verification')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: profile.id,
                    nin: nin,
                    selfie_url: publicUrl,
                    verification_status: 'pending'
                });

            if (updateError) throw updateError;

            alert('Identity verification submitted successfully! Our team will review it shortly.');
            fetchProfile();
        } catch (error: any) {
            alert('Verification submission failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-[#c0ff72]" size={48} />
            </div>
        );
    }

    const verificationStatus = profile?.verification_status || 'none';

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#c0ff72]/10 rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="text-[#c0ff72]" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
                        <p className="text-sm text-gray-500">Get verified to build trust with clients</p>
                    </div>
                </div>
            </div>

            {/* Status Card */}
            <div className={`rounded-[2rem] border p-8 mb-8 ${verificationStatus === 'approved'
                ? 'bg-[#c0ff72]/5 border-[#c0ff72]/20'
                : verificationStatus === 'pending'
                    ? 'bg-yellow-500/5 border-yellow-500/20'
                    : verificationStatus === 'rejected'
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-[#16181b] border-white/5'
                }`}>
                <div className="flex items-center gap-4">
                    {verificationStatus === 'approved' ? (
                        <div className="w-14 h-14 bg-[#c0ff72] rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="text-black" size={28} />
                        </div>
                    ) : verificationStatus === 'pending' ? (
                        <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                            <Clock className="text-yellow-500" size={28} />
                        </div>
                    ) : verificationStatus === 'rejected' ? (
                        <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center">
                            <AlertCircle className="text-red-400" size={28} />
                        </div>
                    ) : (
                        <div className="w-14 h-14 bg-gray-700/50 rounded-2xl flex items-center justify-center">
                            <User className="text-gray-400" size={28} />
                        </div>
                    )}
                    <div>
                        <h3 className={`text-lg font-bold ${verificationStatus === 'approved' ? 'text-[#c0ff72]' :
                            verificationStatus === 'pending' ? 'text-yellow-500' :
                                verificationStatus === 'rejected' ? 'text-red-400' : 'text-white'
                            }`}>
                            {verificationStatus === 'approved' ? 'Verified Agent' :
                                verificationStatus === 'pending' ? 'Verification Pending' :
                                    verificationStatus === 'rejected' ? 'Verification Rejected' : 'Not Verified'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {verificationStatus === 'approved' ? 'Your identity has been verified. Clients can now trust your listings.' :
                                verificationStatus === 'pending' ? 'Your documents are under review. This usually takes 24-48 hours.' :
                                    verificationStatus === 'rejected' ? 'Your verification was rejected. Please resubmit with valid documents.' :
                                        'Complete verification to receive the trusted agent badge.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form (Only show if not approved) */}
            {verificationStatus !== 'approved' && (
                <div className="bg-[#16181b] rounded-[2rem] border border-white/5 p-8">
                    <h2 className="text-lg font-bold text-white mb-6">Submit Verification</h2>

                    <div className="space-y-6">
                        {/* NIN Input */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-2 block">
                                National Identification Number (NIN)
                            </label>
                            <div className="relative">
                                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                                <input
                                    type="text"
                                    value={nin}
                                    onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                    placeholder="Enter your 11-digit NIN"
                                    className="w-full bg-[#0f1113] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#c0ff72]/50 transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-gray-600 mt-2">{nin.length}/11 digits</p>
                        </div>

                        {/* Selfie Upload */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-2 block">
                                Verification Selfie
                            </label>
                            <div className="relative">
                                {selfiePreview ? (
                                    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10">
                                        <img src={selfiePreview} alt="Selfie preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => { setSelfieFile(null); setSelfiePreview(null); }}
                                            className="absolute top-3 right-3 bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                        >
                                            <AlertCircle size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#c0ff72]/30 transition-colors bg-[#0f1113]">
                                        <Camera className="text-gray-600 mb-3" size={48} />
                                        <span className="text-sm text-gray-500">Click to upload a clear selfie</span>
                                        <span className="text-[10px] text-gray-600 mt-1">PNG, JPG up to 5MB</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSelfieChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={submitVerification}
                            disabled={uploading || !nin || !selfieFile}
                            className="w-full bg-[#c0ff72] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(192,255,114,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <Upload size={18} /> Submit for Verification
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Benefits Section */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: ShieldCheck, title: 'Trust Badge', desc: 'Display verified badge on your profile' },
                    { icon: CheckCircle2, title: 'Priority Listings', desc: 'Higher visibility in search results' },
                    { icon: User, title: 'Client Confidence', desc: 'Build trust with potential clients' },
                ].map((benefit, idx) => (
                    <div key={idx} className="bg-[#16181b] border border-white/5 rounded-2xl p-5 text-center">
                        <benefit.icon className="text-[#c0ff72] mx-auto mb-3" size={28} />
                        <h4 className="text-sm font-bold text-white mb-1">{benefit.title}</h4>
                        <p className="text-[10px] text-gray-500">{benefit.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IdentityVerificationView;
