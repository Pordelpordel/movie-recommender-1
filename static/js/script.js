// =============================================
// تنظیمات و داده‌ها
// =============================================
const TMDB_API_KEY = '65c8437566f16327cea8787949e1c755';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

let currentUser = null;
let currentUserData = null;
let movies = [];
let favorites = [];
let watchlist = [];
let watched = [];
let userRatings = {};
let comments = {};
let currentDetailMovie = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 8;
let currentLang = localStorage.getItem('cinemachi_lang') || 'fa';
let searchTimeout = null;

// =============================================
// مدیریت کاربر
// =============================================
function getUserStorageKey(email, type) {
    const sanitized = email.replace(/[^a-zA-Z0-9]/g, '_');
    return `cinemachi_${sanitized}_${type}`;
}

function getUserData(email) {
    const key = getUserStorageKey(email, 'data');
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) {}
    }
    return null;
}

function saveUserData(email, data) {
    const key = getUserStorageKey(email, 'data');
    localStorage.setItem(key, JSON.stringify(data));
}

function getDefaultMovies() {
    return [
        { id: 1, name: "رستگاری در شاوشنک", nameEn: "The Shawshank Redemption", genre: "درام", rating: 9.3, year: "۱۹۹۴", director: "فرانک دارابونت", duration: 142, cast: "تیم رابینز، مورگان فریمن", poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", desc: "داستان اندی دوفرسن، بانکی که به اشتباه به جرم قتل همسرش محکوم می‌شود و در زندان شاوشنک امید را زنده نگه می‌دارد.", status: "released" },
        { id: 2, name: "پدرخوانده", nameEn: "The Godfather", genre: "جنایی", rating: 9.2, year: "۱۹۷۲", director: "فرانسیس فورد کاپولا", duration: 175, cast: "مارلون براندو، آل پاچینو", poster: "https://image.tmdb.org/t/p/w500/rPdtLWNsZmAtoZl9PK7S2wE3qiS.jpg", desc: "خانوادهٔ کورلئونه، یکی از قدرتمندترین خانواده‌های مافیایی نیویورک، درگیر جنگ قدرت و خیانت می‌شوند.", status: "released" },
        { id: 3, name: "شوالیه تاریکی", nameEn: "The Dark Knight", genre: "اکشن", rating: 9.0, year: "۲۰۰۸", director: "کریستوفر نولان", duration: 152, cast: "کریستین بیل، هیث لجر", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", desc: "بتمن با همکاری ستوان گوردون و دادستان هاروی دنت، تلاش می‌کند تا جنایت‌های جوکر را متوقف کند.", status: "released" },
        { id: 4, name: "فارست گامپ", nameEn: "Forrest Gump", genre: "درام", rating: 8.8, year: "۱۹۹۴", director: "رابرت زمکیس", duration: 142, cast: "تام هنکس، رابین رایت", poster: "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg", desc: "داستان زندگی فارست گامپ، مردی با ضریب هوشی پایین که به طور تصادفی در رویدادهای مهم تاریخ آمریکا نقش دارد.", status: "released" },
        { id: 5, name: "تلقین", nameEn: "Inception", genre: "علمی تخیلی", rating: 8.8, year: "۲۰۱۰", director: "کریستوفر نولان", duration: 148, cast: "لئوناردو دیکاپریو، جوزف گوردون-لویت", poster: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg", desc: "دزدی که می‌تواند از طریق اشتراک رویاها به اسرار افراد نفوذ کند، ماموریت پیدا می‌کند ایده‌ای را در ذهن یک مدیرعامل بکارد.", status: "released" },
        { id: 6, name: "ماتریکس", nameEn: "The Matrix", genre: "علمی تخیلی", rating: 8.7, year: "۱۹۹۹", director: "واتشوفسکی", duration: 136, cast: "کیانو ریوز، لارنس فیشبرن", poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", desc: "نئو، یک برنامه‌نویس، متوجه می‌شود که دنیایی که در آن زندگی می‌کند یک شبیه‌سازی کامپیوتری به نام ماتریکس است.", status: "released" },
        { id: 7, name: "اینتراستلار", nameEn: "Interstellar", genre: "علمی تخیلی", rating: 8.6, year: "۲۰۱۴", director: "کریستوفر نولان", duration: 169, cast: "متیو مک‌کاناهی، آن هاتاوی", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", desc: "گروهی از فضانوردان از میان یک کرمچاله سفر می‌کنند تا سیاره جدیدی برای سکونت انسان پیدا کنند.", status: "released" },
        { id: 8, name: "تایتانیک", nameEn: "Titanic", genre: "عاشقانه", rating: 8.5, year: "۱۹۹۷", director: "جیمز کامرون", duration: 195, cast: "لئوناردو دیکاپریو، کیت وینسلت", poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", desc: "داستان عشق جک و رز در کشتی تایتانیک که به کوه یخ برخورد می‌کند.", status: "released" },
        { id: 9, name: "اوپنهایمر", nameEn: "Oppenheimer", genre: "درام", rating: 8.4, year: "۲۰۲۳", director: "کریستوفر نولان", duration: 180, cast: "کیلیان مورفی، امیلی بلانت", poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", desc: "داستان جی. رابرت اوپنهایمر، فیزیکدانی که نقش کلیدی در ساخت بمب اتم داشت.", status: "released" },
    ];
}

function createNewUserData(email) {
    const now = new Date().toISOString();
    return {
        email: email,
        joinedAt: now,
        movies: getDefaultMovies(),
        favorites: [],
        watchlist: [],
        watched: [],
        ratings: {},
        comments: {}
    };
}

function loginUser() {
    const email = document.getElementById('loginEmail').value.trim();
    const errorEl = document.getElementById('loginError');
    
    if (!email || !email.includes('@')) {
        errorEl.textContent = '❌ لطفاً یک ایمیل معتبر وارد کنید';
        return;
    }
    
    errorEl.textContent = '';
    
    let userData = getUserData(email);
    if (!userData) {
        userData = createNewUserData(email);
        saveUserData(email, userData);
    }
    
    currentUser = email;
    currentUserData = userData;
    
    localStorage.setItem('cinemachi_current_user', email);
    
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    initApp();
    
    showToast(`👋 خوش آمدید ${getUserDisplayName(email)}!`);
}

// ===== خروج از حساب =====
function logoutUser() {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
        // حذف اطلاعات از LocalStorage
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('cinemachi_current_user');
        
        // حذف اطلاعات از Session (با درخواست به سرور)
        fetch('/logout')
            .then(() => {
                window.location.href = '/';
            })
            .catch(() => {
                window.location.href = '/';
            });
    }
}

function getUserDisplayName(email) {
    return email.split('@')[0];
}

function checkCurrentUser() {
    const saved = localStorage.getItem('cinemachi_current_user');
    if (saved) {
        const data = getUserData(saved);
        if (data) {
            currentUser = saved;
            currentUserData = data;
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            return true;
        } else {
            localStorage.removeItem('cinemachi_current_user');
        }
    }
    return false;
}

// =============================================
// توابع اصلی
// =============================================
function loadUserData() {
    if (!currentUserData) return;
    
    movies = currentUserData.movies || [];
    favorites = currentUserData.favorites || [];
    watchlist = currentUserData.watchlist || [];
    watched = currentUserData.watched || [];
    userRatings = currentUserData.ratings || {};
    comments = currentUserData.comments || {};
}

function saveUserDataToStorage() {
    if (!currentUser) return;
    currentUserData.movies = movies;
    currentUserData.favorites = favorites;
    currentUserData.watchlist = watchlist;
    currentUserData.watched = watched;
    currentUserData.ratings = userRatings;
    currentUserData.comments = comments;
    saveUserData(currentUser, currentUserData);
}

function updateCounts() {
    document.getElementById('movieCount').textContent = movies.length;
    document.getElementById('favCount').textContent = favorites.length;
    document.getElementById('watchlistCount').textContent = watchlist.length;
    document.getElementById('watchedCount').textContent = watched.length;
    document.getElementById('watchlistBadge').textContent = watchlist.length;
    
    if (currentUser) {
        const displayName = getUserDisplayName(currentUser);
        document.getElementById('profileName').textContent = displayName;
        document.getElementById('profileEmail').textContent = currentUser;
        document.getElementById('profileJoinDate').textContent = currentUserData.joinedAt ? 
            `تاریخ عضویت: ${new Date(currentUserData.joinedAt).toLocaleDateString('fa-IR')}` : 'تاریخ عضویت: امروز';
        document.getElementById('profileMovies').textContent = movies.length;
        document.getElementById('profileFavorites').textContent = favorites.length;
        document.getElementById('profileWatchlist').textContent = watchlist.length;
    }
}

function getNextId() {
    return movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1;
}

function isFavorite(id) { return favorites.includes(id); }
function isInWatchlist(id) { return watchlist.includes(id); }
function isWatched(id) { return watched.includes(id); }

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 0.5 ? 1 : 0;
    let html = '';
    for (let i = 0; i < fullStars; i++) html += '★';
    if (halfStar) html += '½';
    if (fullStars + halfStar < 5) {
        for (let i = fullStars + halfStar; i < 5; i++) html += '☆';
    }
    return html;
}

function getRatingEmoji(rating) {
    if (rating >= 9) return '🌟';
    if (rating >= 8) return '⭐';
    if (rating >= 7) return '👍';
    if (rating >= 5) return '😐';
    return '👎';
}

function getStatusText(status) {
    const map = { showing: '🟢 در حال اکران', released: '🔵 اکران شده', coming: '🟠 در راه' };
    return map[status] || status;
}

function getStatusClass(status) {
    return status === 'showing' ? 'showing' : status === 'coming' ? 'coming' : 'released';
}

function displayMovies(moviesList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!moviesList || moviesList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="icon">🎬</span>
                <h3>هیچ فیلمی پیدا نشد</h3>
                <p style="color:#888; font-size:0.85rem;">می‌توانید از طریق جستجو یا افزودن دستی فیلم‌های جدید را اضافه کنید</p>
            </div>
        `;
        return;
    }
    container.innerHTML = moviesList.map(m => {
        const poster = m.poster && m.poster.startsWith('http') ? m.poster : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22%3E%3Crect fill=%22%231a1a2e%22 width=%22300%22 height=%22450%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22 font-size=%2230%22 font-family=%22sans-serif%22%3E🎬%3C/text%3E%3C/svg%3E';
        const fav = isFavorite(m.id);
        const inWatch = isInWatchlist(m.id);
        const watchedStatus = isWatched(m.id);
        const emoji = getRatingEmoji(m.rating);
        const statusClass = getStatusClass(m.status);
        const statusText = getStatusText(m.status);
        return `
            <div class="movie-card" onclick="openDetail(${m.id})">
                <button class="delete-btn" onclick="event.stopPropagation(); deleteMovie(${m.id})">🗑</button>
                <button class="fav-btn ${fav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${m.id})">${fav ? '❤️' : '🤍'}</button>
                <button class="watchlist-btn ${inWatch ? 'active' : ''}" onclick="event.stopPropagation(); toggleWatchlist(${m.id})">📋</button>
                ${watchedStatus ? '<span class="watched-badge">✅</span>' : ''}
                <img class="movie-poster" src="${poster}" alt="${m.name}" loading="lazy">
                <h3>${m.name}</h3>
                <div class="genre-tag">🎭 ${m.genre}</div>
                <div class="rating">${emoji} ${m.rating}/10</div>
                ${m.year ? `<div style="font-size:0.7rem; opacity:0.7;">📅 ${m.year}</div>` : ''}
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
        `;
    }).join('');
}

// =============================================
// جستجو در TMDB
// =============================================
function searchMoviesDelayed() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchMovies();
    }, 500);
}

async function searchMovies() {
    const query = document.getElementById('searchInput').value.trim();
    const container = document.getElementById('searchResults');
    const suggestions = document.getElementById('searchSuggestions');

    if (!query) {
        container.innerHTML = '';
        suggestions.style.display = 'none';
        return;
    }

    try {
        const suggestResponse = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=fa-IR&page=1`
        );
        const suggestData = await suggestResponse.json();
        if (suggestData.results && suggestData.results.length > 0) {
            suggestions.style.display = 'block';
            suggestions.innerHTML = suggestData.results.slice(0, 5).map(m => `
                <div style="padding:8px 14px; cursor:pointer; border-bottom:1px solid #eee; transition:background 0.2s;" 
                     onmouseover="this.style.background='#f0f0f0'" 
                     onmouseout="this.style.background='white'"
                     onclick="document.getElementById('searchInput').value='${m.title.replace(/'/g, "\\'")}'; suggestions.style.display='none'; searchMovies();">
                    ${m.title} (${m.release_date ? m.release_date.split('-')[0] : 'نامشخص'})
                </div>
            `).join('');
        } else {
            suggestions.style.display = 'none';
        }
    } catch(e) { suggestions.style.display = 'none'; }

    container.innerHTML = '<div style="text-align:center; padding:25px; color:#888;">⏳ در حال جستجو...</div>';

    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=fa-IR`
        );
        if (!response.ok) throw new Error('خطا در ارتباط با TMDB');

        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:25px; color:#888;">😔 فیلمی پیدا نشد</div>';
            return;
        }

        container.innerHTML = data.results.map(m => {
            const imdbLink = `https://www.imdb.com/find?q=${encodeURIComponent(m.title)}`;
            const trailerLink = `https://www.youtube.com/results?search_query=${encodeURIComponent(m.title)}+trailer`;
            
            return `
            <div class="search-result-item" onclick="addFromTMDB(${m.id})">
                <img src="${m.poster_path ? TMDB_IMAGE_URL + m.poster_path : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22%3E%3Crect fill=%22%231a1a2e%22 width=%22300%22 height=%22450%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22 font-size=%2230%22 font-family=%22sans-serif%22%3E🎬%3C/text%3E%3C/svg%3E'}" alt="${m.title}" loading="lazy">
                <h4>${m.title}</h4>
                <div class="year">${m.release_date ? m.release_date.split('-')[0] : 'نامشخص'}</div>
                <div class="rating">⭐ ${m.vote_average ? m.vote_average.toFixed(1) : '?'}/10</div>
                <div style="display:flex; gap:4px; justify-content:center; margin-top:4px; flex-wrap:wrap;">
                    <a href="${imdbLink}" target="_blank" class="btn-imdb" style="padding:3px 10px; font-size:0.65rem; text-decoration:none; border-radius:20px; background:#f5c518; color:#000;" onclick="event.stopPropagation();">🎬 IMDb</a>
                    <a href="${trailerLink}" target="_blank" class="btn-trailer" style="padding:3px 10px; font-size:0.65rem; text-decoration:none; border-radius:20px; background:#e50914; color:#fff;" onclick="event.stopPropagation();">▶️ تریلر</a>
                </div>
                <button class="btn-primary" style="margin-top:4px; padding:4px 16px; font-size:0.75rem;" onclick="event.stopPropagation(); addFromTMDB(${m.id})">➕ افزودن</button>
            </div>
        `}).join('');

    } catch (error) {
        container.innerHTML = '<div style="text-align:center; padding:25px; color:#ff6b6b;">❌ خطا در جستجو</div>';
        showToast('❌ خطا در ارتباط با TMDB');
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('searchSuggestions').style.display = 'none';
    if (searchTimeout) clearTimeout(searchTimeout);
}

// =============================================
// کپی لینک فیلم و باز کردن فیلم با لینک
// =============================================
function copyMovieLink() {
    if (!currentDetailMovie) return;
    const url = window.location.origin + '/?movie=' + currentDetailMovie.id;
    
    navigator.clipboard.writeText(url).then(() => {
        showToast('🔗 لینک فیلم کپی شد');
    }).catch(() => {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('🔗 لینک فیلم کپی شد');
    });
}

function openMovieFromLink() {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('movie');
    if (movieId) {
        setTimeout(() => {
            openDetail(parseInt(movieId));
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }, 500);
    }
}

// =============================================
// سایر توابع (افزودن، حذف، علاقه‌مندی، لیست تماشا و...)
// =============================================
async function addFromTMDB(tmdbId) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=fa-IR`
        );
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات');
        const data = await response.json();

        const newMovie = {
            id: getNextId(),
            name: data.title,
            nameEn: data.original_title,
            genre: data.genres?.[0]?.name || 'نامشخص',
            rating: data.vote_average || 0,
            year: data.release_date ? data.release_date.split('-')[0] : 'نامشخص',
            director: data.production_companies?.[0]?.name || 'نامشخص',
            duration: data.runtime || 0,
            cast: data.production_companies?.[0]?.name || 'نامشخص',
            poster: data.poster_path ? TMDB_IMAGE_URL + data.poster_path : '',
            desc: data.overview || 'توضیحاتی برای این فیلم ثبت نشده است.',
            status: data.status === 'Released' ? 'released' : 'coming',
            imdb_id: data.imdb_id || null
        };

        movies.push(newMovie);
        saveUserDataToStorage();
        applyFilters();
        showToast(`🎬 فیلم "${data.title}" با موفقیت اضافه شد!`);
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('searchSuggestions').style.display = 'none';

    } catch (error) {
        showToast('❌ خطا در افزودن فیلم');
    }
}

function deleteMovie(id) {
    if (!confirm('⚠️ آیا مطمئن هستید که می‌خواهید این فیلم را حذف کنید؟')) return;
    movies = movies.filter(m => m.id !== id);
    favorites = favorites.filter(f => f !== id);
    watchlist = watchlist.filter(w => w !== id);
    watched = watched.filter(w => w !== id);
    delete userRatings[id];
    delete comments[id];
    saveUserDataToStorage();
    applyFilters();
    displayFavorites();
    displayWatchlist();
    updateCounts();
    showToast('🗑️ فیلم با موفقیت حذف شد');
}

function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
        showToast('❌ از علاقه‌مندی‌ها حذف شد');
    } else {
        favorites.push(id);
        showToast('❤️ به علاقه‌مندی‌ها اضافه شد');
    }
    saveUserDataToStorage();
    applyFilters();
    displayFavorites();
    updateCounts();
    if (currentDetailMovie && currentDetailMovie.id === id) updateDetailUI();
}

function toggleWatchlist(id) {
    if (watchlist.includes(id)) {
        watchlist = watchlist.filter(w => w !== id);
        showToast('❌ از لیست تماشا حذف شد');
    } else {
        watchlist.push(id);
        showToast('📋 به لیست تماشا اضافه شد');
        if (watched.includes(id)) {
            watched = watched.filter(w => w !== id);
        }
    }
    saveUserDataToStorage();
    applyFilters();
    displayWatchlist();
    updateCounts();
    if (currentDetailMovie && currentDetailMovie.id === id) updateDetailUI();
}

function displayFavorites() {
    const favMovies = movies.filter(m => favorites.includes(m.id));
    displayMovies(favMovies, 'favoritesList');
}

function displayWatchlist() {
    const watchMovies = movies.filter(m => watchlist.includes(m.id));
    displayMovies(watchMovies, 'watchlistList');
    updateCounts();
}

function recommendMovies() {
    const genre = document.getElementById('recommendGenre').value;
    const results = movies.filter(m => m.genre === genre).sort((a, b) => b.rating - a.rating);
    displayMovies(results, 'recommendResults');
    if (results.length === 0) {
        showToast(`😔 فیلمی با ژانر "${genre}" پیدا نشد`);
    } else {
        showToast(`🎯 ${results.length} فیلم پیشنهاد شد!`);
    }
}

function loadTopMovies() {
    const count = parseInt(document.getElementById('topCount').value) || 5;
    const sorted = [...movies].sort((a, b) => b.rating - a.rating).slice(0, count);
    displayMovies(sorted, 'topResults');
    showToast(`🏆 ${count} فیلم برتر نمایش داده شد`);
}

function applyFilters() {
    const genre = document.getElementById('filterGenre').value;
    const year = document.getElementById('filterYear').value;
    const rating = document.getElementById('filterRating').value;
    const sort = document.getElementById('sortMovies').value;
    const search = document.getElementById('searchInputQuick').value.trim().toLowerCase();

    let filtered = [...movies];

    if (genre) filtered = filtered.filter(m => m.genre === genre);
    if (year) filtered = filtered.filter(m => m.year === year);
    if (rating) filtered = filtered.filter(m => m.rating >= parseFloat(rating));
    if (search) filtered = filtered.filter(m => m.name.toLowerCase().includes(search) || (m.nameEn && m.nameEn.toLowerCase().includes(search)));

    switch(sort) {
        case 'rating-desc': filtered.sort((a,b) => b.rating - a.rating); break;
        case 'rating-asc': filtered.sort((a,b) => a.rating - b.rating); break;
        case 'year-desc': filtered.sort((a,b) => parseInt(b.year) - parseInt(a.year)); break;
        case 'year-asc': filtered.sort((a,b) => parseInt(a.year) - parseInt(b.year)); break;
        case 'name': filtered.sort((a,b) => a.name.localeCompare(b.name)); break;
        default: filtered.sort((a,b) => b.rating - a.rating);
    }

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, end);

    displayMovies(pageItems, 'moviesList');
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="currentPage=${i}; applyFilters();">${i}</button>`;
    }
    container.innerHTML = html;
}

// =============================================
// اجرا در زمان بارگذاری صفحه
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    if (!checkCurrentUser()) {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }
    
    document.getElementById('loginEmail').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') loginUser();
    });
    
    // باز کردن فیلم از لینک
    openMovieFromLink();
});

function loadTheme() {
    const theme = localStorage.getItem('cinemachi_theme');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    }
}

function initApp() {
    loadUserData();
    applyFilters();
    displayFavorites();
    displayWatchlist();
    updateCounts();
    
    console.log('🎬 سینماچی با سیستم کاربری کامل بارگذاری شد!');
    console.log(`👤 کاربر: ${currentUser}`);
    console.log(`📊 ${movies.length} فیلم در گنجینه`);
    console.log(`❤️ ${favorites.length} فیلم در علاقه‌مندی‌ها`);
    console.log(`📋 ${watchlist.length} فیلم در لیست تماشا`);
}