import { getModels, getModelCount } from "@/lib/models"
import type { Model } from "@/lib/types"
import ModelsBrowser from "@/app/components/ModelsBrowser"
import { MODELS_PER_PAGE } from "@/lib/constants"
import { getQueryParams } from "@/lib/utils"
import { redirect } from "next/navigation"

const ModelsPage = async ({ searchParams }
    : { searchParams: Promise<{ search?: string, sort?: string, page?: string }> }) => {

    const queryParams = await searchParams

    const { search, sort, page } = getQueryParams(queryParams)

    const modelsCount: number = await getModelCount({ search })

    const totalPages = Math.max(1, Math.ceil(modelsCount / MODELS_PER_PAGE))

    if (page < 1 || page > totalPages || sort === null) {
        redirect("/3d-models")
    }

    const models: Model[] = await getModels({ search, sort, modelsPerPage: MODELS_PER_PAGE, page })

    return (
        <ModelsBrowser
            search={search}
            models={models}
            totalPages={totalPages}
            currentPage={page}
        />
    )
}

export default ModelsPage