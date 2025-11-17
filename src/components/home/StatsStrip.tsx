import { useLanguage } from "@/contexts/LanguageContext";

const stats = [
  { value: "10+", key: "stats.experience" },
  { value: "300+", key: "stats.projects" },
  { value: "400", key: "stats.facility" },
  { value: "ISO", key: "stats.standards" },
];

const StatsStrip = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-20 bg-secondary">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center animate-fade-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                {stat.value}
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                {t(stat.key)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;
