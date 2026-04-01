UPDATE site_content SET value_en = 'image' WHERE key = 'hero.background_type';
UPDATE site_content SET value_en = value_he WHERE key IN ('hero.image_desktop_url', 'hero.image_mobile_url');