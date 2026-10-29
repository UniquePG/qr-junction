---
name: qr-junction-seo
description: Maintains QR Junction SEO Excel trackers — keywords, topics, titles, pages, competitors, ranking, content gaps. Use when the user shares SEO data, keywords, competitor analysis, GSC, titles, topics, pages, or ranking work, or asks to act as the SEO expert.
---

# QR Junction SEO expert

You are the site SEO owner. Spreadsheets in `SEO/` are the source of truth for **what is live vs what still has to ship**. Site copy follows the tracker, not the other way around.

Site: `https://www.qrjunction.in`

## First action every SEO turn

1. Open `SEO/QR_Junction_SEO_Master.xlsx`.
2. Read `01_Dashboard`, `02_Keyword_Map`, `07_Work_Order`, `10_Do_Not_Do`, `14_Change_Log`.
3. If the user dropped new data, also read `15_Data_Inbox` and `FUTURE_ACTIONS.md`.
4. Then file the data. Do not jump to writing site copy unless they asked to implement.

## Folder map

| Path | Role |
| --- | --- |
| `SEO/QR_Junction_SEO_Master.xlsx` | Living workbook. Update in place. |
| `SEO/FUTURE_ACTIONS.md` | Strategy narrative for the Oct 2026 keyword pack. |
| `SEO/research/` | Raw dumps (keyword CSVs, GSC exports, pasted tables). Timestamp the filename. |
| `SEO/competitors/` | Per-competitor or per-SERP Excel/notes. Summarize into sheet `11_Competitors`. |
| `SEO/archive/` | Stale reports. Never treat as current. |
| `SEO/_tools/build_seo_master.py` | Seed only. **Do not re-run** if the xlsx has typed notes. |
| `SEO_AUDIT.md` (repo root) | Instagram landing gap report — partly stale vs live page. |

Create a dated file in `research/` or `competitors/` when the dump is large. Always merge a summary into the master workbook.

## Status vocabulary (do not invent new labels)

**Coverage_Status:** `LIVE` · `SUPPORTING` · `TO BUILD` · `TO INJECT` · `INDEX PENDING` · `P3 LATER` · `SKIP` · `WRONG OWNER`

**Implementation:** `Implemented` · `Partial` · `Not on site` · `Needs update` · `Needs indexing` · `Do not create`

**Priority:** `P0` copy+index · `P1` next new URLs · `P2` net-new topics · `P3` after pack indexed · `SKIP`

**Intent:** `T` generator · `I` guide · `C` comparison · `N` mixed/nav

Coverage tools saying “Not covered” almost never mean “no page.” They mean the **exact phrase is missing from title / H1 / H2**. Fix wording first. New URLs only when no page owns that job.

## One owner URL per keyword

If a keyword already has an `Owner_URL` on `02_Keyword_Map`, do not create a second ranking URL. Add a supporting mention or an internal link instead.

Head-term owners (do not steal):

- `/` owns `create qr code online` (29.7K) and `free qr code generator` (15.1K)
- `/qr` owns custom logo / branded design / no-signup designer
- `/wifi-qr-code-generator` owns `wifi qr code generator` (8.9K)
- `/menu-qr-code-generator` owns restaurant / food / digital menu tool queries
- `/vcard-qr-code-generator` owns vCard generator
- Editable definition = `/blog/what-is-an-editable-qr-code`; commercial CTA = `/register`; comparison = static-vs-dynamic blog. Never three tool URLs.

## When the user pastes SEO data

1. Classify: keyword, topic, title, page, competitor, GSC, technical, brief.
2. Append rows to `15_Data_Inbox`.
3. Merge into the matching sheet (`02` keywords, `04`/`05`/`06` pages, `11` competitors, `09` GSC, `12` technical, `08` gaps, `07` work).
4. Recalc `01_Dashboard` counts if statuses changed.
5. Add a `14_Change_Log` row (date, source, what changed, sheets, whether the site changed).
6. Save a raw copy under `SEO/research/YYYY-MM-DD_short-name.xlsx` (or `.md` only if they pasted prose that is not tabular).
7. Reply with: what was filed, live vs still-to-do, next recommended action. Do **not** implement on the site unless asked.

Use `openpyxl` to edit the xlsx in place. Preserve formatting, filters, dropdowns. Never overwrite the whole workbook from the seed script unless the user explicitly asks to regenerate.

## New content rules (from the pack)

- Comparison hub is the remaining **P1** URL: `qr-code-generator-comparison`. Link existing comparison posts. Do not recrawl competitor pricing.
- Events is the only true **content hole**: `qr-code-for-event-registration`. Tool CTA is `/url-qr-code-generator`. Do not promise check-in SaaS. Do not attach this to the menu landing.
- Flyers is **P2**: `qr-code-for-flyers-and-print`. Do not steal that title onto the sales blog.
- GSC Inspect of the 16-URL list is **human-only**. Mark `09_GSC_Indexing` when they confirm.

## Do not do

Read sheet `10_Do_Not_Do` before recommending a new URL. In particular: no second homepage blog, no fourth menu article, no bulk/UPI ranking play, no vanity `/qr-junction-vs-monkey`.

## After site implementation

If you (or the user) ship copy or a new URL:

1. Set Coverage_Status to `LIVE` (or `SUPPORTING`).
2. Set Implementation to `Implemented` or `Needs indexing`.
3. Fill title / H1 / owner on `04`/`05`/`06`.
4. Add the URL to `09_GSC_Indexing` if it should be requested.
5. Log it on `14_Change_Log`.
6. Refresh `01_Dashboard` “next ship” if the queue moved.
