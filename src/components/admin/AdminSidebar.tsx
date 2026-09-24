import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
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
  Map,
  History,
  Search,
  Send,
  Code2,
  Receipt,
  UserCog,
  Plug,
  Download,
  FolderKanban,
  Eye,
  Volume2,
  Activity,
  TicketPercent,
  Scale,
  Inbox,
  FileCheck2,
  GraduationCap,
  Phone,
  Sparkles,
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
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type AppRole = 'super_admin' | 'admin' | 'moderator' | 'editor' | 'user';

export interface MenuItem {
  titleKey: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole: AppRole;
}

export const mainItems: MenuItem[] = [
  { titleKey: 'admin.dashboard', url: '/admin', icon: LayoutDashboard, minRole: 'editor' },
  { titleKey: 'admin.leads', url: '/admin/leads', icon: TrendingUp, minRole: 'editor' },
  { titleKey: 'Enquiries Inbox', url: '/admin/enquiries', icon: Inbox, minRole: 'admin' },
  { titleKey: 'Quote Requests', url: '/admin/quote-requests', icon: FileText, minRole: 'admin' },
  { titleKey: 'Offer Enquiries', url: '/admin/offer-leads', icon: FileText, minRole: 'admin' },
  { titleKey: 'Grant follow-up', url: '/admin/grant-follow-up', icon: FileText, minRole: 'admin' },
  { titleKey: 'Support Inbox', url: '/admin/inbox', icon: Inbox, minRole: 'admin' },
  { titleKey: 'Clients', url: '/admin/clients', icon: Users, minRole: 'admin' },
  { titleKey: 'Project Tracker', url: '/admin/tracker', icon: FolderKanban, minRole: 'admin' },
  { titleKey: 'admin.bookings', url: '/admin/bookings', icon: CalendarCheck, minRole: 'editor' },
  { titleKey: 'admin.newsletter', url: '/admin/newsletter', icon: Mail, minRole: 'editor' },
  { titleKey: 'admin.vbout', url: '/admin/vbout', icon: Send, minRole: 'editor' },
  { titleKey: 'Vbout Debug', url: '/admin/vbout-debug', icon: Activity, minRole: 'admin' },
  { titleKey: 'admin.accounting', url: '/admin/accounting', icon: Receipt, minRole: 'admin' },
  { titleKey: 'Coupons', url: '/admin/coupons', icon: TicketPercent, minRole: 'admin' },
  { titleKey: 'Courses', url: '/admin/courses', icon: GraduationCap, minRole: 'editor' },
  { titleKey: 'Case Studies', url: '/admin/case-studies', icon: Eye, minRole: 'editor' },
  { titleKey: 'admin.emails', url: '/admin/emails', icon: Mail, minRole: 'admin' },
  { titleKey: 'Email Queue Health', url: '/admin/email-queue', icon: Activity, minRole: 'admin' },
  { titleKey: 'Email Dashboard', url: '/admin/email-dashboard', icon: Inbox, minRole: 'admin' },
  { titleKey: 'Email Deliverability', url: '/admin/email-deliverability', icon: Send, minRole: 'admin' },
  { titleKey: 'Lead Emails', url: '/admin/lead-emails', icon: Search, minRole: 'admin' },
  { titleKey: 'admin.hr', url: '/admin/hr', icon: UserCog, minRole: 'admin' },
  { titleKey: 'admin.client_projects', url: '/admin/client-projects', icon: FolderKanban, minRole: 'editor' },
  { titleKey: 'Prospecting desk', url: '/admin/prospecting', icon: Send, minRole: 'admin' },
  { titleKey: 'Find leads', url: '/admin/prospecting?find=1', icon: Search, minRole: 'admin' },
  { titleKey: 'Voice agent', url: '/admin/voice-agent', icon: Phone, minRole: 'admin' },
  { titleKey: 'Flowlu CRM', url: '/admin/flowlu', icon: Phone, minRole: 'admin' },
  { titleKey: 'Language versions', url: '/admin/language-versions', icon: Map, minRole: 'admin' },
  { titleKey: 'Showcase', url: '/admin/showcase', icon: Eye, minRole: 'admin' },
];

export const contentItems: MenuItem[] = [
  { titleKey: 'admin.homepage', url: '/admin/landing-page', icon: Home, minRole: 'editor' },
  { titleKey: 'admin.demo_pages', url: '/admin/demos', icon: Palette, minRole: 'editor' },
  { titleKey: 'admin.blog', url: '/admin/blog-manage', icon: BookOpen, minRole: 'editor' },
  { titleKey: 'TTS Test Lab', url: '/admin/tts-test', icon: Volume2, minRole: 'admin' },
  { titleKey: 'admin.media', url: '/admin/media', icon: ImageIcon, minRole: 'editor' },
  { titleKey: 'admin.seo', url: '/admin/seo', icon: Search, minRole: 'super_admin' },
  { titleKey: 'SEO Insights', url: '/admin/seo-insights', icon: TrendingUp, minRole: 'admin' },
  { titleKey: 'SEO Health Monitor', url: '/admin/seo-health', icon: Activity, minRole: 'admin' },
  { titleKey: 'AI Search Visibility', url: '/admin/geo', icon: Sparkles, minRole: 'admin' },
  { titleKey: 'admin.sitemap', url: '/admin/sitemap', icon: Map, minRole: 'admin' },
  { titleKey: 'admin.versions', url: '/admin/content-history', icon: History, minRole: 'admin' },
  { titleKey: 'Legal Documents', url: '/admin/legal', icon: Scale, minRole: 'admin' },
];

export const publicPageItems: MenuItem[] = [
  { titleKey: 'Offer page', url: '/offer', icon: TicketPercent, minRole: 'editor' },
  { titleKey: 'Case studies', url: '/case-studies', icon: Eye, minRole: 'editor' },
  { titleKey: 'Grant wizard form', url: '/grant-wizard', icon: FileText, minRole: 'editor' },
  { titleKey: 'Grant eligibility', url: '/grant-eligibility', icon: FileCheck2, minRole: 'editor' },
  { titleKey: 'Grant hubs map', url: '/eugrants', icon: Map, minRole: 'editor' },
  { titleKey: 'EU creative grant', url: '/eu-creative-grant', icon: Map, minRole: 'editor' },
  { titleKey: 'Grant business plan', url: '/grant-business-plan', icon: Map, minRole: 'editor' },
  { titleKey: 'EU language websites', url: '/eu-language-websites', icon: Map, minRole: 'editor' },
  { titleKey: 'Grant process', url: '/grant-process', icon: FileCheck2, minRole: 'editor' },
  { titleKey: 'Service landing pages', url: '/service/websites', icon: Eye, minRole: 'editor' },
];

export const adminItems: MenuItem[] = [
  { titleKey: 'admin.users', url: '/admin/users', icon: Users, minRole: 'admin' },
  { titleKey: 'admin.roles', url: '/admin/roles', icon: ShieldCheck, minRole: 'super_admin' },
  { titleKey: 'admin.audit_logs', url: '/admin/audit-logs', icon: ScrollText, minRole: 'admin' },
];

export const settingsItems: MenuItem[] = [
  { titleKey: 'admin.embed_codes', url: '/admin/embed-codes', icon: Code2, minRole: 'super_admin' },
  { titleKey: 'admin.integrations', url: '/admin/integrations', icon: Plug, minRole: 'admin' },
  { titleKey: 'admin.export', url: '/admin/export', icon: Download, minRole: 'admin' },
  { titleKey: 'admin.settings', url: '/admin/settings', icon: Settings, minRole: 'admin' },
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
  const { t } = useLanguage();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t('admin.sign_out'));
    navigate('/admin/login', { replace: true });
  };

  const visibleMain = mainItems.filter(item => hasMinRole(item.minRole));
  const visibleContent = contentItems.filter(item => hasMinRole(item.minRole));
  const visiblePublicPages = publicPageItems.filter(item => hasMinRole(item.minRole));
  const visibleAdmin = adminItems.filter(item => hasMinRole(item.minRole));
  const visibleSettings = settingsItems.filter(item => hasMinRole(item.minRole));

  const renderGroup = (items: MenuItem[], label: string) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const title = t(item.titleKey);
            return (
              <SidebarMenuItem key={item.titleKey}>
                <SidebarMenuButton asChild tooltip={title}>
                  <NavLink
                    to={item.url}
                    end={item.url === '/admin'}
                    className="hover:bg-sidebar-accent"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

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
        {visibleMain.length > 0 && renderGroup(visibleMain, t('admin.main_menu'))}
        {visibleContent.length > 0 && renderGroup(visibleContent, t('admin.content'))}
        {visiblePublicPages.length > 0 && renderGroup(visiblePublicPages, 'Public pages')}
        {visibleAdmin.length > 0 && renderGroup(visibleAdmin, t('admin.administration'))}
        {visibleSettings.length > 0 && renderGroup(visibleSettings, t('admin.system'))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t('admin.sign_out')} onClick={handleLogout}>
              <LogOut className="w-4 h-4 text-destructive" />
              <span className="text-destructive">{t('admin.sign_out')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
