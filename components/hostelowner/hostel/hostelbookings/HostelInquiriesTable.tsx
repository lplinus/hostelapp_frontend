"use client";

import { Clock, Mail, Phone } from "lucide-react";
import { formatDate } from "./hostel-booking-utils";

interface HostelInquiriesTableProps {
    inquiries?: any;
    isLoading: boolean;
    mounted: boolean;
    onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>, id: string) => void;
    isUpdatingStatus: boolean;
}

export default function HostelInquiriesTable({
    inquiries,
    isLoading,
    mounted,
    onStatusChange,
    isUpdatingStatus,
}: HostelInquiriesTableProps) {
    const list = Array.isArray(inquiries)
        ? inquiries
        : (inquiries as any)?.results || [];

    return (
        <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/40 border-b border-border/50">
                        <tr>
                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                Date
                            </th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                Guest Details
                            </th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                Hostel
                            </th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                Message
                            </th>
                            <th className="px-5 py-3.5 text-xs font-semibold text-foreground tracking-wider uppercase">
                                Status
                            </th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold text-foreground tracking-wider uppercase pr-5">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                        {(!mounted || isLoading) && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-12 text-center text-xs text-muted-foreground"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Clock size={16} className="animate-spin text-primary" />
                                        <span>Loading inquiries...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {mounted && !isLoading && list.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-12 text-center text-xs text-muted-foreground"
                                >
                                    <div className="max-w-sm mx-auto space-y-2">
                                        <Mail size={28} className="mx-auto text-muted-foreground/60" />
                                        <p className="font-semibold text-foreground">No inquiries found</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Guest inquiry requests from prospective hostel residents will appear here.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {mounted && !isLoading &&
                            list.map((iq: any) => (
                                <tr key={iq.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-5 py-3.5 text-xs text-muted-foreground align-middle whitespace-nowrap">
                                        {iq.created_at ? formatDate(iq.created_at) : "N/A"}
                                    </td>
                                    <td className="px-5 py-3.5 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-xs text-foreground capitalize">
                                                {iq.guest_name}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {iq.guest_email}
                                            </span>
                                            <a
                                                href={`tel:${iq.mobile_number}`}
                                                className="text-cyan-700 dark:text-cyan-400 font-medium text-[11px] flex items-center gap-1 mt-0.5 hover:underline"
                                            >
                                                <Phone size={10} />
                                                {iq.mobile_number}
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-foreground align-middle font-medium">
                                        {iq.hostel_name || `Hostel #${iq.hostel}`}
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-xs truncate align-middle">
                                        {iq.message || <span className="italic opacity-60">No message provided</span>}
                                    </td>
                                    <td className="px-5 py-3.5 align-middle">
                                        <select
                                            value={iq.status || "pending"}
                                            onChange={(e) => onStatusChange(e, iq.id)}
                                            disabled={
                                                isUpdatingStatus ||
                                                iq.status === "enquired"
                                            }
                                            className={`border rounded-lg px-2.5 py-1 text-xs bg-card disabled:opacity-60 disabled:cursor-not-allowed font-semibold uppercase tracking-wider ${iq.status === "enquired"
                                                ? "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/40"
                                                : "text-muted-foreground border-border/60"
                                                }`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="enquired">Enquired</option>
                                            <option value="responded">Responded</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                    <td className="px-5 py-3.5 text-right pr-5 align-middle">
                                        <a
                                            href={`tel:${iq.mobile_number}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                        >
                                            <Phone size={13} /> Call Guest
                                        </a>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

