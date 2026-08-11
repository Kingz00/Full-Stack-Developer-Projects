const getQueryParams = ({ search, sort, page }
    : { search?: string, sort?: string, page?: string }) => {
    const cleanedSearch = search?.trim().toLowerCase() || ""

    const cleanedSort = sort?.toLowerCase() || ""

    const cleanedPage = Number(page) || 1

    return { search: cleanedSearch, sort: cleanedSort, page: cleanedPage }
}

export { getQueryParams }