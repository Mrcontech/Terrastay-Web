import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, User, Loader2 } from 'lucide-react';

interface AuthProps {
    onSuccess?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                if (!fullName.trim()) throw new Error('Full Name is required for signup');

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName.trim(),
                        }
                    }
                });
                if (error) throw error;

                if (data.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: data.user.id,
                                full_name: fullName.trim(),
                                role: 'agent' // Default to agent for web portal signups
                            }
                        ]);
                    if (profileError) console.error('Error creating profile:', profileError);
                }
            }
            onSuccess?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F1113] p-6 font-questrial">
            <div className="w-full max-w-md">
                {/* Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#C0FF72] rounded-lg"></div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Terra<span className="text-[#C0FF72]">Stay</span>
                        </h1>
                    </div>
                    <p className="text-[#A1A1A1] text-sm tracking-wide">Ebonyi State Property Portal</p>
                </div>

                {/* Authentication Card */}
                <div className="bg-[#16181B] rounded-[32px] border border-white/[0.05] p-10 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Agent Account'}
                    </h2>
                    <p className="text-[#A1A1A1] text-sm mb-8 font-medium">
                        {isLogin ? 'Sign in to manage your listings' : 'Join our network of verified agents'}
                    </p>

                    {error && (
                        <div className="bg-[#F44336]/10 border border-[#F44336]/20 text-[#F44336] px-4 py-3 rounded-xl text-xs mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] text-[#6B7280] font-bold uppercase tracking-[0.2em] px-1">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="text-[#6B7280]" size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full bg-[#1A1A1A] border border-white/[0.05] rounded-2xl pl-12 pr-4 h-14 text-white text-sm focus:outline-none focus:border-[#C0FF72]/30 transition-all shadow-sm"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] text-[#6B7280] font-bold uppercase tracking-[0.2em] px-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-[#6B7280]" size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full bg-[#1A1A1A] border border-white/[0.05] rounded-2xl pl-12 pr-4 h-14 text-white text-sm focus:outline-none focus:border-[#C0FF72]/30 transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-[#6B7280] font-bold uppercase tracking-[0.2em] px-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-[#6B7280]" size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#1A1A1A] border border-white/[0.05] rounded-2xl pl-12 pr-12 h-14 text-white text-sm focus:outline-none focus:border-[#C0FF72]/30 transition-all shadow-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#C0FF72] text-[#000000] font-bold h-16 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 mt-4 text-lg"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : isLogin ? (
                                <>
                                    <LogIn size={20} /> Sign In
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} /> Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/[0.03] text-center">
                        <p className="text-[#A1A1A1] text-sm">
                            {isLogin ? "Don't have an account?" : 'Already registered?'}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError(null);
                                }}
                                className="text-[#C0FF72] ml-2 font-bold hover:underline"
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[#6B7280] text-xs font-bold uppercase tracking-[0.2em] mt-10">
                    © {new Date().getFullYear()} TerraStay Ecosystem
                </p>
            </div>
        </div>
    );
};

export default Auth;
