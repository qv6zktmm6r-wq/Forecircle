# ForeCircle Brand Kit - Refined Original

Version 1.0 | November 7, 2026

Primary tagline: **Meet. Play. Compete.**
Secondary message: **Find your people. Play more golf.**
Primary domain: ForeCircleGolf.com
App domain: ForeCircle.app

## Contents

- ForeCircle_Brand_Guide.pdf: seven-page guide covering identity, exact palette, typography, product styling and applications.
- ForeCircle_Logo_Transparent.png: horizontal logo with tagline, 2172 x 724 pixels with transparent alpha. Raster artwork; not a vector file.
- ForeCircle_Brand_Applications.png: visual direction for the app, apparel, membership card and photography. Concept mockups, not screenshots of a built product.
- ForeCircle_Palette.csv: six core colors and RGB values.
- ForeCircle_Tokens.json: exact colors, semantic roles, typography and spacing.
- ForeCircle_Tokens.css: drop-in CSS variables, font declarations and sample button styles.
- fonts/: Manrope and Inter variable fonts, with their license notices. Keep notices with redistributed fonts.

## Core palette

| Name | Hex | Use |
| --- | --- | --- |
| Forest | #003D29 | Identity, navigation, primary button backgrounds |
| Fairway | #65B800 | Flag, selected accents, highlights |
| Ivory | #FFF8EE | Main canvas, stationery |
| Sage | #E8F0E8 | Quiet panels and alternate sections |
| Sand | #D7CBB8 | Warm editorial accents |
| Charcoal | #182C24 | Body text and text on bright green |

These token values are the source of truth. Generated raster previews can contain slight color variation and should not be sampled for implementation colors.

## Type

Use Manrope 700-800 for headlines and Inter 400-500 for body text; use Inter 600-700 for labels and controls. Manrope is a supporting font, not an exact re-creation of the illustrated logo lettering. Use the provided logo artwork for the wordmark.

## Contrast and interface rules

- Forest on Ivory: 11.72:1.
- Ivory on Forest: 11.72:1.
- Charcoal on Fairway: 5.90:1.
- Muted text (#53665B) on Ivory: 5.82:1.
- White on Fairway: 2.50:1; use Charcoal instead. The art-direction board is a visual concept; apply the exact digital rules when building.
- Contrast values calculated from the exact sRGB tokens. These pairs exceed WCAG AA's 4.5:1 text threshold; this is not a full product accessibility audit.
- Use visible focus indicators, 48 px interaction targets and explicit text/icon labels for statuses.

## Production notes

The package supplies a raster horizontal lockup and visual system. It does not supply a finalized vector master, isolated emblem exports, stitch files, or print-color separations. Create those from the selected geometry before large-format printing, embroidery, or final app-store icon delivery. Test logo legibility and verify embroidery with a physical sample.

For professional print, ask the printer to convert the sRGB palette using the intended paper/ink profile and approve a proof. No unverified Pantone or universal CMYK match is claimed.

## Sources

- Manrope: https://github.com/googlefonts/manrope
- Included Manrope font: https://github.com/google/fonts/tree/main/ofl/manrope
- Inter: https://rsms.me/inter/ and https://github.com/rsms/inter
- WCAG text contrast: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

The logo and application artwork are generated raster concept assets. The exact palette, token files and guide layout are authored separately for consistent implementation.
