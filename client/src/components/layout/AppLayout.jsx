import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

/**
 * Main app shell: sidebar on desktop, bottom nav on mobile.
 * All authenticated pages render inside <Outlet />.
 */
const AppLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Page content */}
      <main className="flex-1 min-h-screen overflow-x-hidden pb-20 md:pb-0">
        {/* Subtle top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
