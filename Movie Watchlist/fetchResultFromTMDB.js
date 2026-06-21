const apiKey = process.env.TMDB_ACCESS_TOKEN

const getSearchResultFromTMDB = async (query) => {

    try {

        // The encodeURIComponent() method is a built-in JavaScript function that converts strings into a safe format for URLs. It replaces special characters (like spaces, question marks, and ampersands) with their URL-encoded equivalents (like %20, %3F, and %26).
        const tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        };

        // Fetch request to TMDB
        const response = await fetch(tmdbUrl, options)
        const data = await response.json()
        return data

    } catch (err) {
        console.error(err)
        return { message: "Error fetching results from TMDB" }
    }
}

export { getSearchResultFromTMDB }
