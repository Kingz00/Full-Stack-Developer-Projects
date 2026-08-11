'use client'
import SearchForm from "@/app/components/SearchForm"
import ModelsGrid from "@/app/components/ModelsGrid"
import type { Model } from "@/lib/types"
import { useTransition } from "react"

type ModelsBrowserProps = {
    title?: string,
    search?: string,
    models: Model[],
    totalPages: number,
    currentPage: number
}

const ModelsBrowser = ({ title, search, models, totalPages, currentPage }
    : ModelsBrowserProps) => {

    const [isPending, startTransition] = useTransition()

    return (
        <>
            <div className="max-w-[600px] mx-auto mt-10 px-5 pb-6 lg:hidden">
                <SearchForm startTransition={startTransition} search={search} mobile />
            </div>
            <ModelsGrid
                isPending={isPending}
                search={search}
                title={title}
                models={models}
                totalPages={totalPages}
                currentPage={currentPage}
                startTransition={startTransition}
            />
        </>
    )
}

export default ModelsBrowser