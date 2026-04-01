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
    "stats.title": "במספרים",
    "stats.experience": "שנות ניסיון",
    "stats.experienceDesc": "ניסיון רב בתכנון וייצור לוחות חשמל",
    "stats.projects": "פרויקטים שבוצעו",
    "stats.projectsDesc": "פרויקטים מוכחים בכל רחבי הארץ",
    "stats.facility": "מ״ר מפעל ייצור",
    "stats.facilityDesc": "מתקן ייצור מודרני ומצויד",
    "stats.standards": "תקני איכות ISO ו־IQNet",
    "stats.standardsDesc": "מוסמך לפי תקני איכות בינלאומיים",
    "stats.countries": "מדינות פעילות",
    "stats.countriesDesc": "לוחות ופתרונות חשמל לפרויקטים ברחבי העולם",
    "stats.delivery": "עמידה בזמני אספקה",
    "stats.deliveryDesc": "אספקת פרויקטים לפי לוחות זמנים מחמירים",
    
    // Services
    "services.title": "השירותים שלנו",
    "services.subtitle": "פתרונות חשמל מקצה לקצה – משלב התכנון ועד ההפעלה באתר הלקוח.",
    "services.viewAll": "לצפייה בכל הפתרונות שלנו",
    "services.planning.title": "תכנון לוחות חשמל",
    "services.planning.desc": "ליווי הנדסי מלא, התאמת לוחות סטנדרטיים ופתרונות מותאמים אישית לפי דרישות הפרויקט והתקנים.",
    "services.manufacturing.title": "ייצור והרכבה במפעל",
    "services.manufacturing.desc": "ייצור לוחות חשמל במפעל מאושר, עם בקרת איכות קפדנית בכל שלב של ההרכבה.",
    "services.integration.title": "אינטגרציה באתר הלקוח",
    "services.integration.desc": "שילוב הלוחות במערכות הקיימות, חיווט, בדיקות והרצה בשטח.",
    "services.testing.title": "בדיקות, תקינה ואישור מעבדה",
    "services.testing.desc": "בדיקות עומס ובטיחות, הכנת המסמכים הנדרשים ואישורי תקינה לפי ISO ותקנים מקומיים.",
    "services.maintenance.title": "שירות ותחזוקה שוטפת",
    "services.maintenance.desc": "מענה מהיר לתקלות, שדרוג מערכות קיימות ותמיכה טכנית שוטפת.",
    
    // Projects
    "projects.title": "פרויקטים נבחרים",
    "projects.subtitle": "מדגם קטן מפרויקטים שביצענו עבור לקוחות בכל הארץ",
    "projects.viewAll": "לכל הפרויקטים",
    
    // Why Us
    "whyus.title": "למה לעבוד איתנו",
    "whyus.iso": "מפעל מוסמך ISO",
    "whyus.isoDesc": "מתקן ייצור מאושר לפי תקני איכות בינלאומיים ISO ו-IQNet",
    "whyus.delivery": "זמני אספקה מהירים",
    "whyus.deliveryDesc": "עמידה בלוחות זמנים מחמירים ואספקה יעילה לכל פרויקט",
    "whyus.quality": "איכות בלתי מתפשרת",
    "whyus.qualityDesc": "בקרת איכות קפדנית בכל שלב מתכנון ועד התקנה סופית",
    "whyus.service": "שירות אישי",
    "whyus.serviceDesc": "ליווי צמוד ותמיכה מקצועית לאורך כל חיי הפרויקט",
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
    "about.commitment": "אנו מתחייבים לסטנדרט השירות הגבוה ביותר בכל פרויקט. מקצועיות, אמינות ודיוק – הם הערכים שמובילים אותנו בכל שלב. שביעות רצון הלקוח היא לא רק מטרה – היא ההתחייבות שלנו.",
    "about.company_description": "חברת גלובל אלקטריק הנדסת חשמל בע''מ הוקמה בשנת 2013 בירושלים.\n\nהחברה הינה מהמובילות במשק בתחום החשמל ובקרה. החברה מסווגת כקבלנית חשמל ברשם הקבלנים (מס' קבלן 36171) ובעיקר מתעסקת ומוסמכת בייצור לוחות חשמל בהתאם לתקן ישראלי 61439-2 והיא פועלת בכפוף ISO 9001-2015\n\nלחברה היתרים לייצור לוחות חשמל מטעם מכון התקנים הישראלי (היתר מס' 116044) והסמכות עד זרם בלתי מוגבל. מפעל החברה עומד בכל התנאים הנדרשים והמתאימים לדרישות תקן הלוחות בכל זמן. לחברה גמישות מירבית בייצור לוחות החשמל וקישורי עבודה מול היצרנים המובילים בשוק תמחש, ABB, HAGGER, EATON, RITTAL\n\nלחברה מפעל בשטח כ 850 מ''ר, מערך ייצור הלוחות כולל מחלקת תכנון והנדסה שכוללת מהנדסים והנדסאי חשמל בעלי ידע וניסיון רב, מחלקת שרטוט ורצפת ייצור שכוללת צוות חווטים מיומן בעל כישרון וניסיון רב בתחום. במפעלנו עובדים עם מכשור המשוכלל והטוב ביותר. עם הקפדה פדנטית על כיול המכשירים. למפעלנו מערכת בקרת איכות עם מכשור מתקדם המעבירה כל לוח בדיקה כוללת לפי התקן. החברה מפעילה מערכת שירות לתמיכה בלוחתיה בכל זמן ובכל אתר",
    
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
    
    // Client Logos
    "clients.title": "לקוחות שבחרו לעבוד איתנו",
    "clients.subtitle": "מגוון רחב של חברות וארגונים מהמגזר הציבורי והפרטי",
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
    "stats.title": "By the Numbers",
    "stats.experience": "Years of Experience",
    "stats.experienceDesc": "Extensive experience in electrical panel design and manufacturing",
    "stats.projects": "Completed Projects",
    "stats.projectsDesc": "Proven projects across the country",
    "stats.facility": "sqm Manufacturing Facility",
    "stats.facilityDesc": "Modern and equipped production facility",
    "stats.standards": "ISO & IQNet Quality Standards",
    "stats.standardsDesc": "Certified according to international quality standards",
    "stats.countries": "Active Countries",
    "stats.countriesDesc": "Electrical panels and solutions for projects worldwide",
    "stats.delivery": "On-Time Delivery",
    "stats.deliveryDesc": "Project delivery according to strict schedules",
    
    // Services
    "services.title": "Our Services",
    "services.subtitle": "End-to-end electrical solutions – from planning stage to on-site implementation.",
    "services.viewAll": "View All Solutions",
    "services.planning.title": "Electrical Panel Planning",
    "services.planning.desc": "Full engineering support, adaptation of standard panels and custom solutions according to project requirements and standards.",
    "services.manufacturing.title": "Manufacturing & Assembly",
    "services.manufacturing.desc": "Manufacturing electrical panels in a certified facility, with strict quality control at every stage of assembly.",
    "services.integration.title": "On-Site Integration",
    "services.integration.desc": "Integration of panels into existing systems, wiring, testing and on-site commissioning.",
    "services.testing.title": "Testing, Standards & Lab Approval",
    "services.testing.desc": "Load and safety testing, preparation of required documentation and compliance approvals according to ISO and local standards.",
    "services.maintenance.title": "Service & Ongoing Maintenance",
    "services.maintenance.desc": "Quick response to malfunctions, upgrading existing systems and ongoing technical support.",
    
    // Projects
    "projects.title": "Selected Projects",
    "projects.subtitle": "A small sample of projects we've completed for clients across the country",
    "projects.viewAll": "View All Projects",
    
    // Why Us
    "whyus.title": "Why Work With Us",
    "whyus.iso": "ISO Certified Facility",
    "whyus.isoDesc": "Production facility certified according to international ISO and IQNet quality standards",
    "whyus.delivery": "Fast Delivery Times",
    "whyus.deliveryDesc": "Meeting strict schedules and efficient delivery for every project",
    "whyus.quality": "Uncompromising Quality",
    "whyus.qualityDesc": "Rigorous quality control at every stage from design to final installation",
    "whyus.service": "Personal Service",
    "whyus.serviceDesc": "Close support and professional assistance throughout the project lifecycle",
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
    "about.commitment": "We are committed to the highest standard of service in every project. Professionalism, reliability, and precision are the values that guide us at every step. Customer satisfaction is not just a goal – it is our commitment.",
    "about.company_description": "Global Electric for Electrical Engineering Ltd. was established in 2013 in Jerusalem.\n\nThe company is one of the leading firms in the Israeli market in the fields of electrical systems and control. It is registered as an electrical contractor with the Contractors Registrar (Contractor No. 36171) and primarily specializes in the manufacturing of electrical panels in accordance with Israeli Standard 61439-2. The company operates under ISO 9001:2015 certification.\n\nThe company holds permits from the Standards Institution of Israel for the manufacturing of electrical panels (Permit No. 116044), with authorization for unlimited current ratings. The company's factory meets all required conditions and complies with panel standard requirements at all times. It offers maximum flexibility in panel production and maintains working relationships with leading manufacturers in the market, including Temahash, ABB, Hager, Eaton, and Rittal.\n\nThe company operates a factory spanning approximately 850 square meters. Its panel production system includes a planning and engineering department staffed by experienced electrical engineers and technicians, a drafting department, and a production floor with a skilled wiring team possessing extensive expertise. The factory uses advanced, high-quality equipment, with strict adherence to precise calibration. It also maintains a quality control system equipped with advanced instruments, ensuring that every panel undergoes comprehensive testing in accordance with standards.\n\nThe company provides a service system to support its panels at any time and at any site.",
    
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
    
    // Client Logos
    "clients.title": "Clients Who Chose to Work With Us",
    "clients.subtitle": "A wide range of companies and organizations from the public and private sectors",
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
