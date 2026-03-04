import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AboutTeamMember } from "@/types/public.types";

interface AboutTeamProps {
  members?: AboutTeamMember[];
}

const defaultMembers = [
  { name: "Team Member", role: "Co-Founder", initial: "A" },
  { name: "Team Member", role: "Co-Founder", initial: "B" },
  { name: "Team Member", role: "Co-Founder", initial: "C" },
];

export default function AboutTeam({ members }: AboutTeamProps) {
  // If API data is available, use it — otherwise fall back to hardcoded defaults
  if (members && members.length > 0) {
    return (
      <section className="bg-gray-50 py-24 px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">
          Meet Our Team
        </h2>

        <div className="flex flex-wrap justify-center gap-12">
          {members.map((member) => (
            <div key={member.name} className="space-y-4">
              <Avatar className="w-20 h-20 mx-auto">
                {member.photo && (
                  <AvatarImage
                    src={member.photo}
                    alt={member.name}
                  />
                )}
                <AvatarFallback>
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">
                  {member.name}
                </h4>
                <p className="text-gray-500 text-sm">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Fallback — original hardcoded UI
  return (
    <section className="bg-gray-50 py-24 px-6 text-center">
      <h2 className="text-3xl font-bold mb-12">
        Meet Our Team
      </h2>

      <div className="flex flex-wrap justify-center gap-12">
        {defaultMembers.map((member) => (
          <div key={member.initial} className="space-y-4">
            <Avatar className="w-20 h-20 mx-auto">
              <AvatarFallback>{member.initial}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">
                {member.name}
              </h4>
              <p className="text-gray-500 text-sm">
                {member.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}