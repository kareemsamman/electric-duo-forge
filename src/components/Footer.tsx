import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { SiWaze } from "react-icons/si";

const Footer = () => {
  const { language, t } = useLanguage();
  const { content } = useContent();

  return (
    <footer className="bg-primary text-primary-foreground py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
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
            <div className="grid grid-cols-2 gap-x-8">
              <nav className="flex flex-col gap-4">
                <Link to="/" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                  {t("nav.home")}
                </Link>
                <Link to="/about" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                  {t("nav.about")}
                </Link>
                <Link to="/solutions" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                  {language === "he" ? "פתרונות" : "Solutions"}
                </Link>
                <Link to="/projects" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                  {t("nav.projects")}
                </Link>
              </nav>
              <nav className="flex flex-col gap-4">
                <Link to="/store" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                  {language === "he" ? "חנות" : "Store"}
                </Link>
                <Link to="/gallery" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                  {language === "he" ? "גלריה" : "Gallery"}
                </Link>
                <Link to="/certificates" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                  {language === "he" ? "אישורים" : "Certificates"}
                </Link>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-accent transition-colors text-base">
                  {t("nav.contact")}
                </Link>
              </nav>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-xl">
              {language === "he" ? "כתובת" : "Address"}
            </h4>
            <p className="text-primary-foreground/80 leading-relaxed text-base">
              {language === "he" 
                ? "עטרות 52 - ירושלים"
                : "52 Atarot - Jerusalem"}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-xl">
              {language === "he" ? "עקבו אחרינו" : "Follow Us"}
            </h4>
            <div className="flex flex-wrap gap-3">
              {content["social.facebook_url"] && (
                <a
                  href={content["social.facebook_url"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <Facebook size={22} />
                </a>
              )}
              {content["social.instagram_url"] && (
                <a
                  href={content["social.instagram_url"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <Instagram size={22} />
                </a>
              )}
              {content["social.tiktok_url"] && (
                <a
                  href={content["social.tiktok_url"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <FaTiktok size={20} />
                </a>
              )}
              {content["social.twitter_url"] && (
                <a
                  href={content["social.twitter_url"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <BsTwitterX size={20} />
                </a>
              )}
              {content["social.linkedin_url"] && (
                <a
                  href={content["social.linkedin_url"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <Linkedin size={22} />
                </a>
              )}
              {content["social.youtube_url"] && (
                <a
                  href={content["social.youtube_url"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <Youtube size={22} />
                </a>
              )}
              {content["social.waze_url"] && (
                <a
                  href={content["social.waze_url"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <SiWaze size={22} />
                </a>
              )}
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
