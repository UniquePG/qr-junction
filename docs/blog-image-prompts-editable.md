# Blog image prompts (editable QR code)

The post currently reuses `business-card-qr-hero.png` and `static-vs-dynamic-hero.png` so the page does not 404. Drop the files below into `public/assests/blogs/` and swap the paths in `data/blogPosts/editableQr.ts` when they are ready.

Do not add watermarks, extra brand logos, fake QR Junction UI chrome, trademarked competitor marks, or unreadable lorem text.

**Global rules**

- Photorealistic, natural light, India-relevant settings.
- QR patterns must look like real scannable codes (sharp modules, quiet zone, three finder squares).
- If UI text is visible, keep it short and in English: Destination, Save, URL, Scans.
- No celebrity faces, no readable personal phone numbers, no real UPI IDs.
- Colour grade: warm, slightly editorial, not neon cyberpunk.
- Export PNG, sRGB, unsharpened.

---

## `editable-qr-hero.png`

- **Size:** 1200 × 630 (1.91:1, Open Graph + hero)
- **Alt text:** Stack of visiting cards with a QR code and a note that the job title has changed
- **Prompt:** Photorealistic wide editorial photograph, 1200x630. A teak desk in a Hyderabad apartment, late afternoon window light. A stack of cream visiting cards; the top card shows a high-contrast black QR (about 2cm) with a quiet zone and the printed line “Scan to connect”. A yellow sticky note on the stack reads “old job title” in clean handwriting. Next to the stack, a new unprinted card and a red pen. No logos, no readable phone numbers, no fake OS. 50mm look, shallow depth of field.

---

## `editable-qr-change-link.png`

- **Size:** 1200 × 675 (16:9, in-article)
- **Alt text:** Same printed QR code next to a laptop where the destination URL is being changed
- **Prompt:** Photorealistic 16:9, 1200x675. Left: the same printed visiting-card QR, sharp modules. Right: a laptop screen showing a simple generic form with a field labelled “Destination” and a URL being edited from a LinkedIn path to a new one, plus a small button “Save”. English UI only, navy and white, not a clone of any famous SaaS. Indian stationery around the laptop. No watermarks, no brand logos.
