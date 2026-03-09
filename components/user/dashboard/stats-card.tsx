interface Props {
  readonly title: string;
  readonly value: string;
  readonly icon: string;
  readonly notation?: string;
}

export default function StatsCard({ title, value, icon, notation }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all duration-300">

      <div className="flex flex-col">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{title}</p>
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{value}</h2>
          {notation && (
            <p className="text-[10px] font-medium text-gray-500 mt-1 italic leading-tight">
              {notation}
            </p>
          )}
        </div>
      </div>

      <div className="text-4xl bg-gray-50 group-hover:bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:rotate-6 group-hover:scale-110">
        {icon}
      </div>

    </div>
  );
}