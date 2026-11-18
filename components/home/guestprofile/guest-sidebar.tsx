'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    LayoutDashboard,
    UserCircle,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Loader2,
    CalendarCheck,
    Globe,
    Hotel,
    Menu,
    Settings,
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

interface NavItem {
    href: string;
    icon: React.ElementType;
    label: string;
    badge?: string;
}

export default function GuestSidebar() {
    const { logout, isLoggingOut } = useAuth();
    const [isOpenMobile, setIsOpenMobile] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'dashboard';

    useEffect(() => {
        const handleToggle = () => setIsOpenMobile((prev) => !prev);
        window.addEventListener('toggle-sidebar', handleToggle);
        return () => window.removeEventListener('toggle-sidebar', handleToggle);
    }, []);

    const showFull = !isCollapsed || isOpenMobile;

    const guestNavItems: NavItem[] = [
        {
            href: '/home/guestprofile',
            icon: LayoutDashboard,
            label: 'Dashboard',
        },
        {
            href: '/home/guestprofile?tab=profile',
            icon: UserCircle,
            label: 'Profile & Documents',
        },
        {
            href: '/home/guestprofile?tab=bookings',
            icon: CalendarCheck,
            label: 'My Bookings',
        },
        {
            href: '/hotels',
            icon: Hotel,
            label: 'Explore Hotels',
        },
        {
            href: '/home/guestprofile/settings',
            icon: Settings,
            label: 'Settings',
        },
    ];

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
                        'fixed md:sticky top-0 inset-y-0 left-0 z-50 h-full md:h-screen bg-card border-r flex flex-col transition-all duration-300 ease-in-out w-64 overflow-hidden select-none',
                        isOpenMobile ? 'translate-x-0 shadow-xl' : '-translate-x-full shadow-none',
                        'md:translate-x-0',
                        isCollapsed && !isOpenMobile && 'md:w-[68px]'
                    )}
                >
                    {/* Logo & Brand Area */}
                    <div
                        className={cn(
                            'flex items-center h-16 border-b px-4 shrink-0',
                            !showFull && 'justify-center px-2'
                        )}
                    >
                        <Link
                            href="/home/guestprofile"
                            className="flex items-center gap-2.5 min-w-0"
                        >
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                                <UserCircle className="text-white" size={18} />
                            </div>
                            {showFull && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-foreground truncate tracking-tight">
                                        Guest Portal
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                        Hostel In
                                    </span>
                                </div>
                            )}
                        </Link>

                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="hidden md:flex ml-auto text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </Button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 min-h-0 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth overscroll-contain">
                        {showFull && (
                            <p className="px-3 mb-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Navigation
                            </p>
                        )}

                        {guestNavItems.map((item) => {
                            const Icon = item.icon;
                            const isTabProfile = item.href.includes("tab=profile");
                            const isTabBookings = item.href.includes("tab=bookings");
                            const isSettings = item.href === "/home/guestprofile/settings";
                            const isExplore = item.href === "/hotels";
                            const isActive = isSettings
                                ? pathname === "/home/guestprofile/settings"
                                : isExplore
                                ? pathname === "/hotels"
                                : isTabProfile
                                ? currentTab === "profile" && pathname === "/home/guestprofile"
                                : isTabBookings
                                ? currentTab === "bookings" && pathname === "/home/guestprofile"
                                : currentTab === "dashboard" && pathname === "/home/guestprofile";

                            return (
                                <div key={item.href}>
                                    {!showFull ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setIsOpenMobile(false)}
                                                    className={cn(
                                                        'flex items-center justify-center w-full h-10 rounded-lg transition-colors cursor-pointer',
                                                        isActive
                                                            ? 'bg-primary/10 text-primary font-bold'
                                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    )}
                                                >
                                                    <Icon size={18} />
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="font-semibold text-xs">
                                                {item.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpenMobile(false)}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer group',
                                                isActive
                                                    ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                                                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                            )}
                                        >
                                            <Icon
                                                size={18}
                                                className={cn(
                                                    'shrink-0 transition-transform group-hover:scale-105',
                                                    isActive ? 'text-primary' : 'text-muted-foreground'
                                                )}
                                            />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Footer / Logout */}
                    <div className="p-2 border-t shrink-0">
                        {showFull ? (
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 px-3 cursor-pointer font-semibold text-sm"
                                onClick={logout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <Loader2 className="animate-spin text-destructive" size={18} />
                                ) : (
                                    <LogOut size={18} />
                                )}
                                <span>{isLoggingOut ? 'Logging out...' : 'Sign Out'}</span>
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
                                            <Loader2 className="animate-spin text-destructive" size={18} />
                                        ) : (
                                            <LogOut size={18} />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-semibold text-xs">
                                    Sign Out
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </aside>

                {/* MOBILE BOTTOM APP DOCK (Native mobile app experience, matches Owner Dashboard) */}
                <nav
                    aria-label="Mobile Guest Dock"
                    className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-md border-t border-border/80 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
                >
                    {/* 1. Overview */}
                    <Link
                        href="/home/guestprofile"
                        className={cn(
                            "flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-all select-none active:scale-95",
                            currentTab === "dashboard" && pathname === "/home/guestprofile"
                                ? "text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-md transition-colors",
                            currentTab === "dashboard" && pathname === "/home/guestprofile" ? "bg-primary/10 text-primary" : "bg-transparent"
                        )}>
                            <LayoutDashboard size={19} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold">Overview</span>
                    </Link>

                    {/* 2. My Bookings */}
                    <Link
                        href="/home/guestprofile?tab=bookings"
                        className={cn(
                            "flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-all select-none active:scale-95",
                            currentTab === "bookings"
                                ? "text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-md transition-colors",
                            currentTab === "bookings" ? "bg-primary/10 text-primary" : "bg-transparent"
                        )}>
                            <CalendarCheck size={19} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold">Bookings</span>
                    </Link>

                    {/* 3. Profile & KYC */}
                    <Link
                        href="/home/guestprofile?tab=profile"
                        className={cn(
                            "flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-all select-none active:scale-95",
                            currentTab === "profile"
                                ? "text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-md transition-colors",
                            currentTab === "profile" ? "bg-primary/10 text-primary" : "bg-transparent"
                        )}>
                            <UserCircle size={19} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold">Profile</span>
                    </Link>

                    {/* 4. Explore Stays */}
                    <Link
                        href="/home/hotels"
                        className={cn(
                            "flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-all select-none active:scale-95",
                            "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className="p-1.5 rounded-md bg-transparent">
                            <Hotel size={19} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold">Explore</span>
                    </Link>

                    {/* 5. Menu / More */}
                    <button
                        type="button"
                        onClick={() => setIsOpenMobile(true)}
                        className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-all select-none cursor-pointer active:scale-95"
                    >
                        <div className="p-1.5 rounded-md bg-transparent">
                            <Menu size={19} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold">More</span>
                    </button>
                </nav>
            </>
        </TooltipProvider>
    );
}

