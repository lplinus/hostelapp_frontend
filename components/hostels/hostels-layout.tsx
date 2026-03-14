import FiltersSidebar from "./filters-sidebar";
import HostelGrid from "./hostel-grid";
import { HostelListItem } from "@/types/hostel.types";
import { ChevronDown } from "lucide-react";

interface HostelsLayoutProps {
  readonly hostels: readonly HostelListItem[];
}

export default function HostelsLayout({ hostels }: HostelsLayoutProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 pt-14 lg:pt-10 pb-20">
      <div className="grid grid-cols-12 gap-8 lg:gap-10">
        
        {/* LISTINGS SECTION (70%) */}
        <div className="col-span-12 lg:col-span-8 order-2 lg:order-1">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between mb-2">
               <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Available Hostels</h1>
                  <p className="text-slate-500 text-sm mt-1">{hostels.length} accommodations in this area</p>
               </div>
               <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                  <span>Sort by: Recommended</span>
                  <ChevronDown className="w-4 h-4" />
               </div>
            </div>
            <HostelGrid hostels={hostels} />
          </div>
        </div>

        {/* FILTER SIDEBAR (30%) */}
        <div className="col-span-12 lg:col-span-4 order-1 lg:order-2">
          <div className="sticky top-[100px]">
            <FiltersSidebar />
          </div>
        </div>

      </div>
    </div>
  );
}