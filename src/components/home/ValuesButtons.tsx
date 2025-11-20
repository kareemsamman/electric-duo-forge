import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const ValuesButtons = () => {
  const { language } = useLanguage();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            asChild
            size="lg"
            className="h-14 px-8 text-white rounded-full text-base font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-[1.03]"
            style={{backgroundColor: '#1A73E8'}}
          >
            <Link to="/contact" className="flex items-center">
              {language === "he" ? "צור קשר" : "Contact Us"}
              <ArrowRight className={`${language === "he" ? "mr-2 rotate-180" : "ml-2"}`} size={20} />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 px-8 border-2 border-gray-300 text-gray-900 hover:bg-gray-50 rounded-full text-base font-semibold w-full sm:w-auto transition-all duration-300"
          >
            <Link to="/projects">
              {language === "he" ? "הפרויקטים שלנו" : "Our Projects"}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuesButtons;
