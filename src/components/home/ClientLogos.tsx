import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ClientLogo {
  id: string;
  logo_image: string;
  company_name: string;
  company_name_en: string | null;
  display_order: number;
}

const ClientLogos = () => {
  const { t } = useLanguage();

  const { data: logos = [] } = useQuery({
    queryKey: ["client-logos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_logos")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as ClientLogo[];
    },
  });

  // Organize logos into rows: Row 1: 5, Row 2: 4, Row 3: 5, Row 4: 3
  const logoRows = [];
  let currentIndex = 0;
  const rowSizes = [5, 4, 5, 3];
  
  rowSizes.forEach((size) => {
    const row = logos.slice(currentIndex, currentIndex + size);
    if (row.length > 0) {
      logoRows.push(row);
    }
    currentIndex += size;
  });

  return (
    <section className="py-32 md:py-40 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        {/* Title area */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {t("clients.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base">
            {t("clients.subtitle")}
          </p>
        </div>

        {/* Logo grid */}
        <div className="space-y-12 md:space-y-16">
          {logoRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16"
            >
              {row.map((logo, logoIndex) => {
                const globalIndex = logoRows
                  .slice(0, rowIndex)
                  .reduce((sum, r) => sum + r.length, 0) + logoIndex;

                return (
                  <motion.div
                    key={logo.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                      duration: 0.6,
                      delay: globalIndex * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{
                      scale: 1.12,
                      y: -8,
                      transition: { 
                        duration: 0.3,
                        ease: [0.34, 1.56, 0.64, 1]
                      },
                    }}
                    animate={{
                      y: [0, -6, 0],
                      rotate: [0, 1, -1, 0],
                      transition: {
                        duration: 3 + (globalIndex % 5) * 0.4,
                        repeat: Infinity,
                        ease: [0.45, 0.05, 0.55, 0.95],
                        delay: globalIndex * 0.2,
                      },
                    }}
                    className="flex items-center justify-center w-20 md:w-24 lg:w-28 relative group"
                  >
                    <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
                    <img
                      src={logo.logo_image}
                      alt={logo.company_name}
                      className="max-h-12 md:max-h-14 lg:max-h-16 w-auto object-contain opacity-55 group-hover:opacity-100 transition-all duration-300 mix-blend-multiply dark:mix-blend-normal relative z-10 filter group-hover:brightness-110"
                    />
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
