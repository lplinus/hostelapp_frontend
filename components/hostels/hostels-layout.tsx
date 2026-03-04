import FiltersSidebar from "./filters-sidebar";
import HostelGrid from "./hostel-grid";
import { HostelListItem } from "@/types/hostel.types";

interface HostelsLayoutProps {
  readonly hostels: readonly HostelListItem[];
}

export default function HostelsLayout({ hostels }: HostelsLayoutProps) {
  return (
    <div className="container mx-auto px-6 pt-14 sm:pt-16 lg:pt-20 pb-10">
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 sticky top-20 z-40 lg:relative lg:top-auto lg:z-auto">
          <FiltersSidebar />
        </div>

        <div className="lg:col-span-3">
          <HostelGrid hostels={hostels} />
        </div>
      </div>
    </div>
  );
}