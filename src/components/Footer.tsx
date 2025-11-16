import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              {language === "he" ? "גלובל אלקטריק" : "Global Electric"}
            </h3>
            <p className="text-primary-foreground/80 leading-relaxed">
              {language === "he"
                ? "הנדסת חשמל, ייצור לוחות חשמל ופתרונות מקצועיים"
                : "Electrical engineering, panel manufacturing and professional solutions"}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">
              {language === "he" ? "קישורים" : "Links"}
            </h4>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-primary-foreground/80 hover:text-accent transition-colors">
                {t("nav.home")}
              </Link>
              <Link to="/about" className="text-primary-foreground/80 hover:text-accent transition-colors">
                {t("nav.about")}
              </Link>
              <Link to="/projects" className="text-primary-foreground/80 hover:text-accent transition-colors">
                {t("nav.projects")}
              </Link>
              <Link to="/contact" className="text-primary-foreground/80 hover:text-accent transition-colors">
                {t("nav.contact")}
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">
              {language === "he" ? "עקבו אחרינו" : "Follow Us"}
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Global Electric. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
