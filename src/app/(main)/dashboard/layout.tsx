"use client";
import { usePathname, useRouter } from "next/navigation";
import { NavMain } from '@/components/navbar/nav-main';
import { NavUser } from '@/components/navbar/nav-user';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import { CogIcon, Gauge, LibraryBig, Receipt, TagsIcon, UserIcon, UserStarIcon, Clock } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { getAccessToken } from "@/utils/tokenUtils";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Get current page name from pathname
    const getCurrentPageName = () => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1];

        switch (lastSegment) {
            case 'dashboard':
                return 'Dashboard';
            case 'books':
                return 'Books';
            case 'categories':
                return 'Categories';
            case 'pending-categories':
                return 'Pending Categories';
            case 'users':
                return 'Users';
            case 'comments':
                return 'Comments';
            case 'settings':
                return 'Settings';
            default:
                return 'Dashboard';
        }
    };

    const currentPageName = getCurrentPageName();

    const getCurrentPageAbbreviation = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    }

    const truncatePageName = (name: string) => {
        return name.length > 20 ? `${name.substring(0, 17)}...` : name;
    }

    const data = {
        navMain: [
            { title: 'Dashboard', url: '/dashboard', icon: Gauge, isActive: pathname === '/dashboard' },
            { title: 'Books', url: '/dashboard/books', icon: LibraryBig, isActive: pathname.startsWith('/dashboard/books') },
            { title: 'Categories', url: '/dashboard/categories', icon: TagsIcon, isActive: pathname.startsWith('/dashboard/categories') },
            { title: 'Pending Categories', url: '/dashboard/pending-categories', icon: Clock, isActive: pathname.startsWith('/dashboard/pending-categories') },
            { title: 'Users', url: '/dashboard/users', icon: UserIcon, isActive: pathname.startsWith('/dashboard/users') },
            { title: 'Comments', url: '/dashboard/comments', icon: UserStarIcon, isActive: pathname.startsWith('/dashboard/comments') },
            { title: 'Settings', url: '/dashboard/settings', icon: CogIcon, isActive: pathname.startsWith('/dashboard/settings') },
        ]
    }

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader className="border-b border-sidebar-border/30 px-2 py-6">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/50 transition-colors duration-200">
                                <a href="#" className="flex flex-col items-start">
                                    <div className="flex flex-col gap-1 leading-none">
                                        <span className="text-xl font-bold text-sidebar-foreground">EW. Dashboard</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <NavMain items={data.navMain} />
                </SidebarContent>
                <SidebarFooter>
                    <NavUser />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink>Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{truncatePageName(currentPageName)}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}