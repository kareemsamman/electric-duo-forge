import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Shield, Wrench, Zap, CheckCircle, Clock, Users } from "lucide-react";

const ValuesCards = () => {
  const { language } = useLanguage();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const cards = [
    {
      icon: Shield,
      titleHe: "פתרון אמין למארזים",
      titleEn: "Reliable solution for enclosures",
      descriptionHe: "מערכות הגנה ובקרה איכותיות ומותאמות אישית",
      descriptionEn: "High-quality protection and control systems, customized for you"
    },
    {
      icon: Wrench,
      titleHe: "מותאם לפרויקט שלך",
      titleEn: "Customized for your project",
      descriptionHe: "תכנון והתקנה לפי הדרישות הספציפיות שלך",
      descriptionEn: "Design and installation according to your specific requirements"
    },
    {
      icon: Zap,
      titleHe: "טכנולוגיה מתקדמת",
      titleEn: "Advanced technology",
      descriptionHe: "ציוד חשמלי מהמתקדמים בשוק",
      descriptionEn: "The most advanced electrical equipment on the market"
    },
    {
      icon: CheckCircle,
      titleHe: "אישורים ותקנים",
      titleEn: "Certifications and standards",
      descriptionHe: "עומדים בכל התקנים והאישורים הנדרשים",
      descriptionEn: "Meeting all required standards and certifications"
    },
    {
      icon: Clock,
      titleHe: "זמינות ושירות",
      titleEn: "Availability and service",
      descriptionHe: "תמיכה מלאה לאורך כל שלבי הפרויקט",
      descriptionEn: "Full support throughout all project stages"
    },
    {
      icon: Users,
      titleHe: "צוות מקצועי",
      titleEn: "Professional team",
      descriptionHe: "מהנדסים וטכנאים מנוסים לשירותכם",
      descriptionEn: "Experienced engineers and technicians at your service"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const
      }
    }
  };

  return (
    <section className="py-20 md:py-32 bg-white" ref={ref}>
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                    <Icon className="w-7 h-7 text-[#1A73E8]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === "he" ? card.titleHe : card.titleEn}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {language === "he" ? card.descriptionHe : card.descriptionEn}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ValuesCards;
