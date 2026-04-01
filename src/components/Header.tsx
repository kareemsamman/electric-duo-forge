import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { CartIcon } from "@/components/cart/CartIcon";
import { Menu, X, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { useState } from "react";
import { FaTiktok } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { SiWaze } from "react-icons/si";

const Header = () => {
  const { language, setLanguage } = useLanguage();
  const { content } = useContent();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: content["header.nav.home"] || "Home" },
    { path: "/about", label: content["header.nav.about"] || "About" },
    { path: "/solutions", label: content["header.nav.solutions"] || "Solutions" },
    { path: "/projects", label: content["header.nav.projects"] || "Projects" },
    { path: "/new-project", label: content["header.nav.newproject"] || "פרויקט חדש" },
    { path: "/store", label: content["header.nav.store"] || "Store" },
    { path: "/gallery", label: content["header.nav.gallery"] || "Gallery" },
    { path: "/certificates", label: content["header.nav.certificates"] || "Certificates" },
    { path: "/contact", label: content["header.nav.contact"] || "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 flex justify-center pt-6 px-4 md:px-8">
      <div className="max-w-[1400px] w-full backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-6 md:px-8 lg:px-10" style={{ background: 'linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 25%, rgba(255,255,255,0.95) 45%, hsl(var(--background) / 0.6) 100%)' }}>
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80 ml-8">
            {content["header.logo_url"] ? (
              <img src={content["header.logo_url"]} alt={content["header.logo"] || "Logo"} className="h-14 object-contain" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {content["header.logo"] || "Global Electric"}
              </div>
            )}
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

          {/* Language Toggle & Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            <CartIcon />
            
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
                {content["header.nav.contact"] || "Contact"}
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
          <nav className="lg:hidden py-4 border-t border-white/20 mt-2 flex flex-col">
            <div className="flex-1">
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
                  {content["header.nav.contact"] || "Contact"}
                </Button>
              </Link>
            </div>
            
            {/* Social Icons - Horizontal Row at Bottom */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/10">
              {content["social.facebook_url"] && (
                <a href={content["social.facebook_url"]} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-accent transition-colors">
                  <Facebook size={20} />
                </a>
              )}
              {content["social.instagram_url"] && (
                <a href={content["social.instagram_url"]} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-accent transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {content["social.tiktok_url"] && (
                <a href={content["social.tiktok_url"]} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-accent transition-colors">
                  <FaTiktok size={20} />
                </a>
              )}
              {content["social.twitter_url"] && (
                <a href={content["social.twitter_url"]} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-accent transition-colors">
                  <BsTwitterX size={20} />
                </a>
              )}
              {content["social.linkedin_url"] && (
                <a href={content["social.linkedin_url"]} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-accent transition-colors">
                  <Linkedin size={20} />
                </a>
              )}
              {content["social.youtube_url"] && (
                <a href={content["social.youtube_url"]} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-accent transition-colors">
                  <Youtube size={20} />
                </a>
              )}
              {content["social.waze_url"] && (
                <a href={content["social.waze_url"]} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-accent transition-colors">
                  <SiWaze size={20} />
                </a>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
