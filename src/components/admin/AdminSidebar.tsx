import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  CalendarCheck,
  Settings,
  LogOut,
  Shield,
  Mail,
  TrendingUp,
  ShieldCheck,
  Home,
  Palette,
  BookOpen,
  ImageIcon,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type AppRole = 'super_admin' | 'admin' | 'moderator' | 'editor' | 'user';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole: AppRole;
}

const mainItems: MenuItem[] = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, minRole: 'editor' },
  { title: 'Leads', url: '/admin/leads', icon: TrendingUp, minRole: 'editor' },
  { title: 'Buchungen', url: '/admin/bookings', icon: CalendarCheck, minRole: 'editor' },
  { title: 'Newsletter', url: '/admin/newsletter', icon: Mail, minRole: 'editor' },
];

const contentItems: MenuItem[] = [
  { title: 'Startseite', url: '/admin/landing-page', icon: Home, minRole: 'editor' },
  { title: 'Demo-Seiten', url: '/admin/demos', icon: Palette, minRole: 'editor' },
  { title: 'Blog', url: '/admin/blog-manage', icon: BookOpen, minRole: 'editor' },
  { title: 'Medien', url: '/admin/media', icon: ImageIcon, minRole: 'editor' },
];

const adminItems: MenuItem[] = [
  { title: 'Benutzer', url: '/admin/users', icon: Users, minRole: 'admin' },
  { title: 'Rollen', url: '/admin/roles', icon: ShieldCheck, minRole: 'super_admin' },
  { title: 'Audit-Logs', url: '/admin/audit-logs', icon: ScrollText, minRole: 'admin' },
];

const settingsItems: MenuItem[] = [
  { title: 'Einstellungen', url: '/admin/settings', icon: Settings, minRole: 'admin' },
];

const roleLabelMap: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  moderator: 'Moderator',
  user: 'User',
};

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const { role, hasMinRole } = useUserRole();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Erfolgreich abgemeldet.');
    navigate('/admin/login', { replace: true });
  };

  const visibleMain = mainItems.filter(item => hasMinRole(item.minRole));
  const visibleContent = contentItems.filter(item => hasMinRole(item.minRole));
  const visibleAdmin = adminItems.filter(item => hasMinRole(item.minRole));
  const visibleSettings = settingsItems.filter(item => hasMinRole(item.minRole));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-display font-semibold text-sm text-sidebar-foreground truncate">
                FastMedia.Pro
              </p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 mt-0.5">
                {roleLabelMap[role ?? ''] ?? 'Loading…'}
              </Badge>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hauptmenü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleContent.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Inhalte</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleContent.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Verwaltung</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleAdmin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleSettings.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleSettings.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Abmelden" onClick={handleLogout}>
              <LogOut className="w-4 h-4 text-destructive" />
              <span className="text-destructive">Abmelden</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
