"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Building2, BedDouble, CalendarCheck, Settings, Menu, ChevronLeft, ChevronRight, Zap, ShoppingBag, Store, ShoppingCart, ChevronDown, Package, LogOut, Loader2 } from "lucide-react";

export default function DashboardSidebar() {
  const { logout, isLoggingOut } = useAuth();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleToggle = () => setIsOpenMobile((prev) => !prev);
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  return (
    <div className="font-poppins">
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 inset-y-0 left-0 z-40 h-full md:h-screen bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col
          w-64
          ${isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"} 
          md:translate-x-0 
          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        <div className={`flex items-center h-20 px-4 ${isCollapsed ? "md:justify-center" : "justify-between"}`}>

          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Image
                src="/images/icon.webp"
                alt="Logo"
                fill
                className="object-contain p-0.5"
              />
            </div>
            {(!isCollapsed || isOpenMobile) && (
              <span className="font-bold text-xl text-gray-900 tracking-tight whitespace-nowrap group-hover:text-blue-600 transition-colors">
                Hostel In
              </span>
            )}
          </Link>

          <button
            className="hidden md:flex p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full absolute -right-4 top-7 bg-white border shadow-sm z-50 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg inline-flex transition-colors"
            onClick={() => setIsOpenMobile(false)}
          >
            <Menu size={22} />
          </button>
        </div>

        <nav className="space-y-1.5 px-3 flex-1 overflow-y-auto py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" pathname={pathname} isCollapsed={isCollapsed && !isOpenMobile} closeMobile={() => setIsOpenMobile(false)} />
          
          <SidebarDropdownItem 
            label="Marketplace" 
            icon={ShoppingBag} 
            isCollapsed={isCollapsed && !isOpenMobile}
            pathname={pathname}
            items={[
              { label: "Online Kirana", href: "/usermarketplace/online-kirana", icon: ShoppingCart },
              { label: "Vendors", href: "/usermarketplace/vendors", icon: Store },
              { label: "My Orders", href: "/usermarketplace/myorders", icon: Package },
            ]}
            closeMobile={() => setIsOpenMobile(false)}
          />

          <SidebarItem href="/profile" icon={Settings} label="Profile" pathname={pathname} isCollapsed={isCollapsed && !isOpenMobile} closeMobile={() => setIsOpenMobile(false)} />
          <SidebarItem href="/hostel" icon={Building2} label="Hostels" pathname={pathname} isCollapsed={isCollapsed && !isOpenMobile} closeMobile={() => setIsOpenMobile(false)} />
          <SidebarItem href="/rooms" icon={BedDouble} label="Rooms" pathname={pathname} isCollapsed={isCollapsed && !isOpenMobile} closeMobile={() => setIsOpenMobile(false)} />
          <SidebarItem href="/bookings" icon={CalendarCheck} label="Bookings" pathname={pathname} isCollapsed={isCollapsed && !isOpenMobile} closeMobile={() => setIsOpenMobile(false)} />
          <SidebarItem href="/subscription" icon={Zap} label="Subscription" pathname={pathname} isCollapsed={isCollapsed && !isOpenMobile} closeMobile={() => setIsOpenMobile(false)} />
          <SidebarItem href="/help&support" icon={Settings} label="Help & Support" pathname={pathname} isCollapsed={isCollapsed && !isOpenMobile} closeMobile={() => setIsOpenMobile(false)} />
          <SidebarItem href="/settings" icon={Settings} label="Settings" pathname={pathname} isCollapsed={isCollapsed && !isOpenMobile} closeMobile={() => setIsOpenMobile(false)} />
        </nav>

        <div className={`p-4 border-t border-gray-100 ${isCollapsed && !isOpenMobile ? "flex justify-center" : ""}`}>
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className={`flex items-center ${isCollapsed && !isOpenMobile ? "justify-center" : "gap-3"} w-full p-3 rounded-xl transition-all duration-200 outline-none group relative overflow-visible
              text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50`}
          >
            {isLoggingOut ? (
              <Loader2 size={isCollapsed && !isOpenMobile ? 22 : 20} className="animate-spin" />
            ) : (
              <LogOut size={isCollapsed && !isOpenMobile ? 22 : 20} className="group-hover:-translate-x-1 transition-transform" />
            )}
            {(!isCollapsed || isOpenMobile) && <span className="truncate font-medium">Logout Session</span>}

            {isCollapsed && !isOpenMobile && (
              <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-sm pointer-events-none whitespace-nowrap">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}

function SidebarItem({ href, icon: Icon, label, pathname, isCollapsed, closeMobile }: any) {
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-xl transition-all duration-200 outline-none group relative overflow-visible
        ${isActive
          ? 'bg-blue-50 text-blue-600 font-medium'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
      onClick={closeMobile}
    >
      <Icon size={isCollapsed ? 22 : 20} className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`} />
      {!isCollapsed && <span className="truncate">{label}</span>}

      {/* Tooltip for collapsed state (Desktop only) */}
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-sm pointer-events-none whitespace-nowrap">
          {label}
        </div>
      )}
    </Link>
  );
}

function SidebarDropdownItem({ label, icon: Icon, items, pathname, isCollapsed, closeMobile }: any) {
  const [isOpen, setIsOpen] = useState(pathname.startsWith('/usermarketplace'));
  const isActive = pathname.startsWith('/usermarketplace');

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-xl transition-all duration-200 outline-none group relative
          ${isActive && !isOpen
            ? 'bg-blue-50 text-blue-600 font-medium'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <Icon size={isCollapsed ? 22 : 20} className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}`} />
          {!isCollapsed && <span className="truncate">{label}</span>}
        </div>
        {!isCollapsed && (
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
        
        {isCollapsed && (
          <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-sm pointer-events-none whitespace-nowrap">
            {label}
          </div>
        )}
      </button>

      {isOpen && !isCollapsed && (
        <div className="ml-9 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {items.map((item: any) => {
            const isSubActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-all duration-200
                  ${isSubActive
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}