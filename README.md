# Juanpa portfolio (React + Vite)

A React migration of the supplied portfolio page. The layout is styled with the original page's dark/monospace visual system; content is read from `src/locales/en.json` and `src/locales/es.json`.

## Run locally

Requirements: Node.js 18+ and npm.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, or inspect it locally with `npm run preview`.

## Language behavior

On first visit, the app checks the browser's ordered language preferences (`navigator.languages`, then `navigator.language`) and chooses the first supported language (`es` or `en`), falling back to English. A language the visitor selects manually is saved in local storage and takes precedence on later visits. The EN/ES buttons switch language immediately. The document language, title, description, keywords, and Open Graph metadata are updated when the language changes.

## Content

Edit `src/locales/en.json` and `src/locales/es.json`. `ui` contains supporting labels used by the original layout in addition to the portfolio data fields. The Spanish JSON is translated from the English content included in the request, since the pasted JSON example only contained English strings.
