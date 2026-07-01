// مدیریت علاقه‌مندی‌ها
document.addEventListener('DOMContentLoaded', function() {
    // دکمه‌های علاقه‌مندی
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const movieId = this.getAttribute('data-movie-id');
            toggleFavorite(movieId, this);
        });
    });

    // دکمه‌های علاقه‌مندی در صفحه جزئیات
    const favoriteDetailsButtons = document.querySelectorAll('.favorite-btn-details');
    favoriteDetailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const movieId = this.getAttribute('data-movie-id');
            toggleFavoriteDetails(movieId, this);
        });
    });

    // دکمه‌های حذف از علاقه‌مندی‌ها
    const removeFavoriteButtons = document.querySelectorAll('.remove-favorite');
    removeFavoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const movieId = this.getAttribute('data-movie-id');
            removeFromFavorites(movieId, this.closest('.movie-card'));
        });
    });

    // امتیازدهی به فیلم‌ها
    const ratingStars = document.querySelectorAll('.stars:not(.episode-stars)');
    ratingStars.forEach(starsContainer => {
        const stars = starsContainer.querySelectorAll('i');
        const movieId = starsContainer.getAttribute('data-movie-id');

        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                rateMovie(movieId, rating, starsContainer);
            });

            star.addEventListener('mouseover', function() {
                const rating = this.getAttribute('data-rating');
                highlightStars(stars, rating);
            });

            star.addEventListener('mouseout', function() {
                const currentRating = getCurrentRating(starsContainer);
                highlightStars(stars, currentRating);
            });
        });

        // هایلایت اولیه
        const currentRating = getCurrentRating(starsContainer);
        highlightStars(stars, currentRating);
    });

    // امتیازدهی به قسمت‌ها
    const episodeRatingStars = document.querySelectorAll('.episode-stars');
    episodeRatingStars.forEach(starsContainer => {
        const stars = starsContainer.querySelectorAll('i');
        const episodeId = starsContainer.getAttribute('data-episode-id');

        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                rateEpisode(episodeId, rating, starsContainer);
            });

            star.addEventListener('mouseover', function() {
                const rating = this.getAttribute('data-rating');
                highlightStars(stars, rating);
            });

            star.addEventListener('mouseout', function() {
                const currentRating = getCurrentRating(starsContainer);
                highlightStars(stars, currentRating);
            });
        });

        // هایلایت اولیه
        const currentRating = getCurrentRating(starsContainer);
        highlightStars(stars, currentRating);
    });
});

// تابع اضافه/حذف علاقه‌مندی
function toggleFavorite(movieId, button) {
    fetch('/toggle_favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movie_id: movieId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.action === 'added') {
            button.classList.add('active');
            showNotification('فیلم به علاقه‌مندی‌ها اضافه شد', 'success');
        } else {
            button.classList.remove('active');
            showNotification('فیلم از علاقه‌مندی‌ها حذف شد', 'info');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('خطا در برقراری ارتباط با سرور', 'error');
    });
}

// تابع اضافه/حذف علاقه‌مندی در صفحه جزئیات
function toggleFavoriteDetails(movieId, button) {
    fetch('/toggle_favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movie_id: movieId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.action === 'added') {
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-heart"></i> حذف از علاقه‌مندی‌ها';
            showNotification('فیلم به علاقه‌مندی‌ها اضافه شد', 'success');
        } else {
            button.classList.remove('active');
            button.innerHTML = '<i class="fas fa-heart"></i> افزودن به علاقه‌مندی‌ها';
            showNotification('فیلم از علاقه‌مندی‌ها حذف شد', 'info');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('خطا در برقراری ارتباط با سرور', 'error');
    });
}

// تابع حذف از علاقه‌مندی‌ها
function removeFromFavorites(movieId, movieCard) {
    fetch('/toggle_favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movie_id: movieId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.action === 'removed') {
            movieCard.style.opacity = '0.5';
            setTimeout(() => {
                movieCard.remove();
                // اگر کارتی باقی نمانده، پیام نشان دهیم
                const remainingCards = document.querySelectorAll('.movie-card');
                if (remainingCards.length === 0) {
                    const grid = document.querySelector('.movies-grid');
                    if (grid) {
                        const noFavoritesMsg = document.createElement('div');
                        noFavoritesMsg.className = 'no-favorites';
                        noFavoritesMsg.innerHTML = '<p>هنوز هیچ فیلمی به علاقه‌مندی‌های خود اضافه نکرده‌اید.</p>';
                        grid.parentNode.insertBefore(noFavoritesMsg, grid);
                    }
                }
            }, 300);
            showNotification('فیلم از علاقه‌مندی‌ها حذف شد', 'info');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('خطا در برقراری ارتباط با سرور', 'error');
    });
}

// تابع امتیازدهی به فیلم
function rateMovie(movieId, rating, starsContainer) {
    fetch('/rate_movie', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            movie_id: movieId,
            rating: parseInt(rating)
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // به‌روزرسانی نمایش امتیاز
            const ratingElement = starsContainer.closest('.movie-card')?.querySelector('.movie-rating span') ||
                                 starsContainer.closest('.movie-header-info')?.querySelector('.rating-result');

            if (ratingElement) {
                if (ratingElement.classList.contains('movie-rating')) {
                    ratingElement.textContent = data.new_rating;
                } else {
                    ratingElement.textContent = `امتیاز فعلی: ${data.new_rating}`;
                }
            }

            // به‌روزرسانی نمایش ستاره‌ها
            const stars = starsContainer.querySelectorAll('i');
            highlightStars(stars, rating);

            showNotification('امتیاز شما ثبت شد', 'success');
        } else {
            showNotification('خطا در ثبت امتیاز', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('خطا در برقراری ارتباط با سرور', 'error');
    });
}

// تابع امتیازدهی به قسمت
function rateEpisode(episodeId, rating, starsContainer) {
    fetch('/rate_episode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            episode_id: episodeId,
            rating: parseInt(rating)
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // به‌روزرسانی نمایش امتیاز قسمت
            const episodeCard = starsContainer.closest('.episode-card');
            const ratingElement = episodeCard.querySelector('.episode-rating span');

            if (ratingElement) {
                ratingElement.textContent = data.new_rating;
            }

            // به‌روزرسانی نمایش ستاره‌ها
            const stars = starsContainer.querySelectorAll('i');
            highlightStars(stars, rating);

            showNotification('امتیاز شما ثبت شد', 'success');
        } else {
            showNotification(data.error || 'خطا در ثبت امتیاز', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('خطا در برقراری ارتباط با سرور', 'error');
    });
}

// تابع هایلایت ستاره‌ها
function highlightStars(stars, rating) {
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

// تابع دریافت امتیاز فعلی
function getCurrentRating(starsContainer) {
    const activeStars = starsContainer.querySelectorAll('.fas.active').length;
    return activeStars || 0;
}

// تابع نمایش اعلان
function showNotification(message, type) {
    // ایجاد عنصر اعلان
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // استایل اعلان
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '1000';
    notification.style.textAlign = 'center';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

    // رنگ‌بندی بر اساس نوع
    if (type === 'success') {
        notification.style.backgroundColor = '#4caf50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    } else if (type === 'info') {
        notification.style.backgroundColor = '#2196f3';
    } else {
        notification.style.backgroundColor = '#333';
    }

    // اضافه کردن به صفحه
    document.body.appendChild(notification);

    // حذف خودکار بعد از 3 ثانیه
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}