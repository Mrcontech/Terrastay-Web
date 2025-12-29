import React from 'react';
import { Home, Building2, Users, CalendarCheck, Settings, ShieldCheck, HelpCircle, LogOut, Calendar, MessageSquare } from 'lucide-react';
import { ViewType } from '../App';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
          .then(({ data }) => setRole(data?.role || null));
      }
    });
  }, []);

  const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', id: 'agent' as const },
    { icon: <Building2 size={20} />, label: 'My Lodges', id: 'properties' as const },
    { icon: <MessageSquare size={20} />, label: 'Messages', id: 'chat' as const },
    { icon: <CalendarCheck size={20} />, label: 'Inspections', id: 'bookings' as const },
    { icon: <ShieldCheck size={20} />, label: 'Identity Verification', id: 'kyc' as const },
  ];

  const adminItems = [
    ...(role === 'admin' ? [
      { icon: <ShieldCheck size={20} />, label: 'Admin Portal', id: 'admin' as const },
      { icon: <ShieldCheck size={20} />, label: 'Verifications', id: 'admin_verification' as const },
      { icon: <Users size={20} />, label: 'All Users', id: 'users' as const },
      { icon: <Calendar size={20} />, label: 'All Inspections', id: 'admin_bookings' as const },
    ] : []),
    { icon: <Settings size={20} />, label: 'Settings', id: 'settings' as const },
    { icon: <HelpCircle size={20} />, label: 'Support', id: 'support' as const },
  ];

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await supabase.auth.signOut();
    }
  };

  // Fix: Explicitly typed as React.FC to handle internal React props like 'key' correctly during mapping
  const NavButton: React.FC<{ item: { icon: React.ReactNode, label: string, id: ViewType } }> = ({ item }) => {
    const isActive = currentView === item.id;
    return (
      <button
        onClick={() => onViewChange(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
          ? 'bg-[#c0ff72] text-black shadow-[0_0_20px_rgba(192,255,114,0.2)]'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
      >
        <span className={`${isActive ? 'text-black' : 'group-hover:text-[#c0ff72]'} transition-colors`}>
          {item.icon}
        </span>
        <span className="font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="h-full bg-[#16181b] border-r border-white/5 flex flex-col p-6">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#c0ff72] rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-[#0f1113] rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight">Terrastay</span>
        </div>
      </div>

      <div className="space-y-1 mb-10">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-4 px-2">Management</p>
        {menuItems.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-4 px-2">Platform</p>
        {adminItems.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}
      </div>

      <div className="mt-auto space-y-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>

        <div className="bg-[#212429] rounded-2xl p-4 relative overflow-hidden group border border-white/5">
          <p className="text-xs font-bold text-white mb-1">Agent Support</p>
          <p className="text-[10px] text-gray-500">Need help listing a new lodge?</p>
          <button className="mt-3 text-[10px] text-[#c0ff72] font-bold uppercase tracking-widest flex items-center gap-1">
            Contact Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
