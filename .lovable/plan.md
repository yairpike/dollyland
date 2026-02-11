

## Add Oracle and Upawoo to the Product Ecosystem

### What we're doing
Adding two new products to the homepage bento grid:
1. **Oracle** - at the top of the ecosystem as a large/featured product
2. **Upawoo** - also added to the ecosystem

### Product Details

**Oracle**
- Name: Oracle
- Tagline: "Your Cosmic Identity, All in One Place"
- Description: "Discover your cosmic identity through Western astrology, Chinese BaZi, Burmese traditions, AI palmistry, and daily destiny readings -- all in one mystical experience."
- URL: https://oracle.dollyland.ai
- Platforms: Web, iOS, Android
- Gradient: Deep navy/gold/amber tones (matching the logo's color scheme)
- Size: large (flagship positioning at top)
- Logo: Uploaded Oracle_logo.png

**Upawoo**
- Name: Upawoo
- Tagline: "Your Burmese AI Assistant"
- Description: "A Burmese-language AI chatbot that helps you explore everything about Myanmar. Ask anything, get answers in Burmese."
- URL: https://upawoo.web.app
- Platforms: Web
- Gradient: Warm tones matching Upawoo branding
- Size: medium
- Logo: Fetched from https://upawoo.web.app/logo.png (saved to src/assets/logos/)

### Technical Changes

**File: src/pages/Index.tsx**
1. Copy `user-uploads://Oracle_logo.png` to `src/assets/logos/oracle-logo.png`
2. Download/copy Upawoo logo to `src/assets/logos/upawoo-logo.png`
3. Add import statements for both logos
4. Insert Oracle as `id: 12` at the start of the `bentoProducts` array (after the featured design system) with `size: "large"`
5. Insert Upawoo as `id: 13` in the products array with `size: "medium"`
6. Update the "Products Launched" metric from 10 to 12

### Build Fix
There's a TypeScript error about `@supabase/supabase-js` missing. This will also be resolved by ensuring the dependency exists or the import is handled.

