import {
  LayoutDashboard,
  Users,
  ScrollText,
  CalendarCheck,
  Settings,
  LogOut,
  Shield,
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

const mainItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Benutzer', url: '/admin/users', icon: Users },
  { title: 'Audit-Logs', url: '/admin/audit-logs', icon: ScrollText },
  { title: 'Buchungen', url: '/admin/bookings', icon: CalendarCheck },
];

const settingsItems = [
  { title: 'Einstellungen', url: '/admin/settings', icon: Settings },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

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
              <p className="text-xs text-muted-foreground truncate">Admin-Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hauptmenü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
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
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Abmelden">
              <NavLink
                to="/admin/login"
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Abmelden</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
