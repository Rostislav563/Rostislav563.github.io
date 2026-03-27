# Star Wars Databank Explorer

A simple Node.js web app that fetches Star Wars Databank data and renders category-based cards with images and English UI copy.

## Features

- Loads data from the public Star Wars Databank API
- Displays featured cards for multiple categories
- Swaps card artwork on hover using other Databank image variants for the same item
- Uses a Node.js server for a local proxy and static file hosting
- Works with a responsive, dark Star Wars-themed layout

## Run locally

```bash
npm start
```

Then open `http://localhost:3000`.

## Development mode

```bash
npm run dev
```

## Notes

- The browser tries the Node.js proxy at `/api/star-wars/...` first and falls back to the public Star Wars Databank API if needed.
