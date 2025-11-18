import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import logo1 from "@/assets/client-logos/logo-1.png";
import logo2 from "@/assets/client-logos/logo-2.png";
import logo3 from "@/assets/client-logos/logo-3.png";
import logo4 from "@/assets/client-logos/logo-4.png";
import logo5 from "@/assets/client-logos/logo-5.png";
import logo6 from "@/assets/client-logos/logo-6.png";
import logo7 from "@/assets/client-logos/logo-7.png";
import logo8 from "@/assets/client-logos/logo-8.png";
import logo9 from "@/assets/client-logos/logo-9.png";
import logo10 from "@/assets/client-logos/logo-10.png";
import logo11 from "@/assets/client-logos/logo-11.png";
import logo12 from "@/assets/client-logos/logo-12.png";
import logo13 from "@/assets/client-logos/logo-13.png";
import logo14 from "@/assets/client-logos/logo-14.png";
import logo15 from "@/assets/client-logos/logo-15.png";
import logo16 from "@/assets/client-logos/logo-16.png";
import logo17 from "@/assets/client-logos/logo-17.png";

// Logo grid layout: Row 1: 5, Row 2: 4, Row 3: 5, Row 4: 3
const logoRows = [
  [logo1, logo2, logo3, logo4, logo5],
  [logo6, logo7, logo8, logo9],
  [logo10, logo11, logo12, logo13, logo14],
  [logo15, logo16, logo17],
];

const ClientLogos = () => {
  const { t } = useLanguage();

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
                    key={logoIndex}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.5,
                      delay: globalIndex * 0.08,
                      ease: [0.25, 0.4, 0.25, 1],
                    }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 },
                    }}
                    animate={{
                      y: [0, -3, 0],
                      scale: [1, 1.01, 1],
                    }}
                    // @ts-ignore
                    transition={{
                      y: {
                        duration: 3 + (globalIndex % 3) * 0.5,
                        repeat: Infinity,
                        ease: [0.45, 0.05, 0.55, 0.95],
                        delay: globalIndex * 0.2,
                      },
                      scale: {
                        duration: 3 + (globalIndex % 3) * 0.5,
                        repeat: Infinity,
                        ease: [0.45, 0.05, 0.55, 0.95],
                        delay: globalIndex * 0.2,
                      },
                    }}
                    className="flex items-center justify-center w-20 md:w-24 lg:w-28"
                  >
                    <img
                      src={logo}
                      alt={`Client logo ${globalIndex + 1}`}
                      className="max-h-12 md:max-h-14 lg:max-h-16 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
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
