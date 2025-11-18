import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: t("nav.home") },
    { path: "/about", label: t("nav.about") },
    { path: "/solutions", label: t("nav.solutions") },
    { path: "/projects", label: t("nav.projects") },
    { path: "/store", label: t("nav.store") },
    { path: "/gallery", label: t("nav.gallery") },
    { path: "/certificates", label: t("nav.certificates") },
    { path: "/contact", label: t("nav.contact") },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 flex justify-center pt-6 px-4 md:px-8">
      <div className="max-w-[1280px] w-full bg-background/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-6 md:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="text-2xl font-bold text-primary">
              {language === "he" ? "גלובל אלקטריק" : "Global Electric"}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-base font-semibold transition-all duration-300 relative py-2 group
                  ${isActive(item.path) ? "text-accent" : "text-foreground/90 hover:text-foreground"}
                `}
              >
                {item.label}
                <span 
                  className={`absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-300 
                    ${isActive(item.path) ? "w-full" : "w-0 group-hover:w-full"}
                  `}
                />
              </Link>
            ))}
          </nav>

          {/* Language Toggle & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "he" ? "en" : "he")}
              className="font-semibold border-white/30 hover:bg-white/10 hover:border-white/50 transition-all"
            >
              {language === "he" ? "EN" : "HE"}
            </Button>

            <Link to="/contact" className="hidden lg:block">
              <Button
                size="default"
                className="bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 rounded-xl px-6"
              >
                {t("nav.contact")}
              </Button>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-white/20 mt-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 text-base font-semibold transition-colors hover:text-accent
                  ${isActive(item.path) ? "text-accent" : "text-foreground/90"}
                `}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/contact" className="block mt-4" onClick={() => setMobileMenuOpen(false)}>
              <Button
                size="default"
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg shadow-accent/20 rounded-xl"
              >
                {t("nav.contact")}
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
