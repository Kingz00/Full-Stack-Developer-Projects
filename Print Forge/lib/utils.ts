const getQueryParams = ({ search, sort, page }
    : { search?: string, sort?: string, page?: string }) => {
    const cleanedSearch = search?.trim().toLowerCase() || ""

    const allowedSortOptions = ['alpha', 'popular', 'recent']

    let cleanedSort
    if (sort === undefined) {
        cleanedSort = ""
    } else {
        cleanedSort = allowedSortOptions.includes(sort.toLowerCase()) ? sort.toLowerCase() : null
    }

    let cleanedPage
    if (page === undefined) {
        cleanedPage = 1
    } else {
        cleanedPage = Number.isNaN(Number(page)) ? 0 : Number(page)
    }

    return { search: cleanedSearch, sort: cleanedSort, page: cleanedPage }
}

export { getQueryParams }