"use client";

interface Props {
  latitude: number;
  longitude: number;
}

export default function HostelMap({ latitude, longitude }: Props) {
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <div className="w-full h-[350px] rounded-xl overflow-hidden border border-slate-200">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        loading="lazy"
        className="border-0"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}