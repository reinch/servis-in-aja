const API_BASE = 'https://www.ifixit.com/api/2.0';
const resultsDiv = document.getElementById('results');
const loading = document.getElementById('loading');
const mainContent = document.getElementById('main-content');

function showLoading() {
    loading.style.display = 'block';
    resultsDiv.innerHTML = '';
}

function hideLoading() {
    loading.style.display = 'none';
}

// Render hasil dengan gaya New & Noteworthy LOA
function renderCards(items, sectionTitle = 'HASIL PENCARIAN') {
    resultsDiv.innerHTML = `
        <div class="featured-wrapper">
            <div class="featured-title">${sectionTitle}</div>
            <div class="grid-featured" id="featured-grid"></div>
        </div>
    `;

    const grid = document.getElementById('featured-grid');

    if (items.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#666; font-size:18px;">Tidak ada hasil ditemukan.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        let imgSrc = 'https://via.placeholder.com/300x320?text=No+Image';
        if (item.image && (item.image.medium || item.image.standard || item.image.thumbnail)) {
            imgSrc = item.image.medium || item.image.standard || item.image.thumbnail;
        }

        const title = item.title || 'Tanpa Judul';
        const subtitle = item.category || item.type || 'Panduan Perbaikan';
        const url = item.url || '#';

        const isFavorite = localStorage.getItem(url) === 'true';
        const heart = isFavorite ? '❤️' : '🤍';

        card.innerHTML = `
            <div style="position:relative;">
                <img src="${imgSrc}" alt="${title}">
                <span class="favorite-btn" onclick="toggleFavorite('${url}', this)">${heart}</span>
            </div>
            <div class="card-content">
                <h3 class="card-title">${title}</h3>
                <p class="card-category">${subtitle}</p>
                <a href="${url}" target="_blank" class="card-link">Lihat Detail →</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Pencarian
async function performSearch() {
    const query = document.getElementById('query').value.trim();
    if (!query) return alert('Masukkan kata kunci pencarian!');

    showLoading();
    try {
        const resp = await fetch(`${API_BASE}/suggest/${encodeURIComponent(query)}?doctypes=guide,device`);
        const data = await resp.json();
        hideLoading();
        renderCards(data.results || [], 'HASIL PENCARIAN');
    } catch (err) {
        hideLoading();
        alert('Gagal mengambil data dari iFixit API.');
        console.error(err);
    }
}

// Home
function loadHome() {
    mainContent.querySelector('h3').textContent = 'Selamat Datang di Website Panduan Perbaikan';
}

// Populer (Kategori)
async function loadPopular() {
    showLoading();
    try {
        const resp = await fetch(`${API_BASE}/categories`);
        const data = await resp.json();
        hideLoading();
        renderCards(data || [], 'KATEGORI POPULER');
    } catch (err) {
        hideLoading();
        alert('Error loading categories.');
    }
}

// Trending (Guides terbaru)
async function loadTrending() {
    showLoading();
    try {
        const resp = await fetch(`${API_BASE}/guides?limit=20`);
        const data = await resp.json();
        hideLoading();
        renderCards(data || [], 'TRENDING GUIDES');
    } catch (err) {
        hideLoading();
        alert('Error loading trending guides.');
    }
}

// Favorit
function loadFavorites() {
    mainContent.querySelector('h1').textContent = 'Panduan Favorit';
    const favorites = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (localStorage.getItem(key) === 'true') {
            const path = new URL(key).pathname.split('/').pop().replace(/_/g, ' ');
            favorites.push({ title: decodeURIComponent(path) || 'Panduan', url: key });
        }
    }
    resultsDiv.innerHTML = '';
    if (favorites.length === 0) {
        resultsDiv.innerHTML = '<p class="placeholder">Belum ada panduan favorit.<br>Klik ❤️ pada panduan untuk menyimpannya.</p>';
        return;
    }
    renderCards(favorites.map(f => ({ title: f.title, url: f.url, image: null, category: 'Favorit' })), 'FAVORIT');
}

function toggleFavorite(url, elem) {
    if (localStorage.getItem(url) === 'true') {
        localStorage.removeItem(url);
        elem.textContent = '🤍';
    } else {
        localStorage.setItem(url, 'true');
        elem.textContent = '❤️';
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    // Kamu bisa tambah styling dark mode nanti
}

function toggleMenu() {
    document.getElementById('mobileMenu').classList.toggle('active');
}

// Load Home saat pertama kali
loadHome();

// Enter untuk search
document.getElementById('query').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});