import ModelCard from "@/app/components/ModelCard"
import SearchForm from "@/app/components/SearchForm"
import type { Model } from "@/lib/types"
import SortControls from "@/app/components/SortControls"
import LoadingUI from "@/app/components/LoadingUI"
import type { TransitionStartFunction } from "react"

type ModelsGridProps = {
    isPending: boolean,
    startTransition: TransitionStartFunction,
    search?: string,
    title?: string,
    models: Model[]
}

const ModelsGrid = ({ isPending, search, title, models, startTransition }: ModelsGridProps) => {
    let displayedTitle: string = '3D Models'

    if (title) displayedTitle = title

    if (search) displayedTitle = `Search results for "${search}"`

    return (
        <main className="container px-4 py-8 mx-auto">
            <div className="mb-5 flex items-center justify-between">

                <h1
                    className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
                >
                    {displayedTitle}
                </h1>

                {/* Desktop Search */}
                <div className="hidden lg:block">
                    <SearchForm startTransition={startTransition} search={search} />
                </div>

            </div>

            <SortControls startTransition={startTransition} />

            {isPending ? <LoadingUI>Loading Models...</LoadingUI> :
                <section
                    className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    role="region"
                    aria-label="3D Models Gallery"
                >
                    {models.map((model: Model) => (
                        <ModelCard key={model.id} model={model} />
                    ))}
                </section>}
        </main>
    )
}

export default ModelsGrid