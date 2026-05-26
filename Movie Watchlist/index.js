import DOMPurify from 'dompurify'

const movieListContainer = document.getElementById('movie-list-container')
const searchForm = document.getElementById('search-form')
const searchInput = document.getElementById('search-input')

// Constants
const apiKey = import.meta.env.VITE_OMDb_API_KEY

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(searchForm)
    const cleanInput = DOMPurify.sanitize(formData.get('search-input'))
    console.log(cleanInput)
    searchInput.value = ''
    await renderSearchResult(cleanInput)
})

const renderSearchResult = async (userInput) => {
    try{
        const response = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${userInput}&plot=full`)
        const data = await response.json()
        console.log(data)
    }
    catch(err){
        console.error(err)
    }
}
