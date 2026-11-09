"use client";

import {
    Palmtree,
    BedDouble,
    Calendar,
    Home,
    Compass,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VacationRentalManagement from "@/components/hostelowner/vacationrental/vacation-rental-management";
import { useVacationDashboard } from "./dashboard-hooks";
import { DashboardTopTabs } from "./dashboard-top-tabs";
import { DashboardKpiCards } from "./dashboard-kpi-cards";
import { DashboardBookingTable } from "./dashboard-booking-table";
import { DashboardBookingDetailDialog } from "./dashboard-booking-detail-dialog";
import { DashboardCancelModal } from "./dashboard-cancel-modal";
import { DashboardDeclineModal } from "./dashboard-decline-modal";

export default function VacationRentalDashboard() {
    const d = useVacationDashboard();

    return (
        <div className="space-y-6">
            <DashboardTopTabs
                localTab={d.localTab}
                handleTabChange={d.handleTabChange}
                myRentalsCount={d.myRentals.length}
                hostedBookingsCount={d.hostedBookings.length}
            />

            {d.isSwitchingTab ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3.5 bg-card/60 backdrop-blur-xs rounded-xl border border-border/60 shadow-2xs animate-in fade-in duration-200">
                    <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-3 border-indigo-100 dark:border-indigo-950 border-t-[#312E81] dark:border-t-indigo-400 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            {d.localTab === "properties" && <Palmtree size={16} className="text-[#312E81] dark:text-indigo-400 animate-pulse" />}
                            {d.localTab === "rooms" && <BedDouble size={16} className="text-[#312E81] dark:text-indigo-400 animate-pulse" />}
                            {d.localTab === "bookings" && <Calendar size={16} className="text-[#312E81] dark:text-indigo-400 animate-pulse" />}
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-foreground">
                            {d.localTab === "properties" && "Loading Vacation Properties..."}
                            {d.localTab === "rooms" && "Loading Rooms & Units Inventory..."}
                            {d.localTab === "bookings" && "Loading Vacation Stays..."}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Updating live rental inventory</p>
                    </div>
                </div>
            ) : d.localTab === "properties" || d.localTab === "rooms" ? (
                <VacationRentalManagement
                    activeTab={d.localTab}
                    onTabChange={d.handleTabChange}
                    hideSubTabs={true}
                />
            ) : (
                <>
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                    <Palmtree size={12} className="text-rose-500" />
                                    Airbnb Style Stays
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border">
                                    Vacation Rentals
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                                Vacation Rental Bookings
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Manage private villas, holiday homes, guest trips, and host approvals.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center p-0.5 bg-muted rounded-xl border">
                                <button
                                    onClick={() => d.handlePerspectiveChange("guest")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${d.perspective === "guest"
                                        ? "bg-card text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <Compass size={13} />
                                    My Trips
                                </button>
                                <button
                                    onClick={() => d.handlePerspectiveChange("host")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${d.perspective === "host"
                                        ? "bg-card text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <Home size={13} />
                                    Host Inquiries
                                </button>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => d.refetch()}
                                disabled={d.isRefetching}
                                className="gap-2 text-xs"
                            >
                                <RefreshCw size={13} className={d.isRefetching ? "animate-spin" : ""} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    <DashboardKpiCards
                        perspective={d.perspective}
                        totalCount={d.totalCount}
                        upcomingCount={d.upcomingCount}
                        pendingCount={d.pendingCount}
                        totalRevenueSum={d.totalRevenueSum}
                    />

                    <DashboardBookingTable
                        perspective={d.perspective}
                        isLoading={d.isLoading}
                        searchQuery={d.searchQuery}
                        setSearchQuery={d.setSearchQuery}
                        selectedStatus={d.selectedStatus}
                        setSelectedStatus={d.setSelectedStatus}
                        activeList={d.activeList}
                        filteredBookings={d.filteredBookings}
                        setSelectedBooking={d.setSelectedBooking}
                        setIsDeclineModalOpen={d.setIsDeclineModalOpen}
                        approveMutation={d.approveMutation}
                    />

                    <DashboardBookingDetailDialog
                        selectedBooking={d.selectedBooking}
                        setSelectedBooking={d.setSelectedBooking}
                        perspective={d.perspective}
                        setIsCancelModalOpen={d.setIsCancelModalOpen}
                        setIsDeclineModalOpen={d.setIsDeclineModalOpen}
                        approveMutation={d.approveMutation}
                    />

                    <DashboardCancelModal
                        isOpen={d.isCancelModalOpen}
                        onOpenChange={d.setIsCancelModalOpen}
                        selectedBooking={d.selectedBooking}
                        cancelReason={d.cancelReason}
                        setCancelReason={d.setCancelReason}
                        cancelMutation={d.cancelMutation}
                    />

                    <DashboardDeclineModal
                        isOpen={d.isDeclineModalOpen}
                        onOpenChange={d.setIsDeclineModalOpen}
                        selectedBooking={d.selectedBooking}
                        declineReason={d.declineReason}
                        setDeclineReason={d.setDeclineReason}
                        declineMutation={d.declineMutation}
                    />
                </>
            )}
        </div>
    );
}
