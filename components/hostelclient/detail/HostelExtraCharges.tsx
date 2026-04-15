import { ExtraCharge } from "@/types/hostel.types";

interface Props {
    extraCharges?: readonly ExtraCharge[];
}

export default function HostelExtraCharges({ extraCharges }: Props) {
    if (!extraCharges || extraCharges.length === 0) return null;

    return (
        <section id="extra-charges" className="pt-10 mb-2 border-t border-gray-100">
            <h2 className="text-[26px] font-bold text-[#1E1B4B] mb-6 flex items-center gap-2">
                <span className="bg-orange-100 p-2 rounded-xl text-orange-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </span>
                Extra Charges
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extraCharges.map((charge, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                            <div>
                                <h4 className="font-semibold text-gray-800 capitalize">
                                    {charge.charge_type.replace('_', ' ')}
                                </h4>
                                {charge.description && (
                                    <p className="text-sm text-gray-500 mt-1">{charge.description}</p>
                                )}
                            </div>
                            <div className="font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg whitespace-nowrap">
                                ₹{charge.amount}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
