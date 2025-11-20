-- Update hero video URL key to use dot notation
UPDATE site_content 
SET key = 'hero.video_url' 
WHERE key = 'hero_video_url' AND section = 'hero';