import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';
import AdminToolSearch from './AdminToolSearch';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminLayout = () => {
  const { t } = useLanguage();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center justify-between gap-4 px-4 bg-card">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <SidebarTrigger />
              <span className="hidden md:inline text-sm font-medium text-muted-foreground">{t('admin.backoffice')}</span>
              <AdminToolSearch />
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
