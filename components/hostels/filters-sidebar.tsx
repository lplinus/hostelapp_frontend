// "use client";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Slider } from "@/components/ui/slider";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { Label } from "@/components/ui/label";

// export default function FiltersSidebar() {
//   return (
//     <Card className="sticky top-24 rounded-2xl">
//       <CardHeader>
//         <CardTitle className="flex justify-between items-center">
//           Filters
//           <button className="text-sm text-blue-600">
//             Reset
//           </button>
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-6">
//         {/* Budget */}
//         <div>
//           <Label className="font-medium">
//             Budget: up to ₹15,000
//           </Label>
//           <Slider defaultValue={[15000]} max={20000} step={500} />
//         </div>

//         <Separator />

//         {/* Gender */}
//         <div>
//           <Label className="font-medium mb-3 block">
//             Gender
//           </Label>
//           <RadioGroup defaultValue="boys">
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem value="boys" id="boys" />
//               <Label htmlFor="boys">Boys</Label>
//             </div>
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem value="girls" id="girls" />
//               <Label htmlFor="girls">Girls</Label>
//             </div>
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem value="coed" id="coed" />
//               <Label htmlFor="coed">Co-Ed</Label>
//             </div>
//           </RadioGroup>
//         </div>

//         <Separator />

//         {/* Room Type */}
//         <div>
//           <Label className="font-medium mb-3 block">
//             Room Type
//           </Label>
//           <div className="space-y-2">
//             <div className="flex items-center space-x-2">
//               <Checkbox id="ac" />
//               <Label htmlFor="ac">AC</Label>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Checkbox id="nonac" />
//               <Label htmlFor="nonac">Non-AC</Label>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Checkbox id="both" />
//               <Label htmlFor="both">Both</Label>
//             </div>
//           </div>
//         </div>

//         <Separator />

//         {/* Food */}
//         <div>
//           <Label className="font-medium mb-3 block">
//             Food Included
//           </Label>
//           <div className="flex items-center space-x-2">
//             <Checkbox id="food" />
//             <Label htmlFor="food">Yes</Label>
//           </div>
//         </div>

//         <Separator />

//         {/* Distance */}
//         <div>
//           <Label className="font-medium">
//             Max Distance: 15 km
//           </Label>
//           <Slider defaultValue={[15]} max={30} step={1} />
//         </div>
//       </CardContent>
//     </Card>
//   );
// }



"use client";

import React, { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function FiltersContainer() {
  return (
    <>
      {/* Mobile Trigger - Only visible on small screens */}
      <div className="lg:hidden bg-white/95 backdrop-blur-sm -mx-6 px-6 py-4 border-b border-gray-100 shadow-[0_4px_10px_-10px_rgba(0,0,0,0.1)]">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between gap-2 rounded-xl h-12">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </span>
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">3</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-[2rem] p-0 overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FiltersContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Only visible on lg screens and up */}
      <div className="hidden lg:block w-full h-full">
        <FiltersContent />
      </div>
    </>
  );
}

function FiltersContent({ isMobile = false }: { isMobile?: boolean }) {
  const containerClasses = isMobile
    ? "w-full h-full flex flex-col"
    : "sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl border-slate-200 shadow-sm border";

  return (
    <Card className={containerClasses}>
      {/* Sticky Header */}
      <CardHeader
        className={`${isMobile
          ? "sticky top-0 z-10 bg-white border-b"
          : ""
          } pb-4`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
            <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
          </div>

          <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            Reset
          </button>
        </div>
      </CardHeader>

      {/* Scrollable Content */}
      <CardContent
        className={`space-y-8 ${isMobile ? "overflow-y-auto flex-1 px-6 pb-28" : ""
          }`}
      >
        {/* Budget */}
        <div className="space-y-4">
          <Label className="text-[17px] font-medium text-slate-900">
            Budget: up to ₹15,000
          </Label>
          <Slider defaultValue={[15000]} max={20000} step={500} />
        </div>

        {/* Gender */}
        <div className="space-y-4">
          <Label className="text-[17px] font-medium text-slate-900">Gender</Label>
          <RadioGroup defaultValue="boys" className="space-y-3">
            {["Boys", "Girls", "Co-Ed"].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={item.toLowerCase()}
                  id={`${item}-${isMobile ? "mob" : "dt"}`}
                />
                <Label htmlFor={`${item}-${isMobile ? "mob" : "dt"}`}>
                  {item}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Hostel Type */}
        <div className="space-y-4">
          <Label className="text-[17px] font-medium text-slate-900">Hostel Type</Label>
          <RadioGroup defaultValue="all" className="space-y-3">
            {["All", "Boys Hostel", "Girls Hostel", "Co-Living", "Working Professionals", "Student Hostel", "Luxury Hostel", "Budget Hostel", "PG Accommodation"].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={item.toLowerCase().replace(/ /g, "_")}
                  id={`${item.toLowerCase().replace(/ /g, "_")}-${isMobile ? "mob" : "dt"}`}
                />
                <Label htmlFor={`${item.toLowerCase().replace(/ /g, "_")}-${isMobile ? "mob" : "dt"}`}>
                  {item}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Room Type */}
        <div className="space-y-4">
          <Label className="text-[17px] font-medium text-slate-900">Room Type</Label>
          <RadioGroup defaultValue="both" className="space-y-3">
            {["AC", "Non-AC", "Both"].map((item) => (
              <div key={item} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={item.toLowerCase()}
                  id={`${item}-${isMobile ? "mob" : "dt"}`}
                />
                <Label htmlFor={`${item}-${isMobile ? "mob" : "dt"}`}>
                  {item}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Food */}
        <div className="space-y-4">
          <Label className="text-[17px] font-medium text-slate-900">
            Food Included
          </Label>
          <RadioGroup defaultValue="yes" className="space-y-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem
                value="yes"
                id={`food-${isMobile ? "mob" : "dt"}`}
              />
              <Label htmlFor={`food-${isMobile ? "mob" : "dt"}`}>
                Yes
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Distance */}
        <div className="space-y-4">
          <Label className="text-[17px] font-medium text-slate-900">
            Max Distance: 15 km
          </Label>
          <Slider defaultValue={[15]} max={30} step={1} />
        </div>
      </CardContent>

      {/* Sticky Bottom Button (Mobile Only) */}
      {isMobile && (
        <div className="sticky bottom-0 bg-white border-t p-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl text-lg">
            Show Results
          </Button>
        </div>
      )}
    </Card>
  );
}