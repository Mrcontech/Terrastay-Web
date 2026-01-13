
import React from 'react';
import { Shield, CheckCircle2, Zap, TrendingUp, DollarSign } from 'lucide-react';

interface VerificationPerksCardProps {
    isVerified: boolean;
    onVerifyClick: () => void;
}

const VerificationPerksCard: React.FC<VerificationPerksCardProps> = ({ isVerified, onVerifyClick }) => {
    if (isVerified) {
        return (
            <div className="bg-[#c0ff72]/5 border border-[#c0ff72]/20 rounded-[2rem] p-6 mb-8 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#c0ff72]/10 rounded-2xl flex items-center justify-center">
                        <Shield className="text-[#c0ff72]" size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white">Identity Verified</h4>
                            <CheckCircle2 size={16} className="text-[#c0ff72]" fill="#c0ff72" fillOpacity={0.2} />
                        </div>
                        <p className="text-gray-500 text-xs mt-1">You are getting all premium benefits</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <Zap size={14} className="text-[#c0ff72] mb-1" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Priority</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <DollarSign size={14} className="text-[#c0ff72] mb-1" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Low Fee</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#1c1f24] to-[#16181b] border border-white/5 rounded-[2rem] p-8 mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c0ff72]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#c0ff72]/10 transition-all duration-700" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="text-[#c0ff72]" size={20} />
                            <span className="text-[#c0ff72] text-[10px] font-bold uppercase tracking-[0.2em]">Growth Program</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Unlock Premium Growth Tools</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Verified agents close <span className="text-white font-bold">40% more deals</span> through priority ranking and increased student trust.
                        </p>
                    </div>
                    <button
                        onClick={onVerifyClick}
                        className="bg-[#c0ff72] text-black px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(192,255,114,0.2)]"
                    >
                        Verify Now
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#c0ff72]">
                            <Zap size={16} />
                        </div>
                        <div>
                            <p className="text-white text-[10px] font-bold uppercase tracking-wider">Unlimited</p>
                            <p className="text-gray-500 text-[10px]">Listings</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#c0ff72]">
                            <TrendingUp size={16} />
                        </div>
                        <div>
                            <p className="text-white text-[10px] font-bold uppercase tracking-wider">Priority</p>
                            <p className="text-gray-500 text-[10px]">Search Ranking</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#c0ff72]">
                            <DollarSign size={16} />
                        </div>
                        <div>
                            <p className="text-white text-[10px] font-bold uppercase tracking-wider">1.5% Fee</p>
                            <p className="text-gray-500 text-[10px]">Lower payout cuts</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#c0ff72]">
                            <CheckCircle2 size={16} />
                        </div>
                        <div>
                            <p className="text-white text-[10px] font-bold uppercase tracking-wider">Badge</p>
                            <p className="text-gray-500 text-[10px]">Trust Marker</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPerksCard;
