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

## Direct GitHub account push

- [x] Verify the GitHub account and whether `country-tools-dashboard` is available.
- [x] Prepare the current local main branch and commit state.
- [x] Create or select the new repository and push the project.
- [x] Confirm the final GitHub URL and remote branch.

## Remove Express server

- [x] Audit package scripts, build configuration, and documentation for server references.
- [x] Remove the Express server entrypoint and server-only build output.
- [x] Validate the Vite static build and client-side routes.
- [x] Save and document the frontend-only version.

## Vercel 404 fix

- [x] Audit Vite output and deployment configuration for Vercel.
- [x] Add Vercel output-directory and SPA fallback configuration.
- [x] Validate the production build and push the correction to GitHub.
- [x] Provide the Vercel redeployment steps.

## Trends Copy all results

- [x] Audit the existing copy helper and Trends results rendering.
- [x] Add a visible Copy all results button to Trends Explorer.
- [x] Copy one keyword per line without country names or metadata.
- [x] Validate the interaction, build, and responsive layout.

## Copy and download cleanup

- [x] Audit copy confirmation labels and existing export helpers across all tools.
- [x] Remove counts and units from all copy confirmations.
- [x] Add a download-results button to Trends, Addresses, Places, PDF & Book, Replies, and Gmail.
- [x] Validate line formatting, file downloads, responsive layout, and build.

## PDF and Book result suffix cleanup

- [x] Audit the generated PDF/Book query suffix and its copy/download format.
- [x] Remove technical numeric suffixes from displayed, copied, and downloaded PDF/Book results.
- [x] Validate random unique titles at 1,000+ results and run the build.
- [x] Save and deliver the correction.

## Clean copied result content

- [x] Audit every copy/download formatter across Trends, Addresses, Places, PDF & Book, Replies, and Gmail.
- [x] Keep only the user-facing result in copied content, without countries, counts, units, zones, labels, or technical suffixes.
- [x] Apply the same line-by-line clean format to downloads.
- [x] Validate every route and save the update.

## Push latest cleaned version to GitHub

- [x] Verify the local branch and GitHub remote.
- [x] Commit any remaining local changes.
- [x] Push `main` and confirm the remote commit.

## PDF & Book multi-select content types

- [x] Audit the existing language multi-select and document generation state.
- [x] Add a checkbox multi-select for Content type.
- [x] Distribute generated queries across the selected content types.
- [x] Validate persistence, responsive layout, build, and save the update.

## Push Content type multi-select

- [x] Verify the local branch and GitHub remote.
- [x] Commit the multi-select update.
- [x] Push `main` and confirm the remote commit.

## Global duplicate prevention

- [x] Audit the visible and exported value for every generator.
- [x] Guarantee unique cleaned results at 1,000, 2,000, 5,000, and 10,000 rows.
- [x] Keep Gmail subject/message pairs unique while preserving row links.
- [x] Validate all routes and save the no-duplicates version.

## Gmail linked ideas and fresh generations

- [x] Audit subject/message themes and current uniqueness logic.
- [x] Build semantically linked Subject + Message pairs with no duplicate cleaned values.
- [x] Ensure successive generations use a different shuffled result set when possible.
- [x] Validate 1,000–10,000 rows, row pairing, and build before saving.

## Natural Gmail copy

- [x] Audit the current Gmail theme phrasing.
- [x] Rewrite subjects and messages with natural human wording while keeping one shared idea per pair.
- [x] Validate uniqueness, row pairing, and variation at 1,000–10,000 results.
- [x] Run the build, verify the Gmail interface, and save the update.

## Places main query copy

- [x] Audit the current Places copy/download cleaner.
- [x] Copy and download only the main query before the detail separator.
- [x] Validate the example format and build the update.

## Places selected result count

- [x] Audit the selected query count and full Places collection length.
- [x] Ensure 1,000, 2,000, 5,000, and 10,000 generate exactly the selected number.
- [x] Confirm Copy all results and Download results use the full selected collection.
- [x] Validate the preview and save the correction.

## Places primary text copy

- [x] Restore a clear separator between the main Places query and its search details.
- [x] Copy and download only the main text before the separator.
- [x] Validate the red-box example format and the production build.

## Remove global Randomize all

- [x] Locate the global Randomize all button and verify Random defaults.
- [x] Remove only the global button.
- [x] Validate the unchanged controls and production build.

## Push version without Randomize all

- [x] Verify the local branch and GitHub remote.
- [x] Commit any remaining local changes.
- [x] Push `main` and confirm the remote commit.

## Data source mapping

- [x] Inventory the displayed fields in Trends, Addresses, Places, PDF & Book, Replies, and Gmail.
- [x] Map each field to its source dataset, generator, state, and render location.
- [x] Confirm that no live API or backend currently loads these values.
- [x] Deliver a concise source map with file and function references.

## Migration vers les données réelles

- [x] Auditer les API publiques et fiables disponibles pour chaque interface.
- [x] Vérifier les contraintes CORS, quotas, fraîcheur, licences et clés API.
- [x] Définir une architecture de chargement live sans exposer de secrets côté frontend.
- [x] Remplacer les générateurs synthétiques par des adaptateurs de sources réelles.
- [x] Ajouter le rafraîchissement à l’ouverture, au rechargement et à chaque génération.
- [x] Afficher la source, l’endpoint et l’horodatage des données dans l’interface.
- [x] Tester les six outils, les états d’erreur, les quotas et la déduplication.
- [x] Mettre à jour `data-sources.md` avec la cartographie API complète.
- [x] Créer un checkpoint après validation.

## Décision confirmée — architecture live

- [x] Mettre à niveau le projet pour disposer d’un serveur sécurisé et de routes proxy API.
- [x] Utiliser des sources publiques réelles pour livres, géographie et lieux.
- [x] Intégrer une source de tendances autorisée ou documenter explicitement l’absence d’accès Google Trends Alpha.
- [x] Marquer Replies et Gmail comme contenu généré, sans le présenter comme donnée factuelle.

## Corrections de validation live

- [x] Limiter la portée de la migration live aux quatre outils factuels et documenter Replies/Gmail comme texte généré.
- [x] Afficher l’endpoint complet et l’horodatage pour chaque source live.
- [x] Ajouter des états de chargement, erreur, quota et absence de résultats dans les quatre outils live.
- [x] Ajouter des tests de déduplication et de limitation des résultats live.

## Derniers contrôles live

- [x] Afficher un état vide explicite lorsque chaque source live répond sans résultat.
- [x] Distinguer visuellement une limite/quota API d’une erreur générique.
- [x] Tester la limite à 100 résultats et le dédoublonnage des documents live.

## Robustesse fournisseurs live

- [x] Traiter les statuts quota/erreur renvoyés dans un JSON HTTP 200 par les fournisseurs live.
- [x] Tester la déduplication spécifique des résultats Open Library.

## Statuts Google Maps

- [x] Appliquer la validation des statuts JSON Google Maps à Addresses et Places.
- [x] Tester les réponses HTTP 200 Google Maps contenant un quota ou une erreur fournisseur.

## Tests adaptateurs Maps

- [x] Tester directement `fetchAddresses()` et `fetchPlaces()` avec des payloads HTTP 200 de quota/erreur Google Maps.
