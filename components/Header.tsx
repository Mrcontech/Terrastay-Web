import React, { useEffect, useState } from 'react';
import { Search, Bell, Plus, Menu, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onMenuClick: () => void;
  viewTitle?: string;
  onQuickAction?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, viewTitle = "Manage Properties", onQuickAction }) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => setProfile(data));
      }
    });
  }, []);

  const isAgent = profile?.role === 'agent';
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 md:hidden bg-[#16181b] border border-white/5 rounded-lg text-gray-400"
          >
            <Menu size={24} />
          </button>
          <div>
            <p className="text-gray-400 text-xs md:text-sm font-medium mb-1">Terrastay Portal</p>
            <h1 className="text-xl md:text-3xl font-bold">{viewTitle}</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto">
        <div className="relative group flex-1 md:flex-none">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-white transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search everything..."
            className="bg-[#16181b] border border-white/5 rounded-full pl-11 pr-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#c0ff72]/30 transition-all text-sm"
          />
        </div>

        {isAgent && (
          <button
            onClick={onQuickAction}
            className="hidden sm:flex bg-[#c0ff72] text-black px-4 py-2 rounded-full items-center gap-2 text-sm font-bold hover:shadow-[0_0_20px_rgba(192,255,114,0.3)] transition-all flex-shrink-0"
          >
            <Plus size={18} />
            <span className="hidden lg:inline">Quick Action</span>
          </button>
        )}

        <button className="relative w-10 h-10 md:w-11 md:h-11 bg-[#16181b] border border-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-2 h-2 bg-[#c0ff72] rounded-full border-2 border-[#0f1113]"></span>
        </button>

        <div className="flex items-center gap-2 md:gap-3 pl-1 flex-shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/10 bg-[#16181b] flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="profile" />
            ) : (
              <User size={18} className="text-gray-500" />
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold leading-none truncate max-w-[100px]">{profile?.full_name || 'Loading...'}</p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">{profile?.role || 'User'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
