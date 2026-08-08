import ModelsGrid from "@/app/components/ModelsGrid"
import { getModelsByCategorySlug } from "@/lib/models"
import { getCategoryBySlug } from "@/lib/categories"

const Category = async ({ params }: { params: Promise<{ categoryName: string }> }) => {
    const { categoryName } = await params

    const models = await getModelsByCategorySlug(categoryName)

    const category = await getCategoryBySlug(categoryName)

    return <ModelsGrid title={category[0].name} models={models} />
}

export default Category