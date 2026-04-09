"use client";

import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function FiltersContainer() {
  return (
    <>
      <div className="lg:hidden bg-white/95 backdrop-blur-md -mx-4 px-4 py-4 border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between items-center rounded-xl h-12 border-slate-200">
              <span className="flex items-center gap-2 font-bold text-slate-800">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                Filter & Sort
              </span>
              <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-lg text-xs font-bold tracking-tight">Refine Results</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-[2.5rem] p-0 overflow-y-auto">
            <SheetHeader className="px-6 pt-8 pb-4 border-b border-slate-50">
              <SheetTitle className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                 <SlidersHorizontal className="w-6 h-6 text-teal-600" />
                 Filters
              </SheetTitle>
            </SheetHeader>
            <div className="px-6 py-6 pb-28">
               <FiltersContent isMobile />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:block w-full">
        <FiltersContent />
      </div>
    </>
  );
}

interface FiltersContentProps {
  readonly isMobile?: boolean;
}

function FiltersContent({ isMobile = false }: FiltersContentProps) {
  const [city, setCity] = useState("All Cities");
  const [area, setArea] = useState("All Areas");
  const [hostelType, setHostelType] = useState("All Types");
  const [roomType, setRoomType] = useState("All Room Types");
  const [sharing, setSharing] = useState("All Sharing");
  const [price, setPrice] = useState("All Prices");
  const [sortBy, setSortBy] = useState("Recommended");

  const handleReset = () => {
    setCity("All Cities");
    setArea("All Areas");
    setHostelType("All Types");
    setRoomType("All Room Types");
    setSharing("All Sharing");
    setPrice("All Prices");
    setSortBy("Recommended");
  };

  const containerClasses = cn(
    "w-full bg-white transition-all duration-300",
    !isMobile && "sticky top-[100px] rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
  );

  const FilterField = ({ label, value, onValueChange, options }: any) => (
    <div className="space-y-1.5">
       <Label className="text-[13px] font-bold text-slate-700 ml-0.5">{label}</Label>
       <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
             <SelectValue />
          </SelectTrigger>
          <SelectContent>
             {options.map((opt: any) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
             ))}
          </SelectContent>
       </Select>
    </div>
  );

  return (
    <Card className={containerClasses}>
      {!isMobile && (
        <CardHeader className="bg-slate-50/50 px-6 py-5 border-b border-slate-100">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-teal-600" strokeWidth={2.5} />
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Filters</h2>
             </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn("px-6 py-6 pb-10", !isMobile && "space-y-5")}>
        
        <FilterField 
           label="City" 
           value={city} 
           onValueChange={setCity} 
           options={[{value: "All Cities", label: "All Cities"}]} 
        />
        
        <FilterField 
           label="Area" 
           value={area} 
           onValueChange={setArea} 
           options={[{value: "All Areas", label: "All Areas"}]} 
        />

        <FilterField 
           label="Hostel Type" 
           value={hostelType} 
           onValueChange={setHostelType} 
           options={[
              {value: "All Types", label: "All Types"},
              {value: "boys", label: "Boys Hostel"},
              {value: "girls", label: "Girls Hostel"},
              {value: "coed", label: "Coed Hostel"}
           ]} 
        />

        <FilterField 
           label="Room Type" 
           value={roomType} 
           onValueChange={setRoomType} 
           options={[
              {value: "All Room Types", label: "All Room Types"},
              {value: "AC", label: "AC"},
              {value: "Non-AC", label: "Non-AC"}
           ]} 
        />

        <FilterField 
           label="Sharing" 
           value={sharing} 
           onValueChange={setSharing} 
           options={[
              {value: "All Sharing", label: "All Sharing"},
              {value: "0", label: "Private Room"},
              {value: "1", label: "Single Sharing"},
              {value: "2", label: "Double Sharing"},
              {value: "3", label: "Triple Sharing"}
           ]} 
        />

        <FilterField 
           label="Price" 
           value={price} 
           onValueChange={setPrice} 
           options={[
              {value: "All Prices", label: "All Prices"},
              {value: "Under ₹5000", label: "Under ₹5000"},
              {value: "Above ₹5000", label: "Above ₹5000"}
           ]} 
        />

        <FilterField 
           label="Sort By" 
           value={sortBy} 
           onValueChange={setSortBy} 
           options={[
              {value: "Recommended", label: "Recommended"},
              {value: "Price: Low to High", label: "Price: Low to High"},
              {value: "Price: High to Low", label: "Price: High to Low"}
           ]} 
        />

        <div className="flex gap-2 pt-4">
           {!isMobile ? (
              <>
                 <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={handleReset}>Reset</Button>
                 <Button className="flex-[2] h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/10">Apply Filter</Button>
              </>
           ) : (
              <SheetClose asChild>
                 <Button className="w-full h-14 bg-teal-600 text-white font-bold rounded-2xl" onClick={handleReset}>Apply Filters</Button>
              </SheetClose>
           )}
        </div>

      </CardContent>
    </Card>
  );
}