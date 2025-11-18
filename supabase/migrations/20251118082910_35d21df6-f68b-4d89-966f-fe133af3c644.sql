-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create site_content table for managing all website text
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value_he TEXT NOT NULL,
  value_en TEXT,
  section TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to site_content"
ON public.site_content
FOR SELECT
USING (true);

-- Allow authenticated users to update content (for admin interface)
CREATE POLICY "Allow authenticated users to update site_content"
ON public.site_content
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_site_content_key ON public.site_content(key);
CREATE INDEX idx_site_content_section ON public.site_content(section);

-- Insert all existing content
INSERT INTO public.site_content (key, value_he, value_en, section, description) VALUES
-- Header
('header.logo', 'גלובל אלקטריק', 'Global Electric', 'header', 'Company logo text'),
('header.nav.home', 'דף הבית', 'Home', 'header', 'Home navigation link'),
('header.nav.about', 'אודות', 'About', 'header', 'About navigation link'),
('header.nav.solutions', 'פתרונות', 'Solutions', 'header', 'Solutions navigation link'),
('header.nav.projects', 'פרויקטים', 'Projects', 'header', 'Projects navigation link'),
('header.nav.store', 'חנות', 'Store', 'header', 'Store navigation link'),
('header.nav.gallery', 'גלריה', 'Gallery', 'header', 'Gallery navigation link'),
('header.nav.certificates', 'אישורים', 'Certificates', 'header', 'Certificates navigation link'),
('header.nav.contact', 'צור קשר', 'Contact', 'header', 'Contact navigation link'),

-- Hero Section
('hero.title', 'פתרונות חשמל מתקדמים לכל פרויקט', 'Advanced Electrical Solutions for Every Project', 'hero', 'Main hero headline'),
('hero.subtitle', 'מהתכנון ועד ההפעלה - אנחנו מספקים פתרונות חשמל מקצה לקצה עבור פרויקטים תעשייתיים, מסחריים ומוסדיים בכל הארץ', 'From design to implementation - we provide end-to-end electrical solutions for industrial, commercial and institutional projects nationwide', 'hero', 'Hero subtitle'),
('hero.cta.primary', 'צור קשר', 'Contact Us', 'hero', 'Primary hero button'),
('hero.cta.secondary', 'הפרויקטים שלנו', 'Our Projects', 'hero', 'Secondary hero button'),

-- Featured Products
('featured_products.title', 'מוצרים נבחרים', 'Featured Products', 'featured_products', 'Featured products section title'),

-- Stats Section
('stats.title', 'במספרים', 'By The Numbers', 'stats', 'Statistics section title'),
('stats.projects.number', '500+', '500+', 'stats', 'Number of projects'),
('stats.projects.label', 'פרויקטים שבוצעו', 'Completed Projects', 'stats', 'Projects label'),
('stats.experience.number', '25+', '25+', 'stats', 'Years of experience'),
('stats.experience.label', 'שנות ניסיון', 'Years of Experience', 'stats', 'Experience label'),
('stats.clients.number', '200+', '200+', 'stats', 'Number of clients'),
('stats.clients.label', 'לקוחות מרוצים', 'Satisfied Clients', 'stats', 'Clients label'),
('stats.team.number', '50+', '50+', 'stats', 'Team size'),
('stats.team.label', 'אנשי צוות מקצועיים', 'Professional Team Members', 'stats', 'Team label'),
('stats.coverage.number', '24/7', '24/7', 'stats', 'Service coverage'),
('stats.coverage.label', 'זמינות ותמיכה', 'Availability & Support', 'stats', 'Coverage label'),
('stats.quality.number', 'ISO 9001', 'ISO 9001', 'stats', 'Quality certification'),
('stats.quality.label', 'תקן איכות בינלאומי', 'International Quality Standard', 'stats', 'Quality label'),

-- Why Us Section
('whyus.title', 'למה לעבוד איתנו', 'Why Work With Us', 'whyus', 'Why us section title'),
('whyus.iso.title', 'מפעל מוסמך ISO', 'ISO Certified Facility', 'whyus', 'ISO certification title'),
('whyus.iso.desc', 'מתקן ייצור מאושר לפי תקני איכות בינלאומיים ISO ו-IQNet', 'Production facility certified according to international ISO and IQNet quality standards', 'whyus', 'ISO certification description'),
('whyus.delivery.title', 'זמני אספקה מהירים', 'Fast Delivery Times', 'whyus', 'Delivery title'),
('whyus.delivery.desc', 'עמידה בלוחות זמנים מחמירים ואספקה יעילה לכל פרויקט', 'Meeting strict schedules and efficient delivery for every project', 'whyus', 'Delivery description'),
('whyus.quality.title', 'איכות בלתי מתפשרת', 'Uncompromising Quality', 'whyus', 'Quality title'),
('whyus.quality.desc', 'בקרת איכות קפדנית בכל שלב מתכנון ועד התקנה סופית', 'Rigorous quality control at every stage from design to final installation', 'whyus', 'Quality description'),
('whyus.service.title', 'שירות אישי', 'Personal Service', 'whyus', 'Service title'),
('whyus.service.desc', 'ליווי צמוד ותמיכה מקצועית לאורך כל חיי הפרויקט', 'Close support and professional assistance throughout the project lifecycle', 'whyus', 'Service description'),

-- Services Section
('services.title', 'השירותים שלנו', 'Our Services', 'services', 'Services section title'),
('services.intro', 'פתרונות חשמל מקצה לקצה – משלב התכנון ועד ההפעלה באתר הלקוח', 'End-to-end electrical solutions – from planning stage to on-site operation', 'services', 'Services intro text'),
('services.cta', 'לצפייה בכל הפתרונות שלנו', 'View All Our Solutions', 'services', 'Services CTA link text'),
('services.item1.title', 'תכנון והנדסה', 'Planning & Engineering', 'services', 'Service 1 title'),
('services.item1.desc', 'תכנון מערכות חשמל מתקדמות ומותאמות אישית לכל פרויקט', 'Advanced electrical system planning customized for each project', 'services', 'Service 1 description'),
('services.item2.title', 'ייצור ואינטגרציה', 'Manufacturing & Integration', 'services', 'Service 2 title'),
('services.item2.desc', 'ייצור לוחות חשמל ומערכות בקרה במפעל מוסמך ISO', 'Manufacturing electrical panels and control systems in ISO certified facility', 'services', 'Service 2 description'),
('services.item3.title', 'התקנה והפעלה', 'Installation & Commissioning', 'services', 'Service 3 title'),
('services.item3.desc', 'התקנה מקצועית, הפעלה ובדיקות קבלה מקיפות', 'Professional installation, commissioning and comprehensive acceptance tests', 'services', 'Service 3 description'),
('services.item4.title', 'תחזוקה ותמיכה', 'Maintenance & Support', 'services', 'Service 4 title'),
('services.item4.desc', 'שירותי תחזוקה שוטפת ותמיכה טכנית זמינה 24/7', 'Ongoing maintenance services and 24/7 technical support', 'services', 'Service 4 description'),
('services.item5.title', 'שדרוג ומודרניזציה', 'Upgrade & Modernization', 'services', 'Service 5 title'),
('services.item5.desc', 'שדרוג מערכות חשמל קיימות לטכנולוגיות חדישות', 'Upgrading existing electrical systems to modern technologies', 'services', 'Service 5 description'),

-- Team Section
('team.title', 'הצוות שלנו', 'Our Team', 'team', 'Team section title'),
('team.subtitle', 'צוות מקצועי עם ניסיון רב שנים בתחום החשמל והאנרגיה', 'Professional team with years of experience in electrical and energy sectors', 'team', 'Team section subtitle'),

-- Projects Section
('projects.title', 'פרויקטים נבחרים', 'Selected Projects', 'projects', 'Projects section title'),
('projects.subtitle', 'מדגם קטן מפרויקטים שביצענו עבור לקוחות בכל הארץ', 'A small sample of projects we completed for clients nationwide', 'projects', 'Projects section subtitle'),
('projects.cta', 'לכל הפרויקטים', 'View All Projects', 'projects', 'Projects CTA button'),

-- Gallery Section
('gallery.title', 'גלריה', 'Gallery', 'gallery', 'Gallery section title'),
('gallery.subtitle', 'תמונות ממיזמים שביצענו', 'Photos from projects we completed', 'gallery', 'Gallery section subtitle'),

-- Client Logos Section
('clients.title', 'לקוחות שבחרו לעבוד איתנו', 'Clients Who Chose to Work With Us', 'clients', 'Client logos section title'),
('clients.subtitle', 'אנחנו גאים לשרת מגוון רחב של לקוחות מהמגזר הציבורי והפרטי', 'We are proud to serve a wide range of clients from public and private sectors', 'clients', 'Client logos section subtitle'),

-- CTA Section
('cta.title', 'מתעניינים בפרויקט חדש?', 'Interested in a New Project?', 'cta', 'CTA section title'),
('cta.subtitle', 'צרו קשר עוד היום לייעוץ ראשוני ללא התחייבות', 'Contact us today for an initial consultation with no commitment', 'cta', 'CTA section subtitle'),
('cta.button', 'צור קשר עכשיו', 'Contact Us Now', 'cta', 'CTA button text'),

-- Footer
('footer.about.title', 'אודות החברה', 'About Company', 'footer', 'Footer about title'),
('footer.about.text', 'גלובל אלקטריק היא חברה מובילה בתחום פתרונות החשמל התעשייתיים והמסחריים. אנו מתמחים בתכנון, ייצור והתקנה של מערכות חשמל מורכבות.', 'Global Electric is a leading company in industrial and commercial electrical solutions. We specialize in design, manufacturing and installation of complex electrical systems.', 'footer', 'Footer about text'),
('footer.links.title', 'קישורים מהירים', 'Quick Links', 'footer', 'Footer links title'),
('footer.contact.title', 'צור קשר', 'Contact Us', 'footer', 'Footer contact title'),
('footer.contact.phone', 'טלפון: 03-1234567', 'Phone: 03-1234567', 'footer', 'Footer phone'),
('footer.contact.email', 'דוא"ל: info@globalelectric.co.il', 'Email: info@globalelectric.co.il', 'footer', 'Footer email'),
('footer.contact.address', 'כתובת: רחוב התעשייה 10, תל אביב', 'Address: 10 Industry St, Tel Aviv', 'footer', 'Footer address'),
('footer.copyright', '© 2024 גלובל אלקטריק. כל הזכויות שמורות.', '© 2024 Global Electric. All rights reserved.', 'footer', 'Footer copyright'),

-- WhatsApp
('whatsapp.message', 'שלום! אני מעוניין/ת לקבל מידע נוסף', 'Hello! I would like to receive more information', 'whatsapp', 'WhatsApp default message');