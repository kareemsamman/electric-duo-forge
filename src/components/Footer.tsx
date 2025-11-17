import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          <div>
            <h3 className="text-3xl font-bold mb-6">
              {language === "he" ? "גלובל אלקטריק" : "Global Electric"}
            </h3>
            <p className="text-primary-foreground/80 leading-relaxed text-base">
              {language === "he"
                ? "הנדסת חשמל, ייצור לוחות חשמל ופתרונות מקצועיים"
                : "Electrical engineering, panel manufacturing and professional solutions"}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-xl">
              {language === "he" ? "קישורים" : "Links"}
            </h4>
            <nav className="flex flex-col gap-4">
              <Link to="/" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                {t("nav.home")}
              </Link>
              <Link to="/about" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                {t("nav.about")}
              </Link>
              <Link to="/projects" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                {t("nav.projects")}
              </Link>
              <Link to="/contact" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                {t("nav.contact")}
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-xl">
              {language === "he" ? "עקבו אחרינו" : "Follow Us"}
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <Facebook size={22} />
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <Instagram size={22} />
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <Linkedin size={22} />
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
              >
                <Youtube size={22} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-10 text-center text-base text-primary-foreground/60">
          © {new Date().getFullYear()} Global Electric. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
