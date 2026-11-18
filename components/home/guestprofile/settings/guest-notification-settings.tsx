'use client';

import { useState } from 'react';
import { Bell, Check, Mail, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export default function GuestNotificationSettings() {
    const [bookingAlerts, setBookingAlerts] = useState(true);
    const [checkInReminders, setCheckInReminders] = useState(true);
    const [travelOffers, setTravelOffers] = useState(false);

    const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, name: string) => {
        setter((prev) => {
            const next = !prev;
            toast.success(`${name} ${next ? 'enabled' : 'disabled'}`);
            return next;
        });
    };

    return (
        <Card className="border border-border/60 rounded-lg bg-card shadow-xs w-full">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-2.5 bg-primary/10 text-primary rounded-md">
                    <Bell size={20} />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-foreground">Notification Preferences</CardTitle>
                    <CardDescription className="text-xs">Manage how and when you receive stay updates and alerts.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Separator />
                
                {/* 1. Booking confirmations */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Mail size={15} className="text-primary" />
                            Booking & Check-in Alerts
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Receive instant confirmations, room details, and reservation check-in guides.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant={bookingAlerts ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggle(setBookingAlerts, 'Booking & Check-in Alerts')}
                        className={`rounded-md text-xs h-8 px-3.5 font-medium cursor-pointer transition-colors shrink-0 ${
                            bookingAlerts ? "bg-[#312E81] hover:bg-[#252269] text-white" : ""
                        }`}
                    >
                        {bookingAlerts ? (
                            <span className="flex items-center gap-1.5">
                                <Check size={13} /> Enabled
                            </span>
                        ) : (
                            'Disabled'
                        )}
                    </Button>
                </div>

                <Separator />

                {/* 2. Host arrival & stay reminders */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <MessageSquare size={15} className="text-indigo-500" />
                            Stay Reminders & Host Notices
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Get timely notifications for check-in hours, property rules, and check-out notices.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant={checkInReminders ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggle(setCheckInReminders, 'Stay Reminders & Host Notices')}
                        className={`rounded-md text-xs h-8 px-3.5 font-medium cursor-pointer transition-colors shrink-0 ${
                            checkInReminders ? "bg-[#312E81] hover:bg-[#252269] text-white" : ""
                        }`}
                    >
                        {checkInReminders ? (
                            <span className="flex items-center gap-1.5">
                                <Check size={13} /> Enabled
                            </span>
                        ) : (
                            'Disabled'
                        )}
                    </Button>
                </div>

                <Separator />

                {/* 3. Promotional & discounts */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Travel Discounts & Seasonal Offers
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Receive curated discounts and member perks for upcoming hostel and hotel trips.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant={travelOffers ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggle(setTravelOffers, 'Travel Discounts & Seasonal Offers')}
                        className={`rounded-md text-xs h-8 px-3.5 font-medium cursor-pointer transition-colors shrink-0 ${
                            travelOffers ? "bg-[#312E81] hover:bg-[#252269] text-white" : ""
                        }`}
                    >
                        {travelOffers ? (
                            <span className="flex items-center gap-1.5">
                                <Check size={13} /> Enabled
                            </span>
                        ) : (
                            'Disabled'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
