interface Props {
  readonly title: string;
  readonly value: string;
  readonly icon: string;
  readonly notation?: string;
}

export default function StatsCard({ title, value, icon, notation }: Props) {
  return (
    <div className="bg-[#E5DFD4] p-3 sm:p-4 md:p-4 rounded-md shadow-xs border border-[#D2CABC] flex items-center justify-between group hover:border-[#1F1E1B]/30 transition-all duration-200">
      <div className="flex flex-col min-w-0 pr-1">
        <p className="text-[11px] sm:text-xs font-bold text-[#686259] uppercase tracking-wider mb-0.5 truncate">{title}</p>
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl md:text-[22px] font-extrabold text-[#1A1916] group-hover:text-[#1F1E1B] transition-colors tracking-tight truncate">{value}</h2>
          {notation && (
            <p className="text-[10px] sm:text-[11px] font-medium text-[#686259] mt-0.5 italic leading-tight truncate">
              {notation}
            </p>
          )}
        </div>
      </div>

      <div className="text-xl sm:text-2xl bg-[#DBD5C8] group-hover:bg-[#1F1E1B]/10 w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center transition-all duration-200 border border-transparent group-hover:border-[#1F1E1B]/20 shrink-0">
        {icon}
      </div>
    </div>
  );
}