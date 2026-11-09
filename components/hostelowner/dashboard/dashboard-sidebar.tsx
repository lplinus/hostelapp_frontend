'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Store,
    ShoppingCart,
    Package,
    UserCircle,
    Building2,
    BedDouble,
    Hotel,
    CalendarCheck,
    Settings,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Loader2,
    Palmtree
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

function isItemActive(itemHref: string, pathname: string, searchParams: URLSearchParams | null): boolean {
    const [itemPath, itemQuery] = itemHref.split('?');
    const matchesPath = pathname === itemPath || (itemPath !== '/' && pathname.startsWith(itemPath + '/'));
    if (!matchesPath) return false;

    if (itemQuery) {
        const itemParams = new URLSearchParams(itemQuery);
        const itemTab = itemParams.get('tab');
        const currentTab = searchParams?.get('tab');

        if (itemTab) {
            if (currentTab) {
                return currentTab === itemTab;
            }
            // If no tab in URL, default to 'property' for hotel and vacation rental
            if (itemPath === '/hotel' || itemPath === '/vacanrentalbooking') {
                return itemTab === 'property';
            }
            return itemTab === 'bookings';
        }

        for (const [key, value] of itemParams.entries()) {
            if (searchParams?.get(key) !== value) {
                return false;
            }
        }
        return true;
    }

    // If itemHref has no query params, but pathname is /vacanrentalbooking or /hotel:
    if (itemPath === '/vacanrentalbooking' || itemPath === '/hotel') {
        const currentTab = searchParams?.get('tab');
        if (currentTab && currentTab !== 'property') {
            return false;
        }
    }

    return true;
}

function DashboardSidebarContent() {
    const { logout, isLoggingOut } = useAuth();
    const [isOpenMobile, setIsOpenMobile] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleToggle = () => setIsOpenMobile((prev) => !prev);
        window.addEventListener("toggle-sidebar", handleToggle);
        return () => window.removeEventListener("toggle-sidebar", handleToggle);
    }, []);

    const showFull = !isCollapsed || isOpenMobile;

    return (
        <TooltipProvider delayDuration={0}>
            <>
                {/* Mobile Overlay */}
                {isOpenMobile && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 md:hidden"
                        onClick={() => setIsOpenMobile(false)}
                    />
                )}

                <aside
                    className={cn(
                        "fixed md:sticky top-0 inset-y-0 left-0 z-50 h-full md:h-screen bg-card border-r flex flex-col transition-all duration-300 ease-in-out w-64 overflow-hidden",
                        isOpenMobile ? "translate-x-0 shadow-xl" : "-translate-x-full shadow-none",
                        "md:translate-x-0",
                        isCollapsed && !isOpenMobile && 'md:w-[68px]'
                    )}
                >
                    {/* Logo Area */}
                    <div className={cn(
                        "flex items-center h-16 border-b px-4 shrink-0",
                        !showFull && 'justify-center px-2'
                    )}>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2.5 min-w-0"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                                <Building2 className="text-primary-foreground" size={16} />
                            </div>
                            {showFull && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-foreground truncate">
                                        Owner Panel
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-medium">Hostel In</span>
                                </div>
                            )}
                        </Link>

                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="hidden md:flex ml-auto text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 min-h-0 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth overscroll-contain">
                        {showFull && (
                            <p className="px-3 mb-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                Navigation
                            </p>
                        )}

                        {/* 1. Dashboard */}
                        <SidebarLink
                            href="/dashboard"
                            icon={LayoutDashboard}
                            label="Dashboard"
                            pathname={pathname}
                            searchParams={searchParams}
                            showFull={showFull}
                            closeMobile={() => setIsOpenMobile(false)}
                        />

                        {/* 2. Marketplace Dropdown (Merchants, Kirana, My Orders) */}
                        <SidebarDropdown
                            label="Marketplace"
                            icon={ShoppingBag}
                            pathname={pathname}
                            searchParams={searchParams}
                            showFull={showFull}
                            items={[
                                { label: "Merchants", href: "/usermarketplace/vendors", icon: Store },
                                { label: "Kirana", href: "/usermarketplace/online-kirana", icon: ShoppingCart },
                                { label: "My Orders", href: "/usermarketplace/myorders", icon: Package },
                            ]}
                            closeMobile={() => setIsOpenMobile(false)}
                        />

                        {/* 3. Property Dropdown (Hostels, Hotels, Rooms, Vacation Rentals) */}
                        <SidebarDropdown
                            label="Property"
                            icon={Building2}
                            pathname={pathname}
                            searchParams={searchParams}
                            showFull={showFull}
                            items={[
                                { label: "Hostels", href: "/hostel", icon: Building2 },
                                { label: "Hotels", href: "/hotel?tab=property", icon: Hotel },
                                { label: "Rooms", href: "/rooms", icon: BedDouble },
                                { label: "Vacation Rentals", href: "/vacanrentalbooking?tab=property", icon: Palmtree },
                            ]}
                            closeMobile={() => setIsOpenMobile(false)}
                        />

                        {/* 4. Bookings Dropdown */}
                        <SidebarDropdown
                            label="Bookings"
                            icon={CalendarCheck}
                            pathname={pathname}
                            searchParams={searchParams}
                            showFull={showFull}
                            items={[
                                { label: "Hostel Bookings", href: "/bookings", icon: CalendarCheck },
                                { label: "Hotel Bookings", href: "/hotel?tab=bookings", icon: Hotel },
                                { label: "Vacation Stays", href: "/vacanrentalbooking?tab=bookings", icon: Palmtree },
                            ]}
                            closeMobile={() => setIsOpenMobile(false)}
                        />

                        {/* 5. Profile */}
                        <SidebarLink
                            href="/profile"
                            icon={UserCircle}
                            label="Profile"
                            pathname={pathname}
                            searchParams={searchParams}
                            showFull={showFull}
                            closeMobile={() => setIsOpenMobile(false)}
                        />

                        {/* 6. Settings */}
                        <SidebarLink
                            href="/settings"
                            icon={Settings}
                            label="Settings"
                            pathname={pathname}
                            searchParams={searchParams}
                            showFull={showFull}
                            closeMobile={() => setIsOpenMobile(false)}
                        />
                    </nav>

                    {/* Help & Support */}
                    <div className="px-2 py-1 shrink-0">
                        <SidebarLink
                            href="/help&support"
                            icon={Settings}
                            label="Help & Support"
                            pathname={pathname}
                            searchParams={searchParams}
                            showFull={showFull}
                            closeMobile={() => setIsOpenMobile(false)}
                        />
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t shrink-0">
                        {showFull ? (
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 px-3 cursor-pointer"
                                onClick={logout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <LogOut size={18} />
                                )}
                                <span className="text-sm font-medium">Logout</span>
                            </Button>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                        onClick={logout}
                                        disabled={isLoggingOut}
                                    >
                                        {isLoggingOut ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <LogOut size={18} />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Logout</TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </aside>
            </>
        </TooltipProvider>
    );
}

export default function DashboardSidebar() {
    return (
        <Suspense fallback={<aside className="hidden md:flex w-64 h-screen bg-card border-r shrink-0" />}>
            <DashboardSidebarContent />
        </Suspense>
    );
}

function SidebarLink({ href, icon: Icon, label, pathname, searchParams, showFull, closeMobile }: any) {
    const isActive = isItemActive(href, pathname, searchParams);

    const linkContent = (
        <Link
            href={href}
            onClick={closeMobile}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                !showFull && 'justify-center px-0'
            )}
        >
            <Icon size={18} className="shrink-0" />
            {showFull && <span className="truncate">{label}</span>}
        </Link>
    );

    if (!showFull) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                    {label}
                </TooltipContent>
            </Tooltip>
        );
    }

    return linkContent;
}

function SidebarDropdown({ label, icon: Icon, items, pathname, searchParams, showFull, closeMobile }: any) {
    const isChildActive = items.some((item: any) => isItemActive(item.href, pathname, searchParams));
    const [isOpen, setIsOpen] = useState(isChildActive);

    useEffect(() => {
        if (isChildActive) {
            setIsOpen(true);
        }
    }, [isChildActive]);

    const buttonContent = (
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                isChildActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                !showFull && 'justify-center px-0'
            )}
        >
            <Icon size={18} className="shrink-0" />
            {showFull && (
                <>
                    <span className="truncate flex-1 text-left">{label}</span>
                    <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
                </>
            )}
        </button>
    );

    return (
        <div className="space-y-1">
            {!showFull ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        {buttonContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        {label}
                    </TooltipContent>
                </Tooltip>
            ) : (
                buttonContent
            )}

            {isOpen && showFull && (
                <div className="ml-7 pl-2 border-l border-muted space-y-1 py-0.5 animate-in slide-in-from-top-1 duration-150">
                    {items.map((item: any) => {
                        const isSubActive = isItemActive(item.href, pathname, searchParams);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobile}
                                className={cn(
                                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                                    isSubActive
                                        ? "text-primary font-semibold bg-primary/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon size={14} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
