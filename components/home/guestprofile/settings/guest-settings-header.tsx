'use client';

import Link from "next/link";
import { Sliders, ArrowLeft, Menu } from "lucide-react";

export default function GuestSettingsHeader() {
    return (
        <div className="bg-card border border-border/60 rounded-lg p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
                        className="md:hidden p-1.5 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
                        aria-label="Toggle Navigation"
                    >
                        <Menu size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link
                                href="/home/guestprofile"
                                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <ArrowLeft size={13} />
                                <span>Guest Portal</span>
                            </Link>
                            <span className="text-muted-foreground/40 text-xs">/</span>
                            <span className="text-xs font-semibold text-foreground">Settings</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <Sliders className="text-primary" size={22} />
                            Guest Settings
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Customize your guest portal display theme, notification alerts, and account security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
