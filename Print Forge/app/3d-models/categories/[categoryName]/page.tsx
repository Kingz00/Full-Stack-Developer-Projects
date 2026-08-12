import ModelsBrowser from "@/app/components/ModelsBrowser"
import { getModels, getModelCount } from "@/lib/models"
import { getCategoryBySlug } from "@/lib/categories"
import { notFound } from "next/navigation"
import { MODELS_PER_PAGE } from "@/lib/constants"
import { getQueryParams } from "@/lib/utils"
import { redirect } from "next/navigation"

const Category = async ({ params, searchParams }
    : {
        params: Promise<{ categoryName: string }>,
        searchParams: Promise<{ sort?: string, search?: string, page?: string }>
    }) => {
    const { categoryName } = await params

    const queryParams = await searchParams

    const { search, sort, page } = getQueryParams(queryParams)

    const modelsCount = await getModelCount({ search, categorySlug: categoryName })

    const totalPages = Math.max(1, Math.ceil(modelsCount / MODELS_PER_PAGE))

    if (page < 1 || page > totalPages || sort === null) {
        redirect(`/3d-models/categories/${categoryName}`)
    }

    const models = await getModels({ categorySlug: categoryName, sort, search, page, modelsPerPage: MODELS_PER_PAGE })

    const category = await getCategoryBySlug(categoryName)

    if (!category) {
        notFound()
    }

    return <ModelsBrowser
        title={category.name}
        models={models}
        search={search}
        currentPage={page}
        totalPages={totalPages}
    />
}

export default Category