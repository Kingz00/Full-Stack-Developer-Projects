import { getModels } from "@/lib/models"
import type { Model } from "@/lib/types"
import ModelsGrid from "@/app/components/ModelsGrid"
import Form from 'next/form'

const ModelsPage = async ({ searchParams }: { searchParams: Promise<{ search?: string, sort?: string }> }) => {

    const search = (await searchParams).search?.toLowerCase() || ""

    const sort = (await searchParams).sort?.toLowerCase() || ""

    const models: Model[] = await getModels(search, sort)

    return (
        <>
            <Form action="/3d-models" className="max-w-[600px] mx-auto mt-10 px-5 pb-6 lg:hidden">

                <label htmlFor="search-model" className="sr-only">
                    Search for a model
                </label>

                <input
                    id="search-model"
                    type="search"
                    name="search"
                    placeholder="Search for a model"
                    className="w-full rounded-full border border-gray-900 px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                    autoComplete="off"
                    defaultValue={search}
                />

            </Form>
            <ModelsGrid search={search} title="3D Models" models={models} />
        </>
    )
}

export default ModelsPage