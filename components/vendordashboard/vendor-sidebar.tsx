'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Store,
    ShoppingCart,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Package,
    UserCircle,
    Settings,
    LogOut,
    Loader2,
    CreditCard,
    Bell,
    Lock
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

export default function VendorSidebar() {
    const { user, logout, isLoggingOut } = useAuth();
    const [isOpenMobile, setIsOpenMobile] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleToggle = () => setIsOpenMobile((prev) => !prev);
        window.addEventListener("toggle-sidebar", handleToggle);
        return () => window.removeEventListener("toggle-sidebar", handleToggle);
    }, []);

    // Use cookie as instant fallback so sidebar renders correctly before user data loads
    const cookieRole = typeof document !== 'undefined'
        ? (document.cookie.match(/(^| )user_role=([^;]+)/)?.[2] || null)
        : null;
    const role = user?.role || cookieRole;

    const menuItems = role === 'vendor'
        ? [
            { href: '/vendordashboard/vendors', icon: LayoutDashboard, label: 'Dashboard', locked: false },
            { href: '/profile', icon: UserCircle, label: 'Profile', locked: false },
            { href: '/vendordashboard/orders', icon: ShoppingCart, label: 'My Orders', locked: true },
            { href: '/vendordashboard/products', icon: Package, label: 'Products', locked: true },
            { href: '/vendordashboard/notifications', icon: Bell, label: 'Notifications', locked: true },
            { href: '/vendordashboard/vendorssettings', icon: Settings, label: 'Settings', locked: true },
        ]
        : [
            { href: '/dashboard', icon: LayoutDashboard, label: 'Main Dashboard' },
            { href: '/vendordashboard/vendors', icon: Store, label: 'Marketplace' },
            { href: '/vendordashboard/orders', icon: ShoppingCart, label: 'My Orders' },
            { href: '/vendordashboard/notifications', icon: Bell, label: 'Notifications' },
            { href: '/vendordashboard/vendorssettings', icon: Settings, label: 'Settings' },
            { href: '/profile', icon: UserCircle, label: 'Profile' }
        ];

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
                        "fixed md:sticky top-0 inset-y-0 left-0 z-50 h-full md:h-screen bg-card border-r flex flex-col transition-all duration-300 ease-in-out w-64",
                        isOpenMobile ? "translate-x-0 shadow-xl" : "-translate-x-full shadow-none",
                        "md:translate-x-0",
                        isCollapsed && !isOpenMobile && 'md:w-[68px]'
                    )}
                >
                    {/* Logo Area */}
                    <div className={cn(
                        "flex items-center h-16 border-b px-4",
                        !showFull && 'justify-center px-2'
                    )}>
                        <Link
                            href={role === 'vendor' ? "/vendordashboard/vendors" : "/dashboard"}
                            className="flex items-center gap-2.5 min-w-0"
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                                <Store className="text-primary-foreground" size={16} />
                            </div>
                            {showFull && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-foreground truncate">
                                        {role === 'vendor' ? 'Vendor Panel' : 'Marketplace'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-medium">Hostel In</span>
                                </div>
                            )}
                        </Link>

                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="hidden md:flex ml-auto text-muted-foreground hover:text-foreground"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
                        {showFull && (
                            <p className="px-3 mb-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                Navigation
                            </p>
                        )}

                        {menuItems.map((item: any) => {
                            const isActive = pathname === item.href;
                            const isLocked = item.locked;

                            if (isLocked) {
                                const lockedContent = (
                                    <div
                                        key={item.href}
                                        aria-disabled="true"
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-not-allowed select-none opacity-40 text-muted-foreground bg-muted/10 border border-transparent",
                                            !showFull && 'justify-center px-0'
                                        )}
                                    >
                                        <item.icon size={18} className="shrink-0 text-muted-foreground/60" />
                                        {showFull && (
                                            <div className="flex items-center justify-between flex-1 min-w-0">
                                                <span className="truncate">{item.label}</span>
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/60 ml-2 shrink-0">
                                                    <Lock size={10} />
                                                    Locked
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );

                                if (!showFull) {
                                    return (
                                        <Tooltip key={item.href}>
                                            <TooltipTrigger asChild>
                                                {lockedContent}
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="flex items-center gap-1.5 text-xs">
                                                <Lock size={12} />
                                                <span>{item.label} (Locked)</span>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                }

                                return lockedContent;
                            }

                            const linkContent = (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        !showFull && 'justify-center px-0'
                                    )}
                                >
                                    <item.icon size={18} className="shrink-0" />
                                    {showFull && <span className="truncate">{item.label}</span>}
                                </Link>
                            );

                            if (!showFull) {
                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>
                                            {linkContent}
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            {item.label}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return linkContent;
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-2 border-t">
                        {showFull ? (
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 px-3"
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
                                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
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
