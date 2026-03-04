interface AboutMissionProps {
  missionTitle?: string;
  missionDescription?: string;
  cardTitle?: string;
  cardDescription?: string;
}

export default function AboutMission({
  missionTitle,
  missionDescription,
  cardTitle,
  cardDescription,
}: AboutMissionProps) {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">
            {missionTitle || "Our Mission"}
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {missionDescription ||
              "We aim to simplify student accommodation by providing a transparent, secure, and easy-to-use platform that connects students with trusted hostels."}
          </p>
        </div>

        <div className="bg-gray-100 rounded-3xl p-10 shadow-sm">
          <h3 className="text-2xl font-semibold mb-4">
            {cardTitle || "Why We Exist"}
          </h3>
          <p className="text-gray-600">
            {cardDescription ||
              "Finding safe housing shouldn't be stressful. We solve this problem with verified listings, real reviews, and transparent pricing."}
          </p>
        </div>
      </div>
    </section>
  );
}