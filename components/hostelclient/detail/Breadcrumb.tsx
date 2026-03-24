import Link from "next/link";

interface BreadcrumbProps {
    hostelName: string;
}

export default function Breadcrumb({ hostelName }: BreadcrumbProps) {
    return (
        <nav className="max-w-[1200px] mx-auto px-5 py-3 text-sm text-gray-500">
            <ol className="flex items-center gap-1.5 flex-wrap">
                <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
                <li>/</li>
                <li><Link href="/hostels" className="hover:text-blue-600 transition-colors">Hostels</Link></li>
                <li>/</li>
                <li className="text-gray-900 font-medium truncate max-w-[200px]">{hostelName}</li>
            </ol>
        </nav>
    );
}
