import React, { useEffect, useState } from 'react';
import { AlertCircle, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ViewType } from '../App';

interface VerificationBannerProps {
    onAction: (view: ViewType) => void;
}

const VerificationBanner: React.FC<VerificationBannerProps> = ({ onAction }) => {
    const [status, setStatus] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('verification_status')
                .eq('id', user.id)
                .maybeSingle();

            setStatus(data?.verification_status || 'none');
            setLoading(false);
        };

        checkStatus();

        // Subscribe to changes
        const channel = supabase
            .channel('profile_status_changes')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles' },
                (payload) => {
                    if (payload.new && (payload.new as any).verification_status) {
                        setStatus((payload.new as any).verification_status);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading || status === 'approved' || !isVisible) return null;

    return (
        <div className="bg-[#C0FF72] text-[#000000] py-2 px-4 relative flex items-center justify-center gap-3 animate-in slide-in-from-top duration-500 z-[100]">
            <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-black" />
                <p className="text-[11px] md:text-xs font-bold uppercase tracking-tight">
                    {status === 'pending'
                        ? "Verification Pending: Our team is currently reviewing your identity documents."
                        : status === 'rejected'
                            ? "Verification Rejected: Please update your identification documents to continue."
                            : "Account Unverified: Complete identity verification to unlock full agent features."
                    }
                </p>
            </div>

            {status !== 'pending' && (
                <button
                    onClick={() => onAction('kyc')}
                    className="flex items-center gap-1 bg-black text-[#C0FF72] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-all ml-2"
                >
                    Verify Now <ArrowRight size={12} />
                </button>
            )}

            <button
                onClick={() => setIsVisible(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
                aria-label="Close"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default VerificationBanner;
