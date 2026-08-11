import { getModels, getModelCount } from "@/lib/models"
import type { Model } from "@/lib/types"
import ModelsBrowser from "@/app/components/ModelsBrowser"
import { MODELS_PER_PAGE } from "@/lib/constants"
import { getQueryParams } from "@/lib/utils"

const ModelsPage = async ({ searchParams }
    : { searchParams: Promise<{ search?: string, sort?: string, page?: string }> }) => {

    const queryParams = await searchParams

    const { search, sort, page } = getQueryParams(queryParams)

    const models: Model[] = await getModels({ search, sort, modelsPerPage: MODELS_PER_PAGE, page })

    const modelsCount: number = await getModelCount({ search })

    const totalPages = Math.ceil(modelsCount / MODELS_PER_PAGE)

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