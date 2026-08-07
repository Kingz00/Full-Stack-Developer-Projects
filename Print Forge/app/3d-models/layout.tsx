import type React from "react"
import { getCategories } from "@/lib/categories"
import ModelsNavLink from "@/app/components/ModelsNavLink"

const ModelsPageLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const categories = await getCategories()

    return (
        <div
            className="lg:mx-auto lg:max-w-[1600px] lg:gap-12 lg:px-10 lg:py-12 lg:grid lg:grid-cols-[180px_minmax(0,1fr)]"
        >
            <ModelsNavLink categories={categories} />
            {children}
        </div>
    )
}

export default ModelsPageLayout