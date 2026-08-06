import ModelsGrid from "@/app/components/ModelsGrid"
import { getCategoryBySlug } from "@/app/lib/categories"
import { getModelsByCategory } from "@/app/lib/models"

const Category = async ({ params }: { params: Promise<{ categoryName: string }> }) => {
    const { categoryName } = await params

    const category = getCategoryBySlug(categoryName)

    const models = await getModelsByCategory(category.slug)

    return <ModelsGrid title={category.displayName} models={models} />
}

export default Category