"use client";

import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import HostelForm from "./hostel-form";
import HostelMediaGallery from "./hostel-media-gallery";
import HostelTable from "./hostel-table";
import { useHostelManagement } from "./hostel-hooks";
import { useState, useEffect } from "react";

export default function HostelManagement() {
    const h = useHostelManagement();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">My Hostels</h2>
                            <p className="text-sm text-muted-foreground">Manage your hostel listings, details, and media</p>
                        </div>
                        <button
                            onClick={() => {
                                h.setIsCreating(!h.isCreating);
                                h.setEditingHostel(null);
                                h.setUploadingFor(null);
                            }}
                            className="bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 shadow-md shadow-primary/20 transition-all font-semibold cursor-pointer"
                        >
                            {h.isCreating ? "Cancel" : "Add Hostel"}
                        </button>
                    </div>

                    {/* Forms */}
                    {h.isCreating && (
                        <HostelForm
                            onSubmit={h.handleCreateSubmit}
                            onCancel={() => h.setIsCreating(false)}
                            isPending={h.createMutation.isPending}
                            cities={h.cities}
                            areas={h.areas}
                            states={h.states}
                            amenities={h.amenities}
                        />
                    )}

                    {h.editingHostel && (
                        <HostelForm
                            initialData={h.editingHostel}
                            onSubmit={h.handleEditSubmit}
                            onCancel={() => h.setEditingHostel(null)}
                            isPending={h.updateMutation.isPending}
                            cities={h.cities}
                            areas={h.areas}
                            states={h.states}
                            amenities={h.amenities}
                        />
                    )}

                    {/* Image Upload Form */}
                    {h.uploadingFor && (
                        <HostelMediaGallery
                            uploadingFor={h.uploadingFor}
                            hostels={h.hostels}
                            storageSettings={h.storageSettings}
                            imagePreviews={h.imagePreviews}
                            uploadFormRef={h.uploadFormRef}
                            handleImageChange={h.handleImageChange}
                            handleImageUpload={h.handleImageUpload}
                            imageUploadMutation={h.imageUploadMutation}
                            imageUpdateMutation={h.imageUpdateMutation}
                            imageDeleteMutation={h.imageDeleteMutation}
                            onClose={() => {
                                h.clearPreviewsAndForm();
                                h.setUploadingFor(null);
                            }}
                        />
                    )}

                    {/* Hostels Table */}
                    <HostelTable
                        hostels={h.hostels}
                        currentHostels={h.currentHostels}
                        isLoading={h.isLoading}
                        mounted={mounted}
                        currentPage={h.currentPage}
                        pageSize={h.pageSize}
                        priceView={h.priceView}
                        setPriceView={h.setPriceView}
                        onEdit={(hostel) => {
                            h.setEditingHostel(hostel);
                            h.setIsCreating(false);
                            h.setUploadingFor(null);
                            globalThis.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        onUploadImages={(hostelId) => {
                            h.setUploadingFor(hostelId);
                            h.setEditingHostel(null);
                            h.setIsCreating(false);
                            globalThis.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    />

                    {/* Pagination */}
                    {h.totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                disabled={h.currentPage === 1}
                                onClick={() => h.setCurrentPage(prev => prev - 1)}
                                className="px-4 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                            >
                                Previous
                            </button>
                            {Array.from({ length: h.totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={`page-${pageNum}`}
                                        onClick={() => h.setCurrentPage(pageNum)}
                                        className={`px-4 py-2 border rounded-lg text-sm transition-colors cursor-pointer ${h.currentPage === pageNum ? "bg-primary text-primary-foreground font-semibold border-primary" : "bg-white text-foreground hover:bg-muted/50 border-border"}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                disabled={h.currentPage === h.totalPages}
                                onClick={() => h.setCurrentPage(prev => prev + 1)}
                                className="px-4 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
