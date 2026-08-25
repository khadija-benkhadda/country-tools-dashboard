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
