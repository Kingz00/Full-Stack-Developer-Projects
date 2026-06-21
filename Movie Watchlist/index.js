import DOMPurify from 'dompurify'
import { genres } from './genres.js'

const movieListContainer = document.getElementById('movie-list-container')
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
                <div class="search-result-container">
                    <img class="movie-image" src="https://image.tmdb.org/t/p/w185${movie.poster_path}" alt="${movie.title} image">
                    <div class="right">
                        <div class="movie-title-container">
                            <h2>${movie.title}</h2>
                            <h3>${movie.vote_average.toFixed(1)}</h3>
                        </div>
                        <div class="movie-genre-container">
                            <h3>${movie.release_date}</h3>
                            <h3>${filteredGenres}</h3>
                            <button class="add-btn">
                                <i class="fa-solid fa-circle-plus"></i>
                                Watchlist
                            </button>
                        </div>
                        <div class="movie-detail-container">
                            <p>${movie.overview}</p>
                        </div>
                    </div>
                </div>
            `
        }).join("")

        movieListContainer.innerHTML = movieList

    } catch (err) {
        console.error(err)
        movieListContainer.innerHTML = `
            <div class="no-result container">
                <h2>${err.message}</h2>
            </div>
        `
    }
}
