import ModelCard from "@/app/components/ModelCard"
import type { Model } from "@/app/lib/models"
import Form from "next/form"

type ModelsGridProps = {
    title: string,
    models: Model[]
}

const ModelsGrid = ({ title, models }: ModelsGridProps) => {
    return (
        <main className="container px-4 py-8 mx-auto">
            <div className="mb-10 flex items-center justify-between">

                <h1
                    className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
                >
                    {title}
                </h1>

                {/* Desktop Search */}
                <Form action="/3d-models" className="hidden lg:block">
                    <label htmlFor="search-model" className="sr-only">
                        Search for a model
                    </label>

                    <input
                        id="search-model"
                        type="search"
                        name="search"
                        placeholder="Search for a model"
                        className=" w-80 rounded-full border border-gray-900 bg-white px-5 py-3 text-sm outline-none transition placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        autoComplete="off"
                    />
                </Form>

            </div>
            <section
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                role="region"
                aria-label="3D Models Gallery"
            >
                {models.map((model: Model) => (
                    <ModelCard key={model.id} model={model} />
                ))}
            </section>
        </main>
    )
}

export default ModelsGrid