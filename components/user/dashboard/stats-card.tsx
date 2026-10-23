interface Props {
  readonly title: string;
  readonly value: string;
  readonly icon: string;
  readonly notation?: string;
}

export default function StatsCard({ title, value, icon, notation }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-border flex items-center justify-between group hover:border-primary/30 transition-all duration-200">
      <div className="flex flex-col">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{title}</p>
        <div className="flex flex-col">
          <h2 className="text-3xl font-extrabold text-foreground group-hover:text-primary transition-colors tracking-tight">{value}</h2>
          {notation && (
            <p className="text-[10px] font-medium text-muted-foreground mt-1 italic leading-tight">
              {notation}
            </p>
          )}
        </div>
      </div>

      <div className="text-3xl bg-muted/40 group-hover:bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 border border-transparent group-hover:border-primary/20">
        {icon}
      </div>
    </div>
  );
}