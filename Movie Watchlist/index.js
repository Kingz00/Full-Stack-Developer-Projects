import DOMPurify from 'dompurify'
import { genres } from './genres.js'

const movieListContainer = document.getElementById('movies-search-result')
const searchForm = document.getElementById('search-form')
const searchInput = document.getElementById('search-input')

// const apiKey = import.meta.env.VITE_OMDb_API_KEY

let searchResult = []

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(searchForm)
    const cleanInput = DOMPurify.sanitize(formData.get('search-input'))
    searchInput.value = ''
    await renderSearchResult(cleanInput)
})

document.addEventListener('click', (e) => {
    if (e.target.className === 'watchlist-btn') {
        addToWatchList(e.target.dataset.movieId)
    }
})

const getDataFromAPI = async (userInput) => {

    try {
        // OMDB Fetch Request
        // const response = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${userInput}&plot=full`)

        // TMDB Fetch Request
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userInput: userInput })
        })
        const data = await response.json()
        return data.message

    }
    catch (err) {
        console.error(err)
        return err.message
    }
}

const renderSearchResult = async (userInput) => {
    try {

        searchResult = await getDataFromAPI(userInput)

        if (searchResult.length === 0) {
            movieListContainer.innerHTML = `
                <main class="no-results">

                    <p class="no-results-message">
                        Unable to find what you're looking for.
                        Please try another search.
                    </p>

                </main>
            `
            return
        }

        const movieList = searchResult.map(movie => {

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
                                <span class="plus">+</span>
                                Watchlist
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

        movieListContainer.classList.remove('empty-state')

        movieListContainer.classList.remove('no-results')

        movieListContainer.classList.add('movies')

        movieListContainer.innerHTML = movieList

        readMoreFn()

    } catch (err) {
        console.error(err)
        movieListContainer.innerHTML = `
            <main class="no-results">

                <p class="no-results-message">
                    Something went wrong. Please try again later.
                </p>

            </main>
        `
    }
}

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

const addToWatchList = (movieId) => {
    // 1. Initialize or retrieve the watchList array
    const watchlistArray = JSON.parse(localStorage.getItem("watchlistArray")) || [];

    const selectedMovie = searchResult.filter(movie => movie.id === parseInt(movieId))[0]
    watchlistArray.push(selectedMovie)

    // 3. Save the updated array back to localStorage
    localStorage.setItem("watchlistArray", JSON.stringify(watchlistArray));
}