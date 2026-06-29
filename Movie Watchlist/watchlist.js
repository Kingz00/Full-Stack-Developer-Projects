import { genres } from './genres.js'

const watchListContainer = document.getElementById('watchlist-main')

// 1. Get the stringified array from localStorage
const watchlistData = localStorage.getItem("watchlistArray")

// 2. Parse it back into a real JavaScript array
const watchlistArray = watchlistData ? JSON.parse(watchlistData) : []

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
    if (watchlistArray.length < 1) {
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
        
                                    <button class="watchlist-btn" data-movie-id=${movie.id}>
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

    watchListContainer.innerHTML = watchList

    readMoreFn()
}

renderWatchList()