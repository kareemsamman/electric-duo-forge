-- Add hero background type and image URLs to site_content
INSERT INTO site_content (section, key, value_he, value_en, description)
VALUES 
  ('hero', 'hero.background_type', 'video', 'video', 'Background type: video or image'),
  ('hero', 'hero.image_desktop_url', '', '', 'Desktop background image URL'),
  ('hero', 'hero.image_mobile_url', '', '', 'Mobile background image URL')
ON CONFLICT (key) DO NOTHING;