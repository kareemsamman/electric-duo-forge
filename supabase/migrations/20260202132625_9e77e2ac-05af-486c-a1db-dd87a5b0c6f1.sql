-- Add is_visible column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

-- Create services table for CMS management
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon TEXT NOT NULL DEFAULT 'ClipboardCheck',
  title_he TEXT NOT NULL,
  title_en TEXT,
  description_he TEXT NOT NULL,
  description_en TEXT,
  link_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public read access for services
CREATE POLICY "Services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (true);

-- Admin insert/update/delete (using has_role function)
CREATE POLICY "Admins can manage services" 
ON public.services 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default services data
INSERT INTO public.services (icon, title_he, title_en, description_he, description_en, display_order) VALUES
('ClipboardCheck', 'תכנון לוחות חשמל', 'Electrical Panel Planning', 'ליווי הנדסי מלא, התאמת לוחות סטנדרטיים ופתרונות מותאמים אישית לפי דרישות הפרויקט והתקנים.', 'Full engineering support, standard panel customization and tailor-made solutions according to project requirements and standards.', 0),
('Factory', 'ייצור והרכבה במפעל', 'Factory Manufacturing', 'ייצור לוחות חשמל במפעל מאושר, עם בקרת איכות קפדנית בכל שלב של ההרכבה.', 'Electrical panel manufacturing in an approved factory, with strict quality control at every stage of assembly.', 1),
('Wrench', 'אינטגרציה באתר הלקוח', 'On-site Integration', 'שילוב הלוחות במערכות הקיימות, חיווט, בדיקות והרצה בשטח.', 'Integration of panels into existing systems, wiring, testing and on-site commissioning.', 2),
('FlaskConical', 'בדיקות, תקינה ואישור מעבדה', 'Testing & Certification', 'בדיקות עומס ובטיחות, הכנת המסמכים הנדרשים ואישורי תקינה לפי ISO ותקנים מקומיים.', 'Load and safety testing, preparation of required documents and certifications according to ISO and local standards.', 3),
('Headphones', 'שירות ותחזוקה שוטפת', 'Service & Maintenance', 'תמיכה טכנית ותחזוקה מונעת להבטחת פעילות רציפה ותקינה של מערכות החשמל.', 'Technical support and preventive maintenance to ensure continuous and proper operation of electrical systems.', 4);