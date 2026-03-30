import { Loader2 } from 'lucide-react';

export default function VendorDashboardLoading() {
    return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium">Loading...</p>
            </div>
        </div>
    );
}
