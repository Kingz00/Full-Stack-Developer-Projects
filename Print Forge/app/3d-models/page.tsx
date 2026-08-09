import { getModels } from "@/lib/models"
import type { Model } from "@/lib/types"
import ModelsBrowser from "@/app/components/ModelsBrowser"

const ModelsPage = async ({ searchParams }: { searchParams: Promise<{ search?: string, sort?: string }> }) => {

    const search = (await searchParams).search?.toLowerCase() || ""

    const sort = (await searchParams).sort?.toLowerCase() || ""

    const models: Model[] = await getModels({ search, sort })

    return (
        <ModelsBrowser search={search} models={models} />
    )
}

export default ModelsPage