-- Create Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_name_en TEXT,
  product_description TEXT NOT NULL,
  product_description_en TEXT,
  product_specs TEXT NOT NULL,
  product_specs_en TEXT,
  price NUMERIC NOT NULL,
  product_image TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Gallery table
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Team table
CREATE TABLE public.team (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  role_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  photo TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  project_name_en TEXT,
  location TEXT NOT NULL,
  location_en TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  tags_en TEXT[] DEFAULT '{}',
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_name TEXT NOT NULL,
  certificate_name_en TEXT,
  short_description TEXT NOT NULL,
  short_description_en TEXT,
  certificate_image TEXT NOT NULL,
  pdf_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Video Section table
CREATE TABLE public.video_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_title TEXT NOT NULL,
  video_title_en TEXT,
  video_description TEXT NOT NULL,
  video_description_en TEXT,
  video_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_sections ENABLE ROW LEVEL SECURITY;

-- Create public read policies (no authentication required)
CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to gallery"
  ON public.gallery FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to team"
  ON public.team FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to certificates"
  ON public.certificates FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to video_sections"
  ON public.video_sections FOR SELECT
  USING (true);

-- Insert initial products data
INSERT INTO public.products (product_name, product_name_en, product_description, product_description_en, product_specs, product_specs_en, price, product_image, category) VALUES
('מגען מוגבר 25A 2P', 'Enhanced Contactor 25A 2P', 'מגען מוגבר איכותי למתח נמוך', 'High-quality enhanced contactor for low voltage', '25A, 2 קטבים', '25A, 2 Poles', 274, '/placeholder.svg', 'מגענים'),
('ממסר צעד', 'Step Relay', 'ממסר צעד לתאורה', 'Step relay for lighting', 'ממסר צעד סטנדרטי', 'Standard step relay', 286, '/placeholder.svg', 'ממסרים'),
('אוטומט מדרגות', 'Staircase Timer', 'אוטומט מדרגות עם טיימר', 'Staircase timer with adjustable delay', 'טיימר מתכוונן', 'Adjustable timer', 318, '/placeholder.svg', 'אוטומטים'),
('שעון שבת מכני', 'Mechanical Sabbath Timer', 'שעון שבת מכני אמין', 'Reliable mechanical Sabbath timer', 'מכני, ללא חשמל', 'Mechanical, no electricity', 295, '/placeholder.svg', 'שעונים'),
('מגען עזר', 'Auxiliary Contactor', 'מגען עזר למערכות בקרה', 'Auxiliary contactor for control systems', 'מגע עזר נוסף', 'Additional auxiliary contact', 265, '/placeholder.svg', 'מגענים'),
('מגען מוגבר 32A 3P', 'Enhanced Contactor 32A 3P', 'מגען מוגבר 3 פאזי', '3-phase enhanced contactor', '32A, 3 קטבים', '32A, 3 Poles', 316, '/placeholder.svg', 'מגענים'),
('מגען מוגבר 25A 3P', 'Enhanced Contactor 25A 3P', 'מגען מוגבר 3 פאזי', '3-phase enhanced contactor', '25A, 3 קטבים', '25A, 3 Poles', 302, '/placeholder.svg', 'מגענים');

-- Insert initial gallery items (placeholders)
INSERT INTO public.gallery (image, title, title_en, description, description_en, category) VALUES
('/placeholder.svg', 'פרויקט תעשייה 1', 'Industrial Project 1', 'לוח חשמל מרכזי למפעל תעשייתי', 'Main electrical panel for industrial facility', 'פרויקטים'),
('/placeholder.svg', 'מפעל הייצור', 'Manufacturing Facility', 'מבט למפעל הייצור שלנו', 'View of our manufacturing facility', 'מפעל'),
('/placeholder.svg', 'צוות העבודה', 'Work Team', 'הצוות במהלך יום עבודה', 'Team during a work day', 'צוות'),
('/placeholder.svg', 'לוח בקרה מתקדם', 'Advanced Control Panel', 'מערכת בקרה מתקדמת לבניין מסחרי', 'Advanced control system for commercial building', 'מוצרים');

-- Insert initial team members
INSERT INTO public.team (name, role, role_en, description, description_en, photo, display_order) VALUES
('אסם עודה', 'מייסד ומנכ״ל', 'Founder & CEO', 'מהנדס חשמל עם למעלה מ-10 שנות ניסיון בתחום התכנון והייצור של לוחות חשמל', 'Electrical engineer with over 10 years of experience in planning and manufacturing electrical panels', '/placeholder.svg', 1);

-- Insert initial video section
INSERT INTO public.video_sections (video_title, video_title_en, video_description, video_description_en, video_url) VALUES
('הצצה למפעל ולתהליך הייצור', 'Inside Our Manufacturing Process', 'מהתכנון ועד הביצוע – כך נראית העבודה מאחורי הקלעים', 'From planning to execution – see the work behind the scenes', '/placeholder.svg');