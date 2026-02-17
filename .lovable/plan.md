
## Add Vibe to the Product Ecosystem

### What we're doing
Adding **Vibe** -- an AI-powered marketing automation platform -- as a new product card on the homepage bento grid.

### Product Details

- **Name:** Vibe
- **Tagline:** "Your Marketing at Scale"
- **Description:** "AI-powered marketing automation that creates, optimizes, and scales your campaigns effortlessly."
- **URL:** https://vibe.dollyland.ai
- **Platforms:** Web
- **Gradient:** Vibrant teal/cyan tones (matching the Vibe brand aesthetic)
- **Size:** medium
- **Logo:** Downloaded from https://vibe.dollyland.ai/assets/vibe-whitetext-CiEOYbjH.png

### Technical Changes

**1. Save the logo**
- Download the Vibe logo to `src/assets/logos/vibe-logo.png`

**2. Update `src/pages/Index.tsx`**
- Add `import vibeLogo from "@/assets/logos/vibe-logo.png";`
- Insert a new product entry (id: 14) into the products array:
  - `logoImage: vibeLogo`
  - `gradient: "from-teal-500 via-cyan-500 to-blue-600"`
  - `size: "medium"`
  - `compatibility: ["Web"]`
- Update the "Products Launched" metric from **12** to **13**
