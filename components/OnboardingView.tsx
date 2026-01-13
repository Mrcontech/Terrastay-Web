
import React, { useState, useEffect } from 'react';
import { User, Phone, AlignLeft, Camera, Shield, CheckCircle2, Zap, TrendingUp, DollarSign, ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OnboardingViewProps {
    onComplete: () => void;
    onVerify: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onVerify }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        bio: '',
        avatar_url: '',
    });

    const [existingRole, setExistingRole] = useState<string | null>(null);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchInitialData(session.user.id);
            }
        });
    }, []);

    const fetchInitialData = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('full_name, phone, bio, avatar_url, role')
            .eq('id', userId)
            .maybeSingle();

        if (data) {
            setFormData({
                full_name: data.full_name || '',
                phone: data.phone || '',
                bio: data.bio || '',
                avatar_url: data.avatar_url || '',
            });
            setExistingRole(data.role);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData({ ...formData, avatar_url: publicUrl });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveAndContinue = async () => {
        if (step === 1) {
            if (!formData.full_name || !formData.phone) {
                alert('Please fill in your name and phone number.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else {
            completeOnboarding(onComplete);
        }
    };

    const handleVerify = async () => {
        completeOnboarding(onVerify);
    };

    const completeOnboarding = async (callback: () => void) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                    ...formData,
                    onboarding_completed: true,
                    role: existingRole || 'agent', // Preserve existing role or default to agent
                    email: session.user.email // Ensure email is synced
                });

            if (error) throw error;
            callback();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold">Welcome to the Team!</h2>
                <p className="text-gray-500">Let's start by getting to know you better. Your profile details help students trust you.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="e.g. John Doe"
                            className="w-full bg-[#1c1f24] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-[#c0ff72]/50 focus:ring-1 focus:ring-[#c0ff72]/50 transition-all text-white outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="e.g. +234 801 234 5678"
                            className="w-full bg-[#1c1f24] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-[#c0ff72]/50 focus:ring-1 focus:ring-[#c0ff72]/50 transition-all text-white outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Professional Bio</label>
                    <div className="relative">
                        <AlignLeft className="absolute left-4 top-5 text-gray-500" size={18} />
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Describe your experience as an agent. What makes you stand out?"
                            rows={4}
                            className="w-full bg-[#1c1f24] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-[#c0ff72]/50 focus:ring-1 focus:ring-[#c0ff72]/50 transition-all text-white outline-none resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold">Visual Identity</h2>
                <p className="text-gray-500">Agents with clear profile pictures receive up to 3x more inspection requests.</p>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative group">
                    <div className="w-40 h-40 rounded-full bg-[#1c1f24] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                        {formData.avatar_url ? (
                            <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <Camera size={48} className="text-gray-600 group-hover:text-[#c0ff72] transition-colors" />
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-[#c0ff72] border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-2 right-2 w-10 h-10 bg-[#c0ff72] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all">
                        <Plus size={20} className="text-black" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                </div>

                <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-white">Upload a professional headshot</p>
                    <p className="text-xs text-gray-500">Supported formats: JPG, PNG. Max 2MB.</p>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="text-[#c0ff72]" size={20} />
                    <span className="text-[#c0ff72] text-xs font-bold tracking-widest uppercase italic">Road to Verification</span>
                </div>
                <h2 className="text-3xl font-bold">Unlock Your Full Potential</h2>
                <p className="text-gray-500">Verified agents enjoy exclusive benefits that help them scale their real estate business faster.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1c1f24] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div className="w-10 h-10 bg-[#c0ff72]/10 rounded-xl flex items-center justify-center">
                        <Zap className="text-[#c0ff72]" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Unlimited Listings</h4>
                        <p className="text-xs text-gray-500 mt-1">Don't limit your growth. Verified agents can host an unlimited number of properties.</p>
                    </div>
                </div>

                <div className="bg-[#1c1f24] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div className="w-10 h-10 bg-[#c0ff72]/10 rounded-xl flex items-center justify-center">
                        <TrendingUp className="text-[#c0ff72]" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Priority Ranking</h4>
                        <p className="text-xs text-gray-500 mt-1">Appear at the top of search results. Get 3x more visibility than standard accounts.</p>
                    </div>
                </div>

                <div className="bg-[#1c1f24] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div className="w-10 h-10 bg-[#c0ff72]/10 rounded-xl flex items-center justify-center">
                        <DollarSign className="text-[#c0ff72]" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Lower Fees</h4>
                        <p className="text-xs text-gray-500 mt-1">Keep more of your hard-earned money. Pay only 1.5% commission on successful deals.</p>
                    </div>
                </div>

                <div className="bg-[#1c1f24] p-6 rounded-3xl border border-white/5 space-y-4">
                    <div className="w-10 h-10 bg-[#c0ff72]/10 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="text-[#c0ff72]" size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">Trust Badge</h4>
                        <p className="text-xs text-gray-500 mt-1">Gain instant credibility with the verified checkmark on your profile and listings.</p>
                    </div>
                </div>
            </div>

            <div className="bg-[#c0ff72]/5 border border-[#c0ff72]/20 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#c0ff72] font-medium leading-relaxed max-w-[300px]">
                    You can start listing immediately after this, but we highly recommend completing your identity verification to unlock these perks.
                </p>
                <button
                    onClick={handleVerify}
                    className="whitespace-nowrap bg-[#c0ff72]/10 hover:bg-[#c0ff72]/20 text-[#c0ff72] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-[#c0ff72]/20"
                >
                    Verify Account Now
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f1113] flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-[#16181b] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                {/* Background Decorative Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#c0ff72]/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                {/* Progress Bar */}
                <div className="flex gap-2 mb-12 relative z-10">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#c0ff72]' : 'bg-white/5'}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="relative z-10 min-h-[400px]">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>

                {/* Footer Actions */}
                <div className="mt-12 flex items-center justify-between relative z-10">
                    <button
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1 || loading}
                        className={`flex items-center gap-2 font-bold text-sm transition-all ${step === 1 ? 'opacity-0' : 'text-gray-500 hover:text-white'}`}
                    >
                        <ChevronLeft size={20} /> Back
                    </button>

                    <button
                        onClick={handleSaveAndContinue}
                        disabled={loading || uploading}
                        className="bg-[#c0ff72] text-black px-8 py-4 rounded-[2rem] font-bold flex items-center gap-3 hover:shadow-[0_0_20px_rgba(192,255,114,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {step === 3 ? 'Finish & Launch' : 'Save & Continue'}
                                {step !== 3 && <ChevronRight size={20} />}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingView;
