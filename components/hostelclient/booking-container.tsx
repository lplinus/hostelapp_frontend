"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { createBooking, BookingRequest } from "@/services/booking.service";
import type { HostelDetail } from "@/types/hostel.types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, differenceInDays, parseISO } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight, CreditCard, User, Mail, Users, Baby, Activity, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Props {
    hostel: HostelDetail;
}

type Step = "details" | "payment" | "confirmation";

export default function BookingContainer({ hostel }: Props) {
    const router = useRouter();
    const [step, setStep] = useState<Step>("details");
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
        hostel.room_types?.[0]?.id.toString() || null
    );

    const [form, setForm] = useState({
        guest_name: "",
        guest_email: "",
        guest_age: "20",
        adults: "1",
        children: "0",
        check_in: new Date(),
        check_out: addDays(new Date(), 1),
    });

    const selectedRoom = useMemo(() =>
        hostel.room_types?.find(r => r.id.toString() === selectedRoomId),
        [hostel.room_types, selectedRoomId]);

    const nights = useMemo(() =>
        differenceInDays(form.check_out, form.check_in),
        [form.check_in, form.check_out]);

    const totalPrice = useMemo(() => {
        if (!selectedRoom || nights <= 0) return 0;
        const pricePerDay = Number(selectedRoom.price_per_day || selectedRoom.base_price || 0);
        return pricePerDay * nights;
    }, [selectedRoom, nights]);

    const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

    const bookingMutation = useMutation({
        mutationFn: (data: BookingRequest) => createBooking(data),
        onSuccess: (data) => {
            setConfirmedBookingId(data.id);
            setStep("confirmation");
            toast.success("Booking submitted successfully!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create booking. Please try again.");
        }
    });

    const handleNext = () => {
        if (step === "details") {
            if (!form.guest_name || !form.guest_email || !selectedRoomId) {
                toast.error("Please fill in all required fields.");
                return;
            }
            setStep("payment");
        }
    };

    const handleConfirmBooking = () => {
        if (!selectedRoom) return;

        const bookingData: BookingRequest = {
            hostel: hostel.id,
            room_type: selectedRoom.id,
            guest_name: form.guest_name,
            guest_email: form.guest_email,
            guest_age: parseInt(form.guest_age),
            adults: parseInt(form.adults),
            children: parseInt(form.children),
            check_in: format(form.check_in, "yyyy-MM-dd"),
            check_out: format(form.check_out, "yyyy-MM-dd"),
            guests_count: parseInt(form.adults) + parseInt(form.children),
            total_price: totalPrice,
        };

        bookingMutation.mutate(bookingData);
    };

    if (step === "confirmation") {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-8 animate-in fade-in duration-700">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-lg shadow-green-100/50">
                        <CheckCircle2 size={40} />
                    </div>
                </div>
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Confirmed!</h1>
                    <p className="text-muted-foreground text-lg">
                        Thank you for your booking. Your request has been sent to <strong>{hostel.name}</strong>.
                        We will notify you once the owner confirms.
                    </p>
                </div>
                <div className="bg-white border rounded-2xl p-6 text-left shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <Info size={18} className="text-blue-600" />
                        Booking Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-muted-foreground">Booking ID</div>
                        <div className="font-medium text-right font-mono">STN-{confirmedBookingId ? confirmedBookingId.substring(0, 6).toUpperCase() : ""}</div>
                        <div className="text-muted-foreground">Guest</div>
                        <div className="font-medium text-right">{form.guest_name}</div>
                        <div className="text-muted-foreground">Dates</div>
                        <div className="font-medium text-right">{format(form.check_in, "PP")} - {format(form.check_out, "PP")}</div>
                        <div className="text-muted-foreground">Total Paid</div>
                        <div className="font-bold text-right text-green-600 text-lg">₹{totalPrice.toLocaleString()}</div>
                    </div>
                </div>
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => router.push("/")}>Browse More</Button>
                    <Button onClick={() => router.push("/dashboard")}>View in Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                {/* Left Column: Form */}
                <div className="space-y-8">
                    {/* Stepper */}
                    <div className="flex items-center gap-4 text-sm font-medium mb-4">
                        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                            step === "details" ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-blue-50 text-blue-600")}>
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span>
                            Guest Details
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                            step === "payment" ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-gray-100 text-gray-400")}>
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span>
                            Payment
                        </div>
                    </div>

                    {step === "details" && (
                        <Card className="border-muted shadow-sm overflow-hidden rounded-2xl">
                            <CardHeader className="bg-gray-50/50 border-b">
                                <CardTitle className="text-xl">Enter Guest Details</CardTitle>
                                <CardDescription>We'll use this information to process your booking at {hostel.name}.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="flex items-center gap-2 text-gray-700">
                                            <User size={14} className="text-blue-600" /> Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            value={form.guest_name}
                                            onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                                            className="rounded-xl border-gray-200 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                                            <Mail size={14} className="text-blue-600" /> Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={form.guest_email}
                                            onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                                            className="rounded-xl border-gray-200 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="age" className="flex items-center gap-2 text-gray-700">
                                            <Activity size={14} className="text-blue-600" /> Age
                                        </Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            value={form.guest_age}
                                            onChange={(e) => setForm({ ...form, guest_age: e.target.value })}
                                            className="rounded-xl border-gray-200 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="adults" className="flex items-center gap-2 text-gray-700">
                                            <Users size={14} className="text-blue-600" /> Adults
                                        </Label>
                                        <Select value={form.adults} onValueChange={(v) => setForm({ ...form, adults: v })}>
                                            <SelectTrigger className="rounded-xl border-gray-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4].map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="children" className="flex items-center gap-2 text-gray-700">
                                            <Baby size={14} className="text-blue-600" /> Children
                                        </Label>
                                        <Select value={form.children} onValueChange={(v) => setForm({ ...form, children: v })}>
                                            <SelectTrigger className="rounded-xl border-gray-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[0, 1, 2, 3].map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-gray-700">
                                        <CalendarIcon size={14} className="text-blue-600" /> Staying Dates
                                    </Label>
                                    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-2xl bg-gray-50/30">
                                        <div className="flex-1 space-y-1.5">
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Check-In</p>
                                            <Input
                                                type="date"
                                                value={format(form.check_in, "yyyy-MM-dd")}
                                                onChange={(e) => setForm({ ...form, check_in: parseISO(e.target.value) })}
                                                min={format(new Date(), "yyyy-MM-dd")}
                                                className="border-none bg-transparent font-bold text-lg p-0 h-auto focus-visible:ring-0"
                                            />
                                        </div>
                                        <div className="hidden sm:flex items-center px-4">
                                            <ChevronRight className="text-gray-300" />
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Check-Out</p>
                                            <Input
                                                type="date"
                                                value={format(form.check_out, "yyyy-MM-dd")}
                                                onChange={(e) => setForm({ ...form, check_out: parseISO(e.target.value) })}
                                                min={format(addDays(form.check_in, 1), "yyyy-MM-dd")}
                                                className="border-none bg-transparent font-bold text-lg p-0 h-auto focus-visible:ring-0"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Selected: <strong>{nights} {nights === 1 ? 'night' : 'nights'}</strong> stay.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === "payment" && (
                        <Card className="border-muted shadow-sm overflow-hidden rounded-2xl">
                            <CardHeader className="bg-gray-50/50 border-b">
                                <CardTitle className="text-xl">Payment Details</CardTitle>
                                <CardDescription>Complete your payment securely to confirm the booking.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl flex gap-3 text-sm">
                                    <CreditCard className="shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <p className="font-bold">Mock Payment Mode Enabled</p>
                                        <p className="opacity-80">This is a demonstration. Clicking "Complete Booking" will process the booking without an actual charge.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="card">Card Details</Label>
                                        <Input id="card" placeholder="0000 0000 0000 0000" disabled className="rounded-xl bg-gray-50 border-gray-200" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="exp">Expiry Date</Label>
                                            <Input id="exp" placeholder="MM/YY" disabled className="rounded-xl bg-gray-50 border-gray-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input id="cvv" placeholder="***" disabled className="rounded-xl bg-gray-50 border-gray-200" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50/50 border-t flex justify-between p-6">
                                <Button variant="ghost" onClick={() => setStep("details")}>Back to Details</Button>
                                <Button
                                    className="px-10 rounded-xl bg-green-600 hover:bg-green-700 shadow-md shadow-green-100"
                                    onClick={handleConfirmBooking}
                                    disabled={bookingMutation.isPending}
                                >
                                    {bookingMutation.isPending ? "Processing..." : `Pay ₹${totalPrice.toLocaleString()}`}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>

                {/* Right Column: Summary Sticky Card */}
                <div className="lg:sticky lg:top-6 self-start space-y-6">
                    <Card className="border-muted shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-gray-50/50 border-b">
                            <CardTitle className="text-lg">Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Hostel Mini Info */}
                            <div className="p-4 flex gap-4 border-b">
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 relative shrink-0">
                                    {hostel.images?.[0]?.image ? (
                                        <img src={hostel.images[0].image} alt={hostel.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">STAY</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900 leading-tight">{hostel.name}</h4>
                                    <p className="text-xs text-muted-foreground">{hostel.city.name}, {hostel.area?.name}</p>
                                    <Badge variant="secondary" className="text-[10px] uppercase font-black">{hostel.hostel_type}</Badge>
                                </div>
                            </div>

                            {/* Selection Info */}
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Room Type</Label>
                                    <Select value={selectedRoomId || ""} onValueChange={setSelectedRoomId}>
                                        <SelectTrigger className="rounded-xl border-gray-100 shadow-sm bg-gray-50/30">
                                            <SelectValue placeholder="Select a room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hostel.room_types?.map(room => (
                                                <SelectItem key={room.id} value={room.id.toString()}>
                                                    {room.category_display} - {room.sharing_display}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator className="bg-gray-100" />

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{selectedRoom?.category_display} × {nights} nights</span>
                                        <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Service Charge</span>
                                        <span className="text-green-600 font-bold">FREE</span>
                                    </div>
                                    <Separator className="bg-blue-50" />
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="font-bold text-gray-900">Total Price</span>
                                        <span className="font-black text-blue-600">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        {step === "details" && (
                            <CardFooter className="p-6 bg-gray-50/50">
                                <Button className="w-full py-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100" onClick={handleNext}>
                                    Confirm Details <ChevronRight size={18} className="ml-1" />
                                </Button>
                            </CardFooter>
                        )}
                    </Card>

                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
                        <Activity className="shrink-0 text-orange-600" size={18} />
                        <p className="text-xs text-orange-800 leading-relaxed font-medium">
                            Free cancellation available 24 hours before check-in. Book with confidence.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
