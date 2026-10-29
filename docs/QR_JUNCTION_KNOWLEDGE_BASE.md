# QR Junction — Application Knowledge Base

**Reviewed:** 29 October 2026  
**Product:** QR Junction  
**Website:** [qrjunction.in](https://www.qrjunction.in/)  
**Repository:** `UniquePG/qr-junction`

This document is a source-of-truth orientation guide for AI assistants and people working on QR Junction. It summarizes the application architecture, implemented product surfaces, SEO work, and possible next steps based on repository inspection. It is not a substitute for checking current source code, production behavior, or live analytics before making implementation or business decisions.

## 1. Product summary

QR Junction is a QR-code generation and business engagement application. Its public product lets visitors create QR codes for common online and offline actions. Its account-based product adds dynamic QR links, scan analytics, dashboards, campaigns, lead capture, hosted landing pages, review flows, and a restaurant menu suite.

The product direction is to evolve from a free QR-code maker into a platform that helps businesses connect printed materials to online actions and measure the resulting engagement. Product vision and proposed phases are described in [saas_roadmap.md](../saas_roadmap.md) and [FEATURES.md](../FEATURES.md). Those documents are planning material; a roadmap item or database model alone does not establish that a feature is complete.

## 2. Application features

### Public QR generators and QR design

The public generator is available from the homepage and the QR designer. Generator landing pages are built from shared content and page templates. The codebase includes QR generator content for URLs/websites, Wi-Fi, contacts/vCards, social networks, WhatsApp, PDFs, menus, images, video, app downloads, email, YouTube, text, and other use cases. Check the generator's actual UI and route handler before claiming any individual type has every dynamic behavior.

QR generation and design are implemented across:

- [app/page.tsx](../app/page.tsx) — homepage and primary generator entry point.
- [app/qr/](../app/qr/) — QR designer experience.
- [app/[type]-qr-code-generator/page.tsx](../app/%5Btype%5D-qr-code-generator/page.tsx) — type-based SEO landing route.
- [app/[slug]/page.tsx](../app/%5Bslug%5D/page.tsx) — slug-based QR generator landing route.
- [components/QRGenerator.tsx](../components/QRGenerator.tsx) — shared generator UI.
- [components/qr/](../components/qr/) — QR preview, design controls, landing-page builder, and generator SEO template.
- [lib/qrEngine.ts](../lib/qrEngine.ts) — QR type definitions, payload formatting, and form validation.
- [lib/qrLandingContent.ts](../lib/qrLandingContent.ts) and [lib/qrLanding/](../lib/qrLanding/) — generator page content.

The project includes QR rendering libraries for generated code images, styling, and React integration. The UI offers design customization, and the SEO/product copy describes PNG and SVG downloads. Confirm the current UI/export controls before promising a particular format on a specific generator.

### Static and dynamic QR codes

- **Static QR:** its payload is encoded directly into the QR pattern. It does not depend on QR Junction's redirect service after it is generated, and changing its destination requires a new QR code.
- **Dynamic QR:** points to a QR Junction short URL such as `/q/{shortCode}`. The dashboard can change the stored destination while the printed QR remains unchanged.

The dynamic short-code route is [app/q/[shortCode]/route.ts](../app/q/%5BshortCode%5D/route.ts). It looks up the QR record, checks status, records scan attributes, and dispatches to a destination or response according to the QR type. The database QR enum and route logic are the best references for supported dynamic behavior. The `PDF` enum exists, for example, but should not automatically be assumed to have a dedicated dynamic redirect branch.

### QR scan analytics

The `Scan` model stores QR association, visitor ID, device type, browser, operating system, user agent, IP address, geo fields, referrer, UTM values, and timestamp. The redirect route uses a visitor cookie for uniqueness and increments QR-level scan counters.

The dashboard summary API and UI are:

- [app/api/dashboard/stats/route.ts](../app/api/dashboard/stats/route.ts)
- [app/dashboard/page.tsx](../app/dashboard/page.tsx)
- [components/DashboardStatsCards.tsx](../components/DashboardStatsCards.tsx)
- [components/DashboardCharts.tsx](../components/DashboardCharts.tsx)
- [components/DashboardLocationsChart.tsx](../components/DashboardLocationsChart.tsx)
- [components/DashboardMap.tsx](../components/DashboardMap.tsx)
- [lib/geo.ts](../lib/geo.ts)

The dashboard presents totals, trends, device/browser/OS breakdowns, locations, and other available aggregates. Geolocation first checks Vercel headers, has local-development behavior, and then attempts an IP geolocation service fallback. Exact accuracy and availability depend on deployment headers and the external service.

### Account, dashboard, campaigns, and leads

Authentication uses Firebase Authentication in the browser and Firebase Admin token verification on the server. An authenticated Firebase user is synchronized to a PostgreSQL `User` record. Email verification and password-reset flows are also present.

Relevant files:

- [components/AuthContext.tsx](../components/AuthContext.tsx)
- [lib/firebase.ts](../lib/firebase.ts)
- [lib/firebaseAdmin.ts](../lib/firebaseAdmin.ts)
- [lib/authHelper.ts](../lib/authHelper.ts)
- [app/api/auth/](../app/api/auth/)
- [app/dashboard/](../app/dashboard/)

The dashboard includes overview, profile, campaign, landing-page, review, QR-code, lead, and restaurant navigation. QR codes can be associated with campaigns; leads support status, notes, custom fields, and optional QR/campaign attribution. Database models are in [prisma/schema.prisma](../prisma/schema.prisma).

Campaign and lead code surfaces include [app/api/campaigns/](../app/api/campaigns/), [app/api/leads/](../app/api/leads/), [app/dashboard/campaigns/](../app/dashboard/campaigns/), and [app/dashboard/leads/](../app/dashboard/leads/).

### Hosted landing pages

Users can create hosted pages with profile information, social links, and buttons. Public pages use `/p/{slug}` and can be destinations for dynamic QR codes. The builder, public page renderer, and API routes are in:

- [components/qr/LandingPageBuilder.tsx](../components/qr/LandingPageBuilder.tsx)
- [components/qr/PublicLandingPageClient.tsx](../components/qr/PublicLandingPageClient.tsx)
- [app/p/[slug]/page.tsx](../app/p/%5Bslug%5D/page.tsx)
- [app/api/landing-pages/](../app/api/landing-pages/)
- [app/dashboard/pages/](../app/dashboard/pages/)

### Review QR workflows

Review QR codes have a public rating and feedback flow under `/q/{shortCode}/review`. It supports business categories, rating-specific tags, feedback, and optional AI-generated review text suggestions. Review data includes ratings, feedback, optional contact details, and AI analysis fields.

Relevant surfaces include [app/q/[shortCode]/review/page.tsx](../app/q/%5BshortCode%5D/review/page.tsx), [app/api/reviews/](../app/api/reviews/), and [app/dashboard/reviews/](../app/dashboard/reviews/).

Review flows should be designed to request honest feedback without selectively routing only satisfied customers to public review sites. Review suggestion text should remain optional, editable, and representative of the customer's own experience.

### Restaurant digital menu suite

The restaurant suite provides:

- Restaurant profile information, branding, currency, and tax settings.
- Multiple menus, categories, and menu items.
- Item descriptions, prices, price variants, images, availability, dietary flags, and popularity.
- Several menu presentation themes.
- Restaurant tables that can be associated with a menu and QR code.
- Public mobile menu pages at `/r/{restaurantId}` and `/r/{restaurantId}/{menuId}`.
- Restaurant analytics and table QR management.

Source areas:

- [app/dashboard/restaurant/](../app/dashboard/restaurant/)
- [app/r/](../app/r/)
- [app/api/restaurant/](../app/api/restaurant/)
- [components/menu/](../components/menu/)
- [prisma/schema.prisma](../prisma/schema.prisma)

The AI menu scanner accepts an uploaded image or PDF. It extracts PDF text when possible or submits image content to a vision-capable AI provider, then presents parsed categories and items for user review before import. Import supports append and overwrite modes. Relevant files include [app/dashboard/restaurant/scanner/page.tsx](../app/dashboard/restaurant/scanner/page.tsx), [app/api/restaurant/scan-menu/route.ts](../app/api/restaurant/scan-menu/route.ts), and [app/api/restaurant/import-menu/route.ts](../app/api/restaurant/import-menu/route.ts).

The restaurant item-image generation endpoint is [app/api/restaurant/items/generate-image/route.ts](../app/api/restaurant/items/generate-image/route.ts).

### Administration and guest usage

Admin pages and APIs cover users, QR codes, scans, campaigns, leads, reviews, restaurants, and guest generator events. The admin UI is under [app/admin/](../app/admin/), with corresponding endpoints under [app/api/admin/](../app/api/admin/). Admin setup notes are in [ADMIN.md](../ADMIN.md); host rewriting is configured in [proxy.ts](../proxy.ts).

Anonymous generator activity is recorded through [app/api/public/qr-events/route.ts](../app/api/public/qr-events/route.ts) and the `GuestQrEvent` model. This records generation/download events, not the same thing as scan analytics for a dynamic QR.

## 3. Main user workflows

### Anonymous visitor creates a static QR

1. Visit `/` or `/qr`.
2. Select a QR type and provide its data.
3. Optionally customize the QR design.
4. Generate and download the result.
5. Test it with a phone camera before printing.

Static codes encode their payload directly and do not provide QR Junction redirect-based destination editing or scan analytics.

### Account user creates and tracks a dynamic QR

1. Register or sign in using the Firebase-backed authentication flow.
2. The browser obtains a Firebase ID token; the backend verifies it and syncs the account into PostgreSQL.
3. Create a QR code from the dashboard, entering a name, type, destination, and optional campaign/design/UTM values.
4. Print the QR Junction short link.
5. When scanned, `/q/{shortCode}` records the scan and redirects or serves the configured experience.
6. Edit the destination or inspect the available analytics in the dashboard.

### Restaurant creates and publishes a menu

1. Set up a restaurant profile.
2. Create a menu and categories.
3. Add items manually or upload a menu image/PDF for AI-assisted extraction.
4. Review and correct extracted menu data.
5. Import the verified data into a menu.
6. Configure table numbers and menu-linked QR codes.
7. Customers scan a table or general QR and view the public menu on a phone.

## 4. Technology stack and integrations

| Area | Technologies found in the repository |
|---|---|
| Web application | Next.js 16 App Router, React 19, TypeScript |
| Styling/UI | Tailwind CSS 4, Lucide icons, custom React components |
| Database | PostgreSQL |
| ORM/schema | Prisma |
| Authentication | Firebase Authentication and Firebase Admin |
| QR generation | `qrcode`, `qrcode.react`, `qr-code-styling` |
| File/image storage | Cloudinary upload endpoints; Firebase Storage helper |
| AI text and vision | Provider adapters include OpenAI, Sarvam, Groq, OpenRouter, and NVIDIA |
| AI image generation | Image-provider adapters include OpenAI, Hugging Face, and Pollinations |
| PDF processing | `pdf-parse` |
| Charts and maps | Recharts, Leaflet, MapLibre integrations |
| Email | Nodemailer with SMTP configuration |
| Product analytics | Google Analytics 4 event helper and Vercel Analytics |
| Hosting-specific integration | Vercel analytics and geo headers are used where available |

Dependency versions and scripts are listed in [package.json](../package.json). AI provider routing/configuration is in [lib/ai/](../lib/ai/), and database models are in [prisma/schema.prisma](../prisma/schema.prisma).

Environment variables are consumed in code for Firebase client/admin configuration, `DATABASE_URL`, Cloudinary, SMTP, AI provider credentials, and admin/host configuration. Use the actual deployment environment or a local example file to determine required values. Never place secrets in this document or commit them to source control.

## 5. Code organization and implementation strategy

- **`app/`** — Next.js pages, layouts, metadata, API route handlers, and public destinations.
- **`components/`** — reusable UI for QR generation, dashboards, restaurant menus, admin, blog, FAQ, and contact.
- **`lib/`** — shared application logic: Firebase, auth, Prisma, QR SEO/content, analytics, AI routing, email, geolocation, and helpers.
- **`prisma/`** — schema, migrations, and database model definitions.
- **`data/`** — FAQ and blog content.
- **`config/`** — QR frames and presets.
- **`public/`** — static assets and `llms.txt`.
- **`SEO/` and root SEO documents** — keyword planning, competitor research, SEO audits, and action tracking.
- **`docs/`** — setup notes, ERD, content image prompts, and this knowledge base.
- **`scripts/`** — operational scripts, including admin account creation.

The app generally follows the Next.js App Router approach: page/layout components render routes, API route handlers perform server-side operations, shared helpers encapsulate common work, and Prisma connects server logic to PostgreSQL. Reuse existing helpers and types when extending behavior. Check authorization and ownership at the API boundary, keep public routes separate from account-protected routes, and use migrations for schema changes.

Package scripts include `dev`, `build`, `start`, `lint`, and `admin:create`. No test files matching common `*.test.*` or `*.spec.*` patterns and no package test script were found during this review; check again before adding validation tooling.

## 6. SEO strategy implemented

### Technical SEO

- Root metadata sets the site name, title, description, canonical homepage, Open Graph/Twitter metadata, and robots directives in [app/layout.tsx](../app/layout.tsx).
- Dynamic `robots.txt` and `sitemap.xml` are implemented in [app/robots.ts](../app/robots.ts) and [app/sitemap.ts](../app/sitemap.ts).
- The sitemap includes key public pages, blog posts, and QR generator pages. User-generated pages and restaurant menus are not added there by the inspected sitemap.
- QR generator pages receive per-page titles, descriptions, keywords, canonical URLs, Open Graph/Twitter values, and JSON-LD through [components/qr/GeneratorSeoPage.tsx](../components/qr/GeneratorSeoPage.tsx) and [lib/qrLandingContent.ts](../lib/qrLandingContent.ts).
- Blog pages generate canonical and social metadata plus structured data in [app/blog/[slug]/page.tsx](../app/blog/%5Bslug%5D/page.tsx).
- Schema types found in the inspected source include `Organization`, `WebApplication`, `SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`, and `BlogPosting`.
- [public/llms.txt](../public/llms.txt) explains the product and important distinctions between static and dynamic QR codes for AI/search assistants.
- Public copy includes India-focused metadata and examples, including `en_IN` metadata in selected pages.
- The sitemap currently assigns some `lastModified` values using `new Date()` at generation time. Treat that as a crawl hint, not a reliable content-change timestamp.

### On-page and content strategy

The strategy is tool-plus-guide: match a high-intent generator page to the relevant search phrase, then support it with how-to guides, comparison articles, FAQs, and related internal links.

The home SEO copy is maintained in [lib/homeSeo.ts](../lib/homeSeo.ts). Generator page content is kept in [lib/qrLandingContent.ts](../lib/qrLandingContent.ts) and [lib/qrLanding/](../lib/qrLanding/). Blog metadata and posts are organized in [data/blogsData.ts](../data/blogsData.ts) and [data/blogPosts/](../data/blogPosts/).

The keyword plan in [SEO/FUTURE_ACTIONS.md](../SEO/FUTURE_ACTIONS.md) assigns query groups to specific URLs to reduce keyword cannibalization. Examples:

| Search intent / keyword theme | Intended owner page |
|---|---|
| “create qr code online”, “free qr code generator” | Homepage |
| QR design, custom logo, branded QR | `/qr` |
| Wi-Fi QR generator | `/wifi-qr-code-generator` |
| Restaurant menu QR | `/menu-qr-code-generator`, supported by menu guides |
| Dynamic vs static QR | Static-vs-dynamic blog post |
| Editable QR code | Editable QR explainer blog post |
| QR scan tracking and analytics | Scan tracking blog post |
| vCard generator | `/vcard-qr-code-generator` |
| Best free QR-code generator | Comparison blog post |
| Event registration / printable event QR | Planned new content in the SEO action list |
| QR codes for flyers and print | Planned supporting blog content |

The tracker reports keyword-volume estimates such as 29.7K for “create qr code online,” 15.1K for “free qr code generator,” and 8.9K for “wifi qr code generator.” These are values recorded by project research, not verified current rankings or guaranteed search demand.

### SEO and product analytics instrumentation

- Google Analytics 4 is configured in [app/layout.tsx](../app/layout.tsx) with measurement ID `G-HK32BH5KGT`.
- Event helpers in [lib/analytics.ts](../lib/analytics.ts) include QR generation/download, tab switching, contact submission, FAQ expansion, external link, button, and error events.
- [hooks/usePageView.ts](../hooks/usePageView.ts) tracks page views where mounted.
- Vercel Analytics is mounted in the root layout.
- Search Console access and live ranking data are not available from source code. The SEO tracker explicitly says the maintainer must use Search Console to inspect URLs and measure performance.

## 7. SEO status and caveats

The repository does not establish live Google ranking positions, indexed status, impressions, or clicks. Search-volume estimates and prepared indexing lists are not evidence that pages are indexed or ranking. Use Google Search Console or a rank-tracking product for current query/page performance.

The repository contains SEO documents from different dates and stages:

- [SEO_AUDIT.md](../SEO_AUDIT.md) and [seo-report.html](../seo-report.html) focus on the Instagram QR landing page. The HTML report is dated June 2026.
- The older audit reports missing generator canonical and schema work, while current generator source includes canonical metadata and page-level FAQ/HowTo/breadcrumb data. Prefer current source for implementation status and reconcile old audits before treating their gap lists as current.
- [SEO/FUTURE_ACTIONS.md](../SEO/FUTURE_ACTIONS.md) is the strategy/action tracker. It reports many keyword content updates as done while leaving some future work unchecked.
- [SEO/QR_Junction_SEO_Master.xlsx](../SEO/QR_Junction_SEO_Master.xlsx) is described by that tracker as the living SEO source of truth; its workbook data should be reviewed separately when analyzing current keyword status.

**Search Console verification note:** `verification.google` in [app/layout.tsx](../app/layout.tsx) is set to `G-HK32BH5KGT`, which is also the GA4 measurement ID. Verify that this is genuinely the intended Search Console verification token; do not assume the field is correctly configured from its name alone.

**Schema note:** structured data must match visible page content and should be validated. Schema is not a guarantee of search rich results or rankings.

## 8. Monetization status and strategy

The inspected application source and `package.json` show no payment gateway, subscription model, billing pages, plan enforcement, or subscription database model. QR Junction currently has no implemented paid subscription system. Mentions of payment links in QR content refer to destinations users can encode, not QR Junction billing.

Suggested future model (proposal, not implemented):

1. **Free:** static QR creation and basic design/download.
2. **Pro:** dynamic QR allowance, destination editing, scan history/analytics, campaign organization, and exports.
3. **Business:** higher limits, restaurant/review/lead workflows, multiple locations, teams, and richer reports.
4. **Agency/Enterprise:** client workspaces, bulk generation, white-label branding, custom domains, API access, and support commitments.

Keep the free static generator as an acquisition path and monetize the ongoing business value: editing, analytics, collaboration, and business workflows. Before setting prices, validate willingness to pay with target businesses and estimate infrastructure costs such as database writes, AI requests, email, storage, and geolocation.

For an India-first launch, evaluate Razorpay; consider Stripe if international expansion is a priority. Either implementation needs more than a checkout page: subscription state, signed webhook handling, retries/idempotency, billing history, cancellations, entitlements, plan limits, and tests for each access boundary.

## 9. Product opportunities and improvement ideas

Prioritize improvements that build on existing QR and business workflows:

- **India-first business workflows:** restaurant tables, local business examples, WhatsApp flows, multiple Indian languages, and practical print guidance.
- **Scan reliability:** add a print-readiness checker for contrast, quiet zone, logo coverage, size, and phone-camera testing.
- **Outcome measurement:** improve campaign attribution, conversion setup, lead-quality reporting, and straightforward ROI exports.
- **Restaurant differentiation:** multi-location management, menu translations, allergen and dietary filters, menu change history, item availability workflows, table-level performance, and simple reprint/replacement handling.
- **AI-assisted operations:** confidence indicators and correction loops for menu extraction, multilingual menu translation, and transparent summaries of scan trends.
- **Trust and privacy:** clarify what is collected, why it is collected, retention/deletion options, and which QR types work without QR Junction servers.
- **Operational reliability:** monitor redirect latency and errors, test QR destinations on mobile, and add tests for scan attribution and QR ownership.
- **Content advantage:** publish genuinely useful, tested guides, original print assets, comparison tables, and case studies rather than adding repetitive keyword pages.

## 10. Recommended next actions

1. Export Search Console query/page data and create a baseline for impressions, clicks, CTR, average position, and indexing.
2. Reconcile current source with old Instagram SEO audit recommendations.
3. Verify Search Console site ownership metadata.
4. Define which public user-generated pages and restaurant menus should be indexable; add canonical/robots behavior intentionally.
5. Audit scan data privacy, retention, access, and disclosures.
6. Review review-QR UX for fair, non-selective public review requests.
7. Design billing entitlements and limits before connecting a payment processor.
8. Add automated coverage for dynamic redirects, QR status behavior, ownership/authorization, scan tracking, AI menu parsing boundaries, and menu import.
9. Keep documentation and SEO tracker statuses synchronized with what is actually deployed.

## 11. Source map

| Concern | Primary source paths |
|---|---|
| Homepage and public site | [app/page.tsx](../app/page.tsx), [app/layout.tsx](../app/layout.tsx), [components/](../components/) |
| QR designer | [app/qr/](../app/qr/), [components/qr/](../components/qr/) |
| Generator SEO pages | [app/[type]-qr-code-generator/](../app/%5Btype%5D-qr-code-generator/), [components/qr/GeneratorSeoPage.tsx](../components/qr/GeneratorSeoPage.tsx), [lib/qrLandingContent.ts](../lib/qrLandingContent.ts) |
| Dynamic QR redirect | [app/q/[shortCode]/route.ts](../app/q/%5BshortCode%5D/route.ts) |
| QR and scan API | [app/api/qrs/](../app/api/qrs/), [app/api/dashboard/stats/](../app/api/dashboard/stats/) |
| Authentication | [components/AuthContext.tsx](../components/AuthContext.tsx), [lib/authHelper.ts](../lib/authHelper.ts), [app/api/auth/](../app/api/auth/) |
| Database | [prisma/schema.prisma](../prisma/schema.prisma), [prisma/migrations/](../prisma/migrations/) |
| Dashboard | [app/dashboard/](../app/dashboard/), [components/DashboardCharts.tsx](../components/DashboardCharts.tsx) |
| Restaurant suite | [app/dashboard/restaurant/](../app/dashboard/restaurant/), [app/r/](../app/r/), [app/api/restaurant/](../app/api/restaurant/), [components/menu/](../components/menu/) |
| AI integrations | [lib/ai/](../lib/ai/), [app/api/restaurant/scan-menu/route.ts](../app/api/restaurant/scan-menu/route.ts) |
| Blog | [app/blog/](../app/blog/), [data/blogsData.ts](../data/blogsData.ts), [data/blogPosts/](../data/blogPosts/) |
| SEO technical routes and content | [app/robots.ts](../app/robots.ts), [app/sitemap.ts](../app/sitemap.ts), [lib/homeSeo.ts](../lib/homeSeo.ts), [public/llms.txt](../public/llms.txt) |
| SEO strategy and research | [SEO/FUTURE_ACTIONS.md](../SEO/FUTURE_ACTIONS.md), [SEO_AUDIT.md](../SEO_AUDIT.md), [SEO/QR_Junction_SEO_Master.xlsx](../SEO/QR_Junction_SEO_Master.xlsx) |
| Admin | [ADMIN.md](../ADMIN.md), [app/admin/](../app/admin/), [app/api/admin/](../app/api/admin/), [proxy.ts](../proxy.ts) |
| Product planning | [FEATURES.md](../FEATURES.md), [saas_roadmap.md](../saas_roadmap.md), [Restaurant Qr suite.md](../Restaurant%20Qr%20suite.md) |
| Setup/supporting docs | [docs/](./) |
