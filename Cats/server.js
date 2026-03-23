const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Fetch cat breeds from TheCatAPI
async function fetchCatBreeds() {
    const response = await fetch('https://api.thecatapi.com/v1/breeds?limit=12');
    if (!response.ok) {
        throw new Error('Failed to fetch cat data');
    }
    const breeds = await response.json();
    
    // Add image URLs using reference_image_id
    return breeds.map(breed => ({
        ...breed,
        image: {
            url: breed.reference_image_id 
                ? `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`
                : 'https://placekitten.com/400/300'
        }
    }));
}

// Main route
app.get('/', async (req, res) => {
    try {
        const cats = await fetchCatBreeds();
        res.render('index', { cats });
    } catch (error) {
        console.error('Error fetching cats:', error);
        res.render('index', { cats: [], error: 'Failed to load cat data. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Cat Cards app running at http://localhost:${PORT}`);
});
