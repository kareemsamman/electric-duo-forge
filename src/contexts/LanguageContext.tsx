import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "he" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  he: {
    // Navigation
    "nav.home": "בית",
    "nav.about": "אודות",
    "nav.solutions": "פתרונות",
    "nav.projects": "פרויקטים",
    "nav.store": "חנות",
    "nav.gallery": "גלריה",
    "nav.certificates": "אישורים",
    "nav.contact": "צור קשר",
    
    // Hero
    "hero.title": "לוחות חשמל ופתרונות הנדסיים ברמה הגבוהה ביותר",
    "hero.subtitle": "ייצור, תכנון וביצוע מלא לפרויקטים במתח נמוך ובמתח גבוה",
    "hero.cta.primary": "בקשת הצעת מחיר",
    "hero.cta.secondary": "צפייה בפרויקטים",
    
    // Stats
    "stats.experience": "שנות ניסיון",
    "stats.projects": "פרויקטים שבוצעו",
    "stats.facility": "מ״ר מפעל ייצור",
    "stats.standards": "תקני איכות ISO ו־IQNet",
    
    // Services
    "services.title": "השירותים שלנו",
    "services.manufacturing.title": "ייצור לוחות חשמל",
    "services.manufacturing.desc": "לוחות פיקוד, בקרה, מתח נמוך ומתח גבוה",
    "services.engineering.title": "תכנון הנדסי",
    "services.engineering.desc": "שרטוטים, סכימות, חישובי עומסים ותיאום עם יועצים",
    "services.execution.title": "עבודות ביצוע",
    "services.execution.desc": "התקנות שטח, שדרוגים, חיבור והפעלה",
    
    // Projects
    "projects.title": "פרויקטים נבחרים",
    "projects.viewAll": "לכל הפרויקטים",
    
    // Why Us
    "whyus.title": "למה לעבוד איתנו",
    "whyus.iso": "מפעל מוסמך ISO",
    "whyus.delivery": "זמני אספקה מהירים",
    "whyus.quality": "איכות בלתי מתפשרת",
    "whyus.service": "שירות אישי",
    "whyus.design": "תכנון עד ביצוע",
    "whyus.testing": "בדיקות איכות מקיפות",
    
    // CTA
    "cta.title": "מתכננים פרויקט חדש?",
    "cta.subtitle": "נשמח לסייע בתכנון ובייצור לוחות החשמל שלכם",
    "cta.button": "דברו איתנו",
    
    // Contact
    "contact.title": "צור קשר",
    "contact.form.name": "שם מלא",
    "contact.form.email": "אימייל",
    "contact.form.phone": "טלפון",
    "contact.form.message": "הודעה",
    "contact.form.file": "העלאת קובץ",
    "contact.form.submit": "שליחה",
    "contact.form.whatsapp": "פתיחת ווטסאפ",
    "contact.info.phone": "טלפון",
    "contact.info.email": "אימייל",
    "contact.info.address": "כתובת",
    "contact.info.hours": "שעות פעילות",
    "contact.bank.title": "פרטי בנק",
    "contact.bank.name": "שם הבנק",
    "contact.bank.branch": "מספר סניף",
    "contact.bank.account": "מספר חשבון",
    "contact.bank.holder": "שם בעל החשבון",
    
    // About
    "about.title": "מי אנחנו",
    "about.founder.name": "אסם עודה",
    "about.founder.title": "מהנדס חשמל, מייסד ומנכ״ל",
    "about.team.title": "צוות הנהלה",
    
    // Store
    "store.title": "חנות",
    "store.description": "מבחר מוצרי חשמל ממותג גלובל אלקטריק",
    "store.price": "מחיר",
    
    // Gallery
    "gallery.title": "גלריה",
    "gallery.description": "תמונות מתוך פרויקטים, המפעל והצוות שלנו",
    
    // Featured Products
    "featured.products.title": "מוצרים נבחרים",
    "featured.products.viewAll": "לכל המוצרים",
    
    // Video Section
    "video.section.title": "הצצה למפעל",
    
    // Team Preview
    "team.preview.title": "הצוות שלנו",
    "team.preview.viewAll": "צוות מלא",
    
    // Gallery Preview
    "gallery.preview.title": "מתוך הפרויקטים שלנו",
    "gallery.preview.viewAll": "לכל הגלריה",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.solutions": "Solutions",
    "nav.projects": "Projects",
    "nav.store": "Store",
    "nav.gallery": "Gallery",
    "nav.certificates": "Certificates",
    "nav.contact": "Contact",
    
    // Hero
    "hero.title": "Electrical Panels & Engineering Solutions at the Highest Level",
    "hero.subtitle": "Manufacturing, planning and full execution for low and high voltage projects",
    "hero.cta.primary": "Request a Quote",
    "hero.cta.secondary": "View Projects",
    
    // Stats
    "stats.experience": "Years of Experience",
    "stats.projects": "Completed Projects",
    "stats.facility": "sqm Manufacturing Facility",
    "stats.standards": "ISO & IQNet Quality Standards",
    
    // Services
    "services.title": "Our Services",
    "services.manufacturing.title": "Electrical Panel Manufacturing",
    "services.manufacturing.desc": "Control panels, low voltage and high voltage systems",
    "services.engineering.title": "Engineering Design",
    "services.engineering.desc": "Drawings, schematics, load calculations and coordination",
    "services.execution.title": "Execution Works",
    "services.execution.desc": "Field installations, upgrades, connection and commissioning",
    
    // Projects
    "projects.title": "Selected Projects",
    "projects.viewAll": "View All Projects",
    
    // Why Us
    "whyus.title": "Why Work With Us",
    "whyus.iso": "ISO Certified Facility",
    "whyus.delivery": "Fast Delivery Times",
    "whyus.quality": "Uncompromising Quality",
    "whyus.service": "Personal Service",
    "whyus.design": "Design to Execution",
    "whyus.testing": "Comprehensive Quality Testing",
    
    // CTA
    "cta.title": "Planning a New Project?",
    "cta.subtitle": "We'd be happy to help with planning and manufacturing your electrical panels",
    "cta.button": "Talk to Us",
    
    // Contact
    "contact.title": "Contact Us",
    "contact.form.name": "Full Name",
    "contact.form.email": "Email",
    "contact.form.phone": "Phone",
    "contact.form.message": "Message",
    "contact.form.file": "Upload File",
    "contact.form.submit": "Send",
    "contact.form.whatsapp": "Open WhatsApp",
    "contact.info.phone": "Phone",
    "contact.info.email": "Email",
    "contact.info.address": "Address",
    "contact.info.hours": "Business Hours",
    "contact.bank.title": "Bank Details",
    "contact.bank.name": "Bank Name",
    "contact.bank.branch": "Branch Number",
    "contact.bank.account": "Account Number",
    "contact.bank.holder": "Account Holder Name",
    
    // About
    "about.title": "About Us",
    "about.founder.name": "Assem Ouda",
    "about.founder.title": "Electrical Engineer, Founder & CEO",
    "about.team.title": "Management Team",
    
    // Store
    "store.title": "Store",
    "store.description": "Selection of Global Electric branded electrical products",
    "store.price": "Price",
    
    // Gallery
    "gallery.title": "Gallery",
    "gallery.description": "Photos from projects, our facility and team",
    
    // Featured Products
    "featured.products.title": "Featured Products",
    "featured.products.viewAll": "View All Products",
    
    // Video Section
    "video.section.title": "Inside Our Facility",
    
    // Team Preview
    "team.preview.title": "Our Team",
    "team.preview.viewAll": "Full Team",
    
    // Gallery Preview
    "gallery.preview.title": "From Our Projects",
    "gallery.preview.viewAll": "Full Gallery",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("he");

  useEffect(() => {
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.he] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
