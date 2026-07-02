// =============================================
// کپی لینک فیلم و باز کردن فیلم با لینک
// =============================================

// ===== کپی لینک فیلم =====
function copyMovieLink() {
    if (!currentDetailMovie) {
        showToast('❌ ابتدا یک فیلم را انتخاب کنید');
        return;
    }
    
    const movieId = currentDetailMovie.id;
    const url = window.location.origin + '/?movie=' + movieId;
    
    navigator.clipboard.writeText(url).then(() => {
        showToast('🔗 لینک فیلم کپی شد: ' + url);
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

// ===== باز کردن فیلم از لینک =====
function openMovieFromLink() {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('movie');
    
    if (!movieId) {
        console.log('ℹ️ هیچ فیلمی در لینک مشخص نشده است');
        return;
    }
    
    console.log('🔍 تلاش برای باز کردن فیلم با ID:', movieId);
    
    // تابعی که منتظر می‌ماند تا movies بارگذاری شود
    function waitForMoviesAndOpen() {
        if (movies && movies.length > 0) {
            const movie = movies.find(m => m.id === parseInt(movieId));
            if (movie) {
                console.log('✅ فیلم پیدا شد:', movie.name);
                openDetail(movie.id);
                // حذف پارامتر از URL بدون رفرش
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            } else {
                console.log('❌ فیلم با ID', movieId, 'پیدا نشد');
                showToast('❌ فیلم مورد نظر یافت نشد');
            }
        } else {
            // اگر movies هنوز بارگذاری نشده، دوباره تلاش کن
            console.log('⏳ منتظر بارگذاری فیلم‌ها...');
            setTimeout(waitForMoviesAndOpen, 300);
        }
    }
    
    // شروع فرآیند با تاخیر
    setTimeout(waitForMoviesAndOpen, 500);
}