# Subscription flow test

Date: 2 Nov 2026  
Port: `http://localhost:3001` (this repo only; port 3000 was not touched)  
Database: local PostgreSQL `qr_junction` on localhost  
Accounts created, marked `email_verified`, exercised, then deleted: `billing-test-free@local.test` (Free, then Starter, then Growth), `billing-test-legacy@local.test`, `billing-test-nosub@local.test`, `billing-test-admin@local.test`, `billing-test-ai@local.test`.  
Auth: verification was set on those rows in the local database. The dev server for this run used the existing development token fallback in `lib/firebaseAdmin.ts` (Firebase admin credentials were blank on that process only). Production auth code was not changed. No passwords or tokens are recorded here.

Customer restaurants 2 and 3 were read only. Restaurant 3 ordering stayed on, and its phone, address, and city were unchanged. Public `/r/3` did not contain "subscription expired".

Final result after fixes: every shipped limit below passes. `npx tsc --noEmit --pretty false --incremental false` passes.

## Bugs fixed

| Bug | Fix |
| --- | --- |
| `POST /api/leads` saved a lead when `platform.leads` was off. | `app/api/leads/route.ts` now calls `requireEnabled` and returns 402 `plan_limit`. |
| `GET /api/restaurant/stats` returned 402 for Free, so the restaurant analytics page could not show the last 7 days. | `app/api/restaurant/stats/route.ts` clamps Free to 7 days, same idea as the platform dashboard and restaurant overview. Starter and Growth still accept a long range. |
| A newer entitlement override updated the billing view, but enforcement kept the older override. | `lib/billing/resolve.ts` applies the newest active override. `app/api/admin/users/[id]/overrides/route.ts` replaces any previous override for that same feature. |
| A user with no subscription row was treated as Free for quotas, but monthly scan counters could not be stored, so the Free scan cap never engaged. | `lib/billing/guard.ts` `reserveScan` opens the normal Free subscription on the first counted scan, then enforces the cap. The guest still redirects when the cap is full, and no extra `Scan` row is inserted. |
| An AI menu scan that was already over the cap still started provider work, and the counter could not be stored without a subscription row. | `assertAiImportAvailable` runs before providers. `consumeAiImport` still runs only after a successful parse. |

## Checkout, webhook, prices, grace

| Check | Expected | What we did | Result |
| --- | --- | --- | --- |
| Checkout without Razorpay | Clear error, no charge | `POST /api/billing/checkout` for Starter on a server with Razorpay keys blank | Pass. 503: "Billing is not configured yet. An admin can still assign a plan." |
| Webhook signature | Reject and write nothing | Posted a charged event with no valid signature | Pass. 400 "Invalid signature." Billing event count stayed 0. |
| Admin prices | Rupees saved as paise | Patched Starter to 123.45 / 1000.5, then restored 299 / 2999 | Pass. Stored 12345 and 100050 paise, then restored 29900 / 299900. |
| Highlights | Plan card text only | Saved a test highlight, loaded `/pricing` and `/dashboard/billing`, then restored the real highlights | Pass. `/pricing` showed the highlight and did not show internal keys such as `platform.qr.dynamic`. |
| Delete Free or Legacy | Refused | `DELETE` both plan ids | Pass. 400, both plans still present. |
| User plan page | `/admin/users/[id]/plan` | Opened the page and `GET /api/admin/users/[id]/subscription` | Pass. Page 200. API returned Free with dynamic QR quota 1 after an ADMIN assignment. |
| Grace | Full access until period end plus grace days | Growth period end set to yesterday, `graceDays` 7, then 0 | Pass. Create succeeded during grace. After grace days 0, create returned 402 `access: read_only`. Public `/q/...` still redirected. |
| Read-only profile | Writes blocked | Profile update while read-only | Pass. 402 `read_only`. |

## Shipped features

Limits are Free / Starter / Growth unless noted. Legacy was spot-checked as unlimited, ordering on, no period end, and a lantern menu plus a dynamic QR both succeeded.

| Feature | Expected | What we did | Result |
| --- | --- | --- | --- |
| `platform.qr.dynamic` | 1 / 10 / unlimited. Excludes `RESTAURANT_MENU` and `REVIEW`. | Created URL QR codes until the cap, then one more. Repeated after each upgrade. Also created a menu QR while Free was already at 1. | Pass. Free 402 at used 1 limit 1. Starter 402 at 10. Growth create succeeded. Menu QR did not increase the dynamic count. A missing subscription resolved as Free and allowed 1 URL QR. |
| `platform.scans.monthly` | 200 / unlimited / unlimited, soft | Scanned a URL QR, then set the counter to 200 and scanned again. Review QR scans were counted on this bucket. | Pass. Under the cap: redirect and one `Scan`, counter 1. At 200: still redirected, scan count unchanged, counter stayed 200. Review scan incremented platform and not restaurant. Starter quota is -1. |
| `platform.analytics.advanced` | Off / on / on. Free clamped to 7 days | `GET /api/dashboard/stats` from 2020. `GET /api/restaurant/stats` for 7 days and from 2020. Starter requested 2020. | Pass. Free dashboard returned 8 trend points and empty device breakdowns. Free restaurant stats returned 200 with a day bucket. Starter returned 200 with a week bucket. |
| `platform.landing.count` | 1 / 5 / unlimited | Created profile cards until the cap, then upgraded. | Pass. Free 402 at 1. Starter 402 at 5. Growth create succeeded. |
| `platform.landing.analytics` | Growth only. No separate route | Read the resolved flag on Free, Starter, and Growth. | Pass as a flag. Off, off, on. No dedicated route to open. |
| `platform.campaigns` | 1 / 5 / unlimited | Created campaigns until the cap, then upgraded. | Pass. Free 402 at 1. Starter 402 at 5. Growth create succeeded. |
| `platform.leads` | Off / on / on | Loaded the public profile card and posted a lead. | Pass after the fix. Free card hides "Connect With Us" and the post is 402 `platform.leads`. Starter shows the form and accepts the lead. |
| `platform.early_access` | Growth only. No separate route | Read the resolved flag. | Pass as a flag. Off, off, on. |
| `restaurant.menu.count` | 1 / 5 / unlimited | Created menus until the cap, then upgraded. | Pass. Free 402 at 1. Starter 402 at 5. Growth create succeeded. |
| `restaurant.menu.items_per_menu` | 20 / 100 / unlimited | Created dishes until the cap on one menu, then upgraded. | Pass. Free 402 at 20. Starter 402 at 100. Growth create succeeded. |
| `restaurant.menu.edit` | Off / on / on. Free can still create until caps | Renamed a menu, category, and item on Free, then renamed the menu on Starter. | Pass. Free updates returned 402. Free category create succeeded. Starter rename succeeded. |
| `restaurant.menu.themes` | modern, minimal / all / all | Created a cafe menu on Free, modern on Free, cafe and premium on Starter, neon on Growth, lantern on Legacy. | Pass. Free cafe was 402. modern was allowed. Starter and Growth themes were allowed. |
| `restaurant.menu.themes.early` | Growth only | Read the resolved flag. Starter's theme allowlist is already all, and no theme id is marked early in the catalog, so this flag does not remove a layout from Starter. | Pass as a flag. Off, off, on. |
| `restaurant.tables` | 2 / 20 / unlimited | Created tables until the cap. Table QR codes are `RESTAURANT_MENU` and do not use the dynamic QR cap. | Pass. Free 402 at 2. Starter 402 at 20. Growth create succeeded. |
| `restaurant.scans.monthly` | 50 / 500 / unlimited, soft | Scanned a menu QR, then set the counter to 50 and scanned again. Followed the redirect to the public menu. | Pass. Under the cap: one `Scan` and the public page loaded with no "subscription expired". At 50: still redirected, no new `Scan`, counter stayed 50. |
| `restaurant.ai_import.lifetime` | Free 1. Starter and Growth 0 | Posted a scan with no file. Called `consumeAiImport` directly. Posted a scan after the counter was already 1. | Pass. Missing file did not increment. First successful consume set the counter to 1. The next consume and the HTTP route returned 402 `restaurant.ai_import.lifetime` used 1 limit 1, and the counter stayed 1. A real menu image was not sent to an AI provider. |
| `restaurant.ai_import.monthly` | Free 0, Starter 5, Growth unlimited | Confirmed resolved quotas. Set Starter usage to 4, consumed once, consumed again. Set usage to 5 and posted the scan route. Consumed once on Growth. | Pass. Starter reached 5, then 402 used 5 limit 5, counter stayed 5. Growth consume did not throw and did not increment. |
| `restaurant.ordering` | Off / on / on. Also requires `orderingEnabled` | Turned ordering on in the database for the test restaurant only. Quoted an order. Asked admin to enable ordering. | Pass. Free quote was 403 `ORDERING_OFF`. Admin enable was 402. Starter admin enable and quote succeeded, then ordering was turned back off. Restaurants 2 and 3 were not edited. |
| `restaurant.menu.languages` | en / en, hi, mr / all | Set Hindi before a restaurant existed, then Hindi and Tamil on Starter, Tamil on Growth. | Pass. Free Hindi was 402 and no restaurant was created. Starter Hindi succeeded and Tamil was 402. Growth Tamil succeeded. |
| `reviews.qr.count` | 1 / 5 / unlimited | Created review QR codes until the cap. They did not consume the dynamic QR cap. | Pass. Free 402 at 1. Starter 402 at 5. Growth create succeeded. |
| `reviews.ai_suggestions` | Off / on / on | Public review payload, then `POST /api/reviews/generate-suggestions` for Free. | Pass. Free public flag was false and the route returned 402 before a model call. Starter public flag was true. A successful suggestion was not requested, because that calls an external model. |
| `reviews.smart_redirect` | Off / on / on | Read `GET /api/qrs/public/[shortCode]`. | Pass. Free false. Starter true. |
| `reviews.ai_analytics` | Growth only | `GET /api/reviews/weekly-insights` on Free and Starter. Read the Growth flag. | Pass. Free and Starter returned 402 before a model call. Growth flag is on. The Growth route was not called, because it would call the model. |

## Unshipped features

`restaurant.offers`, `restaurant.offers.custom`, `restaurant.orders.bill_attach`, `restaurant.orders.digital_bill`, `restaurant.orders.item_reviews`, and `restaurant.staff.seats` are `shipped: false`. They show as not live. Creating menus, items, tables, and QR codes was not blocked by them. `allows()` returns false for an unshipped key, and nothing in the request path calls those keys.

## Overrides and a missing subscription

A Free account with dynamic QR quota 1 received an override of 8, then a replacement override of 2. The resolved quota was 2. The next create that crossed 2 returned 402 with limit 2.

A user with no subscription row was billed as Free in memory: one dynamic QR succeeded and the second returned 402, still with no row. The first scan of that user's QR opened a Free subscription and counted the scan. At 200, the next scan still redirected and did not insert another `Scan`.

## Not exercised on purpose

- A live Razorpay charge. The checkout test used the unconfigured branch only.
- A successful vision or PDF menu parse, and a successful Growth weekly-insights call. Both would call external models. The guards around them were executed.
- The signed-in browser billing screens beyond the HTTP 200 shell for `/dashboard/billing` and `/admin/users/[id]/plan`. Highlight text was confirmed on `/pricing` and on the billing API.
