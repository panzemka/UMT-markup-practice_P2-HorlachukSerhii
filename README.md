# Flora. Interactive Layer

Responsive landing page for a flower studio, extended with a client-side interactive layer: retina-ready images, modal forms, a live product catalog powered by a public API, and pagination and filtering. Built on top of the original static Flora markup with vanilla JavaScript and axios. No build step, no framework.

## Installation

```
git clone https://github.com/panzemka/UMT-markup-practice_P2-HorlachukSerhii.git
cd UMT-markup-practice_P2-HorlachukSerhii
```

No dependencies are required to run the site. It's a static site that calls a public API directly from the browser.

## Usage

Serve the folder locally. Opening `index.html` directly with `file://` will not run the catalog fetches due to browser security restrictions on local files.

```
npx serve .
```

Live demo: https://panzemka.github.io/UMT-markup-practice_P2-HorlachukSerhii/
Figma reference: add link here if applicable

## What's new in this stage

### 1. Retina images

- All content `<img>` elements ship `srcset` with `@1x`/`@2x` versions, e.g. `about@1x.jpg 1x, about@2x.jpg 2x`.
- The hero background image also demonstrates the full mobile-first density matrix: a dedicated `@1x`/`@2x` pair for every breakpoint, 375, 768, and 1440, switched via `min-width` and `min-resolution: 2dppx` media queries in `css/styles.css`.
- `img { max-width: 100%; height: auto }` keeps everything responsive.
- Images returned by the public product API are served as-is by that API and sit outside this project's own asset pipeline, so they're not part of the retina srcset setup.

### 2. Modals and forms

- `#modal-backdrop` is a fixed, full-viewport, semi-transparent overlay. The dialog is centered and toggled with the `is-open` class, see `js/modal.js`.
- Closes via the top-right close button, a click on the backdrop, or Esc. Body scroll locks with `body.no-scroll` while open.
- The order form in the modal and the newsletter form in the footer use semantic markup: every input has a `name`, an associated `<label>`, a `placeholder` where the design calls for one, and `type="submit"` buttons.
- The licensing-agreement checkbox is a real, keyboard-accessible `<input type="checkbox">`, visually hidden with `.visually-hidden` and paired with a custom SVG box that reveals on `:checked`.
- All hover and focus transitions use `250ms cubic-bezier(0.4, 0, 0.2, 1)`.

### 3. Live product catalog

- New "Live Product Catalog" section built entirely from data fetched at runtime. No static markup for the list items.
- Uses DummyJSON as a public mock API, so no local server is required and it works directly on GitHub Pages.
- Requests go through axios with `async`/`await` in `js/catalog.js`. Errors are caught and shown inline instead of crashing or spamming the console.
- Each card batch is inserted in one call to `insertAdjacentHTML`, never one-by-one with `appendChild`.

### 4. Pagination and filtering

- Search and category filters map to DummyJSON's product search, category, and list endpoints, using `limit` and `skip` for pagination.
- Changing the search or category resets `skip` back to `0`, so there are no stale results from a previous page.
- Load More appends the next page without duplicating existing items, and hides itself once the collection is exhausted or the result set is empty.
- All catalog state, search term, category, current page, and total count, lives in a single `state` object in `js/catalog.js`.
- Everything updates in place. No page reloads.

## Sections

- Header. Sticky nav with logo, links, CTA button, mobile burger menu
- Hero. Banner with headline and call to action
- About. Studio introduction
- Bestsellers. Horizontally scrollable product slider with dots and arrows
- Bouquets. Curated product grid, static, matches the original design
- Live Product Catalog. Dynamic, API-driven grid with search, category filter, and Load More
- Feedback. Client testimonials slider
- Contact. Contact details, store banner, and a Request a Custom Bouquet button that opens the order modal
- Footer. Logo, nav links, social links, newsletter subscribe form

## Project structure

```
flora-site-interactive/
├── css/
│   ├── aos.css
│   ├── modern-normalize.css
│   └── styles.css
├── images/
│   ├── icons.svg
│   └── retina pairs: name@1x.jpg, name@2x.jpg, plus hero-<breakpoint>@<density>.jpg
├── js/
│   ├── vendor/
│   │   └── aos.js
│   ├── script.js    nav and sliders, unchanged from stage 1
│   ├── modal.js     modal open/close, order form, subscribe form
│   └── catalog.js   axios, state, pagination and filtering for the live catalog
└── index.html
```
