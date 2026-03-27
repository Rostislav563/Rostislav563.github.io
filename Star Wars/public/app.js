const API_ENDPOINTS = [
  '/api/star-wars',
  'https://starwars-databank-server.onrender.com/api/v1',
];

const FEATURED_CATEGORIES = [
  {
    resource: 'characters',
    label: 'Characters',
    summary: 'Heroes, smugglers, rebels, and legends from across the galaxy.',
  },
  {
    resource: 'droids',
    label: 'Droids',
    summary: 'Mechanical companions, tacticians, and service units.',
  },
  {
    resource: 'vehicles',
    label: 'Vehicles',
    summary: 'Starfighters, transports, walkers, and speeders.',
  },
  {
    resource: 'locations',
    label: 'Locations',
    summary: 'Planets, temples, outposts, and other iconic places.',
  },
];

const CARD_LIMIT = 3;
const FALLBACK_IMAGE = 'public/images/placeholder.svg';
const HOVER_IMAGE_MAP = window.STAR_WARS_HOVER_IMAGES || {};
const catalog = document.getElementById('catalog');
const statusPanel = document.getElementById('status-panel');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function truncateText(text, maxLength = 160) {
  const raw = String(text || '').trim();
  if (!raw) {
    return 'No description available.';
  }

  if (raw.length <= maxLength) {
    return raw;
  }

  return `${raw.slice(0, maxLength).trimEnd()}...`;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replaceAll('"', '')
    .replaceAll("'", '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildHoverKey(resource, name) {
  return `${resource}:${slugify(name)}`;
}

function getHoverImage(resource, name, primaryImage) {
  const hoverImage = HOVER_IMAGE_MAP[buildHoverKey(resource, name)];
  return hoverImage && hoverImage !== primaryImage ? hoverImage : null;
}

function setStatus(message, tone = 'success') {
  statusPanel.className = `status-panel status-panel--${tone}`;
  statusPanel.innerHTML = `<p>${escapeHtml(message)}</p>`;
}

function renderCard(item, categoryLabel) {
  const imageUrl = item.image || FALLBACK_IMAGE;
  const hoverImage = item.hoverImage && item.hoverImage !== imageUrl ? item.hoverImage : null;
  const description = truncateText(item.description);

  return `
    <article class="sw-card">
      <div class="sw-card__image">
        <img
          class="sw-card__image-primary"
          src="${escapeHtml(imageUrl)}"
          alt="${escapeHtml(item.name)}"
          loading="lazy"
          decoding="async"
          onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
        >
        ${hoverImage ? `
          <img
            class="sw-card__image-hover"
            src="${escapeHtml(hoverImage)}"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
          >
        ` : ''}
      </div>
      <div class="sw-card__body">
        <span class="sw-card__tag">${escapeHtml(categoryLabel)}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(description)}</p>
      </div>
    </article>
  `;
}

function renderCategorySection(category) {
  const cards = category.items.map((item) => renderCard(item, category.label)).join('');

  return `
    <section class="category-section">
      <div class="category-header">
        <p class="category-kicker">Featured set</p>
        <h2>${escapeHtml(category.label)}</h2>
        <p>${escapeHtml(category.summary)}</p>
      </div>

      <div class="cards-grid">
        ${cards}
      </div>
    </section>
  `;
}

async function fetchCategory(category) {
  let lastError;

  for (const baseUrl of API_ENDPOINTS) {
    try {
      const response = await fetch(`${baseUrl}/${category.resource}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${category.label.toLowerCase()}.`);
      }

      const payload = await response.json();
      const items = Array.isArray(payload.data) ? payload.data.slice(0, CARD_LIMIT) : [];

      return {
        ...category,
        items: items.map((item) => {
          const name = item.name || 'Unknown item';
          const image = item.image || FALLBACK_IMAGE;

          return {
            id: item._id || name,
            name,
            description: item.description || 'No description available.',
            image,
            hoverImage: getHoverImage(category.resource, name, image),
          };
        }),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function init() {
  try {
    const results = await Promise.allSettled(FEATURED_CATEGORIES.map((category) => fetchCategory(category)));
    const categories = [];
    const failures = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        categories.push(result.value);
      } else {
        failures.push(result.reason);
      }
    }

    if (categories.length === 0) {
      throw new Error('No Star Wars data could be loaded.');
    }

    catalog.innerHTML = categories.map((category) => renderCategorySection(category)).join('');

    const cardCount = categories.reduce((count, category) => count + category.items.length, 0);
    if (failures.length > 0) {
      setStatus(`Loaded ${cardCount} cards across ${categories.length} categories. ${failures.length} category failed to load.`, 'warning');
      return;
    }

    setStatus(`Loaded ${cardCount} cards across ${categories.length} categories.`, 'success');
  } catch (error) {
    console.error('Star Wars app failed to load:', error);
    catalog.innerHTML = `
      <section class="category-section">
        <div class="empty-state">
          <p>Star Wars data could not be loaded right now.</p>
          <p>Please try again later or run the Node.js server locally with <strong>npm start</strong>.</p>
        </div>
      </section>
    `;
    setStatus('Unable to load Star Wars data.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', init);
