import HostelsLayout from "@/components/hostels/hostels-layout";
import { getHostels } from "@/services/hostel.service";
export const dynamic = "force-dynamic";

export default async function HostelsPage() {
  const hostels = await getHostels();

  return <HostelsLayout hostels={hostels} />;
}