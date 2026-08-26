# Navigation split checklist

- [x] Define dedicated routes for Dashboard, Trends Explorer, Address Generator, Places Explorer, and PDF & Book Finder.
- [x] Extract a shared dashboard shell with persistent sidebar, country selector, theme toggle, and mobile navigation.
- [x] Render only the active interface on each route while preserving country context and localStorage preferences.
- [x] Update sidebar links and active states to use real URLs and browser navigation.
- [x] Verify every route, external action, and responsive layout before saving a new checkpoint.

## Import, export, and large result sets

- [x] Add frontend parsing for CSV, JSON, and XLSX uploads.
- [x] Add a shared imported-results workspace with search, filter, copy, clear, randomize, and export actions.
- [x] Add 1,000, 2,000, 5,000, and 10,000 result options to every generator.
- [x] Keep large result rendering responsive with bounded preview and explicit row counts.
- [x] Validate import/export formats, generator performance, and the responsive UI before checkpointing.

## Copy-all refinement

- [x] Define a shared copy-all format for generated and imported result collections.
- [x] Remove all Google Search row actions while preserving Google Maps and Trends validation where appropriate.
- [x] Add Copy all results controls to every generator and the imported-results workspace.
- [x] Ensure copy-all uses the complete dataset, not only the bounded visual preview.
- [x] Rebuild and verify the updated controls across desktop and mobile routes.

## Copy formatting

- [x] Ensure every Copy all results operation writes exactly one result per line.
- [x] Keep imported headers and one imported record per line without embedded line breaks.
- [x] Validate the copy formatting and save a new checkpoint.

## Copy without country name

- [x] Remove country suffixes from copied trend and place query text.
- [x] Keep visible rows and external links unchanged.
- [x] Validate the normalized copy format and save a new checkpoint.

## Short PDF and book queries

- [x] Define a concise book-title-plus-pdf query format.
- [x] Update PDF and Book Finder generation, display, and copy behavior.
- [x] Preserve a clear public/legal-use notice and validate the route before checkpointing.

## Random short PDF and book results

- [x] Add a frontend title pool and topic-aware title variation.
- [x] Randomize the PDF/Book collection on every generation while keeping `title pdf` output.
- [x] Validate 1,000+ results, uniqueness in the preview, and the short copy format.

## Simplified interface layout

- [x] Remove the large hero/map content from the active workspace.
- [x] Remove the Current Context and Frontend Mode sidebar panels.
- [x] Keep the navigation, country selector, theme toggle, and active tool usable.
- [x] Verify desktop/mobile spacing and save a new checkpoint.

## Random books and no dashboard

- [x] Add a frontend catalog of varied book titles for random PDF results.
- [x] Generate one random book title plus `pdf` per result, with at least 1,000 rows.
- [x] Remove the Dashboard navigation item and route, using a dedicated tool as the default entry.
- [x] Validate the remaining routes and save a new checkpoint.

## Remove Upload Results

- [x] Remove Upload Results from the sidebar navigation.
- [x] Remove the `/results` route and related active-tool behavior.
- [x] Validate the remaining Trends, Address, Places, and PDF/Book routes.

## Remove row actions

- [x] Remove per-row Copy, Validate trends, and Google Maps buttons.
- [x] Keep global Copy all results controls available.
- [x] Validate row alignment and responsive layouts across the remaining tools.

## Multi-country selector

- [x] Add a multi-select country control with visible selected-country chips.
- [x] Generate tool datasets across all selected countries while preserving one primary country context.
- [x] Persist the selected countries and validate desktop/mobile behavior.

## Short Reply Generator

- [x] Add a dedicated Reply Generator route and sidebar link.
- [x] Generate concise local replies from any pasted message with simple tone choices.
- [x] Add Generate, Copy reply, and Clear actions with useful empty states.
- [x] Validate the route, copy behavior, and responsive layout.

## Direct short reply mode

- [x] Remove the Paste Message textarea from Reply Generator.
- [x] Generate random short replies directly from the selected tone.
- [x] Keep Copy reply and Clear actions, then validate the simplified layout.

## Multiple short replies

- [x] Add result-count options starting at 1,000 for Reply Generator.
- [x] Generate and display multiple short replies in a scrollable result list.
- [x] Add Copy all replies and validate the 1,000-result flow.

## Unique short replies

- [x] Build unique reply variants from the selected tone.
- [x] Guarantee no duplicate strings in each generated collection.
- [x] Validate uniqueness at 1,000 results and save a new checkpoint.

## Multi-tone replies

- [x] Replace the single tone select with a multi-tone control.
- [x] Generate unique replies from all selected tones.
- [x] Validate selected-tone display, 1,000+ results, and responsive behavior.

## Gmail subject and message pairs

- [x] Add a frontend generator for paired random email subjects and messages.
- [x] Preserve one-to-one pairing by shared row ID and line number.
- [x] Add 1,000+ volume controls and separate copy actions for subjects, messages, and paired rows.
- [x] Add a dedicated route and validate the responsive layout.

## Separate Gmail copy actions

- [x] Add Copy all subjects using the generated row order.
- [x] Add Copy all messages using the same generated row order.
- [x] Keep paired copy available and validate all three copy formats.

## Remove paired Gmail copy

- [x] Remove the Copy paired results button from the Gmail interface.
- [x] Keep Copy all subjects and Copy all messages with matching row order.
- [x] Validate the simplified controls and save a new checkpoint.

## Remove decorative interface text

- [x] Remove non-functional breadcrumb, status, context, and explanatory copy from the shared shell.
- [x] Remove decorative numbers, eyebrows, notes, and long descriptions from tool cards while keeping functional labels.
- [x] Rebalance spacing after text removal and validate all routes on desktop/mobile.

## Multi-language PDF and book finder

- [x] Replace the single language select with a multi-language control.
- [x] Preserve an Any option and generate across all selected languages.
- [x] Validate the language summary, results, and mobile layout.

## Hide country bar on selected tools

- [x] Hide Research countries from Gmail Subject + Message Generator.
- [x] Hide Research countries from Short Reply Generator and PDF & Book Finder.
- [x] Keep country selection visible on Trends, Address, and Places.
- [x] Validate all affected routes and save a new checkpoint.

## Trend keywords only

- [x] Remove city and country suffixes from Trends display.
- [x] Copy only the keyword text in Copy all results.
- [x] Keep filters, category, result count, and randomization working.
- [x] Validate Trends Explorer and save a new checkpoint.

## Unique weekly trends across tools

- [x] Audit all generators for repeated values at 1,000+ rows.
- [x] Guarantee unique displayed and copied results in Addresses, Places, PDF/Book, Replies, and Gmail pairs.
- [x] Add weekly trend labels and distinct trend words for searchable weekly sets.
- [x] Validate large-volume uniqueness and save a new checkpoint.

## Trends Explorer — last 7 days simplification

- [x] Remove the Week filter, search field, Copy all results button, Week column, Signal column, and technical keyword suffixes.
- [x] Generate Google Trends links using the last 7 days window.
- [x] Keep concise trend keywords, category context, and clear demo-data wording.
- [x] Validate the simplified route and save a new checkpoint.

## Style Decisions

- Trends Explorer should prioritize a compact research table with keyword, category, and direct Google Trends validation links.
- Google Trends links should use the last 7 days window (`now 7-d`) instead of exposing a local synthetic week selector.
- Technical uniqueness suffixes must not appear in displayed or copied trend keywords.

## GitHub push

- [x] Verify the target repository and local Git status; the provided URL currently returns 404 and the Git endpoint returns 403.
- [x] Prepare a clean commit containing the current Country Tools project (commit `4bcf4f9`).
- [ ] Push the commit to the requested GitHub repository and confirm the branch and commit.
