import { genres } from './genres.js'

const watchListContainer = document.getElementById('watchlist-main')

// 1. Get the stringified array from localStorage
const watchlistData = localStorage.getItem("watchlistArray")

// 2. Parse it back into a real JavaScript array
let watchlistArray = watchlistData ? JSON.parse(watchlistData) : []

const readMoreFn = () => {
    document.querySelectorAll(".movie-description")
        .forEach(description => {

            const button =
                description.nextElementSibling;

            if (
                description.scrollHeight <=
                description.clientHeight + 5
            ) {
                button.style.display = "none";
            }

        });

    const readMoreButtons = document.querySelectorAll(".read-more-btn");

    readMoreButtons.forEach(button => {

        button.addEventListener("click", () => {

            const description = button.previousElementSibling;

            const isCollapsed = description.classList.contains("collapsed");

            if (isCollapsed) {

                description.classList.remove("collapsed");

                button.textContent = "Show less";

                button.setAttribute(
                    "aria-expanded",
                    "true"
                );

            } else {

                description.classList.add("collapsed");

                button.textContent = "Read more";

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    });
}

const renderWatchList = () => {
    if (watchlistArray.length === 0) {
        watchListContainer.innerHTML = `
            <main class="empty-watchlist">

                <div class="empty-watchlist-content">

                    <p class="empty-watchlist-message">
                        Your watchlist is looking a little empty...
                    </p>

                    <a href="index.html" class="add-movies-link">
                        <span class="add-icon">+</span>
                        Let's add some movies!
                    </a>

                </div>

            </main>
        `
        return
    }

    const watchList = watchlistArray.map(movie => {
        const filteredGenres = genres.filter(genre => movie.genre_ids.includes(genre.id)).map(obj => obj.name).join(", ")

        const posterUrl = movie.poster_path !== null ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : "./images/no-poster.png";

        return `
                        <article class="movie-card">
        
                            <img src="${posterUrl}" alt="${movie.title} image" class="movie-poster">
        
                            <div class="movie-info">
        
                                <div class="movie-title-row">
                                    <h2>${movie.title}</h2>
        
                                    <span class="rating">
                                        ⭐ ${movie.vote_average.toFixed(1)}
                                    </span>
                                </div>
        
                                <div class="movie-meta">
                                    <span>${movie.release_date}</span>
                                    <span>${filteredGenres}</span>
        
                                    <button class="watchlist-btn remove-btn" data-movie-id=${movie.id}>
                                        <span class="plus">-</span>
                                        Remove
                                    </button>
                                </div>
        
                                <div class="movie-description-container">
        
                                    <p class="movie-description collapsed">
                                        ${movie.overview}
                                    </p>
        
                                    <button
                                        class="read-more-btn"
                                        type="button"
                                        aria-expanded="false"
                                    >
                                        Read more
                                    </button>
        
                                </div>
        
                            </div>
        
                        </article>
                    `
    }).join("")

    watchListContainer.classList.remove("empty-watchlist")

    watchListContainer.innerHTML = watchList

    readMoreFn()
}

renderWatchList()

const removeMovie = (movieId) => {
    watchlistArray = watchlistArray.filter(movie => movie.id !== parseInt(movieId))

    // Save the updated array back to localStorage
    localStorage.setItem("watchlistArray", JSON.stringify(watchlistArray));

    renderWatchList()
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
        removeMovie(e.target.dataset.movieId)
    }
})