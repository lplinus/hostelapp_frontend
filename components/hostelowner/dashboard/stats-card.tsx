interface Props {
  readonly title: string;
  readonly value: string;
  readonly icon: string;
  readonly notation?: string;
}

export default function StatsCard({ title, value, icon, notation }: Props) {
  return (
    <div className="bg-[#E5DFD4] p-6 rounded-xl shadow-xs border border-[#D2CABC] flex items-center justify-between group hover:border-[#1F1E1B]/30 transition-all duration-200">
      <div className="flex flex-col">
        <p className="text-xs font-bold text-[#686259] uppercase tracking-widest mb-1.5">{title}</p>
        <div className="flex flex-col">
          <h2 className="text-3xl font-extrabold text-[#1A1916] group-hover:text-[#1F1E1B] transition-colors tracking-tight">{value}</h2>
          {notation && (
            <p className="text-[10px] font-medium text-[#686259] mt-1 italic leading-tight">
              {notation}
            </p>
          )}
        </div>
      </div>

      <div className="text-3xl bg-[#DBD5C8] group-hover:bg-[#1F1E1B]/10 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 border border-transparent group-hover:border-[#1F1E1B]/20">
        {icon}
      </div>
    </div>
  );
}