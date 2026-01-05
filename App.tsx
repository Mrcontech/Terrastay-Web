
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import RecentInspections from './components/RecentInspections';
import ActiveListings from './components/ActiveListings';
import SalesHistory from './components/SalesHistory';
import AdminDashboard from './components/AdminDashboard';
import PropertiesView from './components/PropertiesView';
import BookingsView from './components/BookingsView';
import LodgeFormModal from './components/LodgeFormModal';
import SettingsView from './components/SettingsView';
import Auth from './components/Auth.tsx';
import UsersView from './components/UsersView';
import ChatInboxView from './components/ChatInboxView';
import AdminBookingsView from './components/AdminBookingsView';
import AdminVerificationView from './components/AdminVerificationView';
import IdentityVerificationView from './components/IdentityVerificationView';
import VerificationBanner from './components/VerificationBanner';
import { supabase } from './lib/supabase';
import { X } from 'lucide-react';

export type ViewType = 'agent' | 'admin' | 'properties' | 'tenants' | 'bookings' | 'settings' | 'support' | 'users' | 'admin_bookings' | 'admin_verification' | 'chat' | 'kyc';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('agent');
  const [isAddLodgeModalOpen, setIsAddLodgeModalOpen] = useState(false);
  const [editingLodge, setEditingLodge] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    switch (currentView) {
      case 'agent':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Row: Quick Stats */}
            <StatsOverview />

            {/* Main Content: Listings, Inspections, and Sales */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-8 space-y-8">
                <ActiveListings onEditLodge={(lodge) => {
                  setEditingLodge(lodge);
                  setIsAddLodgeModalOpen(true);
                }} />
                <SalesHistory />
              </div>
              <div className="xl:col-span-4">
                <RecentInspections />
              </div>
            </div>
          </div>
        );
      case 'properties':
        return <PropertiesView onAddLodge={() => {
          setEditingLodge(null);
          setIsAddLodgeModalOpen(true);
        }} onEditLodge={(lodge) => {
          setEditingLodge(lodge);
          setIsAddLodgeModalOpen(true);
        }} />;
      case 'bookings':
        return <BookingsView />;
      case 'admin':
        return <AdminDashboard />;
      case 'chat':
        return <ChatInboxView />;
      case 'settings':
        return <SettingsView />;
      case 'users':
        return <UsersView />;
      case 'admin_bookings':
        return <AdminBookingsView />;
      case 'admin_verification':
        return <AdminVerificationView />;
      case 'kyc':
        return <IdentityVerificationView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-2">
              <X size={32} />
            </div>
            <h2 className="text-2xl font-bold">View Under Construction</h2>
            <p className="text-gray-500 max-w-xs">We're working hard to bring you the {currentView} module. Stay tuned!</p>
            <button
              onClick={() => setCurrentView('agent')}
              className="px-6 py-2 bg-[#c0ff72] text-black font-bold rounded-full hover:shadow-[0_0_20px_rgba(192,255,114,0.3)] transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        );
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'agent': return 'Agent Dashboard';
      case 'admin': return 'Platform Administration';
      case 'properties': return 'My Lodges';
      case 'bookings': return 'Inspection Inbox';
      case 'tenants': return 'Tenant Directory';
      case 'settings': return 'System Settings';
      case 'support': return 'Help & Support';
      case 'users': return 'Platform User Directory';
      case 'admin_bookings': return 'Platform-wide Inspections';
      case 'admin_verification': return 'Lodge Verification Queue';
      case 'chat': return 'Chat Inbox';
      default: return 'Terrastay Portal';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1113] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#c0ff72]/20 border-t-[#c0ff72] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth onSuccess={() => { }} />;
  }

  return (
    <div className="flex min-h-screen bg-[#0f1113] text-white overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-[#0f1113]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 border-r border-white/5
      `}>
        <Sidebar currentView={currentView} onViewChange={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 transition-all duration-300 w-full md:ml-64 p-4 md:p-8 bg-[#0f1113]">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <VerificationBanner onAction={setCurrentView} />
          <Header
            onMenuClick={toggleSidebar}
            viewTitle={getViewTitle()}
            onQuickAction={() => {
              setEditingLodge(null);
              setIsAddLodgeModalOpen(true);
            }}
          />
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      {isAddLodgeModalOpen && (
        <LodgeFormModal
          onClose={() => {
            setIsAddLodgeModalOpen(false);
            setEditingLodge(null);
          }}
          initialData={editingLodge}
        />
      )}
    </div>
  );
};

export default App;
