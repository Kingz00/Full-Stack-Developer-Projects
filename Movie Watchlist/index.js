import DOMPurify from 'dompurify'
import { genres } from './genres.js'

const movieListContainer = document.getElementById('movies-search-result')
const searchForm = document.getElementById('search-form')
const searchInput = document.getElementById('search-input')

let searchResult = []

// Constants
// const apiKey = import.meta.env.VITE_OMDb_API_KEY

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(searchForm)
    const cleanInput = DOMPurify.sanitize(formData.get('search-input'))
    console.log(cleanInput)
    searchInput.value = ''
    await renderSearchResult(cleanInput)
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

        const movieList = searchResult.map(movie => {

            const filteredGenres = genres.filter(genre => movie.genre_ids.includes(genre.id)).map(obj => obj.name).join(", ")

            return `
                <article class="movie-card">

                    <img src="https://image.tmdb.org/t/p/w185${movie.poster_path}" alt="${movie.title} image" class="movie-poster">

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

                            <button class="watchlist-btn">
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

        movieListContainer.innerHTML = movieList

        readMoreFn()

    } catch (err) {
        console.error(err)
        movieListContainer.innerHTML = `
            <div class="no-result container">
                <h2>${err.message}</h2>
            </div>
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