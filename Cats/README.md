# Cat Cards

A simple Node.js web application that displays cat breed information cards using data from TheCatAPI.

## Features

- Displays 12 cat breeds with images
- Each card shows: breed name, origin, temperament, description, lifespan, and weight
- Responsive grid layout
- Beautiful modern design with hover effects

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the application

```bash
npm start
```

Then open http://localhost:3000 in your browser.

### Development mode (auto-restart on changes)

```bash
npm run dev
```

## Tech Stack

- **Backend**: Node.js + Express.js
- **Templating**: EJS
- **API**: TheCatAPI (https://thecatapi.com)

## Project Structure

```
/Cats
├── server.js          # Express server with API integration
├── package.json       # Dependencies and scripts
├── views/
│   ├── index.ejs      # Main page template
│   └── partials/
│       └── card.ejs   # Cat card component
├── public/
│   └── styles.css     # Styling
└── README.md
```
