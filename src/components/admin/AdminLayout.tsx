import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center justify-between gap-4 px-4 bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">Admin Back-Office</span>
            </div>
            <LanguageSwitcher />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
