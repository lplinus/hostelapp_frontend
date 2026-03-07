interface Props {
  title: string;
  value: string;
  icon: string;
}

export default function StatsCard({ title, value, icon }: Props) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>

      <div className="text-3xl">
        {icon}
      </div>

    </div>
  );
}