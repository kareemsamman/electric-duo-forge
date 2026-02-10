

## Make Header/Footer Logo Configurable from Admin

Currently the header and footer show a hardcoded text logo ("גלובל אלקטריק"). This plan adds the ability to upload a logo image from Admin Settings, which will replace the text in both header and footer.

### What Changes

**1. Admin Settings -- Add Logo Upload**
- Add a new "Logo" upload field in the SEO settings card (similar to the existing favicon upload)
- Save the URL to `site_content` with key `header.logo_url`
- Show a preview of the uploaded logo
- Also include `header.logo_url` in the query key list and save logic

**2. Header -- Show Logo Image**
- In `src/components/Header.tsx`, check if `content["header.logo_url"]` exists
- If it does, show an `<img>` tag with the uploaded logo instead of the text div
- If no logo is uploaded, fall back to the existing text (`content["header.logo"]` or "Global Electric")

**3. Footer -- Show Logo Image**
- In `src/components/Footer.tsx`, same logic: if `content["header.logo_url"]` exists, show the logo image; otherwise show the text
- Also use `content["header.logo"]` for the text fallback instead of the current hardcoded Hebrew/English strings

**4. Database**
- Insert a new row in `site_content` with key `header.logo_url`, section `seo`, so it's available immediately

### Technical Details

- **Migration**: `INSERT INTO site_content (key, value_he, value_en, section, description) VALUES ('header.logo_url', '', '', 'seo', 'Logo image URL for header and footer')`
- **AdminSettings.tsx**: Add `logo_url` to state, query, save logic, and a file upload UI identical to the favicon upload pattern
- **Header.tsx**: Conditionally render `<img src={content["header.logo_url"]} alt="Logo" className="h-10 object-contain" />` or the text fallback
- **Footer.tsx**: Same conditional rendering with appropriate sizing for the footer context
- Invalidate `seo-settings` query after save so changes apply immediately

