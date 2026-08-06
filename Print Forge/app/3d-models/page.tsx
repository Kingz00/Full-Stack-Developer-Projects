import { getAllModels } from "@/app/lib/models"
import type { Model } from "@/app/lib/models"
import ModelsGrid from "@/app/components/ModelsGrid"
import Form from 'next/form'

const ModelsPage = async ({ searchParams }: { searchParams: Promise<{ search?: string }> }) => {
    const models = await getAllModels()

    const { search } = await searchParams

    const filteredModels = search
        ? models.filter((model: Model) => model.name.toLowerCase().includes(search?.toLowerCase()) || model.description.toLowerCase().includes(search?.toLowerCase()))
        : models

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
                />

            </Form>
            <ModelsGrid title="3D Models" models={filteredModels} />
        </>
    )
}

export default ModelsPage