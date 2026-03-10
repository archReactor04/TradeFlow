import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Wallet, Upload, Lightbulb, GraduationCap,
} from 'lucide-react';
import TradeFlowLogo from '@/components/TradeFlowLogo';
import JesseIcon from '@/components/JesseIcon';
import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup,
  SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarRail,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

const JesseNavIcon = (props) => <JesseIcon {...props} />;

const NAV_ITEMS = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { title: 'Trade Log', icon: BookOpen, path: '/TradeLog' },
  { title: 'Accounts', icon: Wallet, path: '/Accounts' },
  { title: 'Strategies', icon: Lightbulb, path: '/Strategies' },
  { title: 'Bulk Import', icon: Upload, path: '/BulkImport' },
  { title: 'Mentor Mode', icon: GraduationCap, path: '/Mentor' },
  { title: 'Jesse AI', icon: JesseNavIcon, path: '/AIChat' },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <Link to="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <TradeFlowLogo className="h-8 w-8 shrink-0" />
            <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">TradeFlow</span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link to={item.path}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">
            {NAV_ITEMS.find((n) =>
              n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)
            )?.title ?? 'TradeFlow'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
