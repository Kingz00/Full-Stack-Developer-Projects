import ModelsBrowser from "@/app/components/ModelsBrowser"
import { getModels } from "@/lib/models"
import { getCategoryBySlug } from "@/lib/categories"

const Category = async ({ params, searchParams }
    : {
        params: Promise<{ categoryName: string }>,
        searchParams: Promise<{ sort?: string, search?: string }>
    }) => {
    const { categoryName } = await params

    const sort = (await searchParams).sort?.toLowerCase() || ""

    const search = (await searchParams).search?.toLowerCase() || ""

    const models = await getModels({ categorySlug: categoryName, sort, search })

    const category = await getCategoryBySlug(categoryName)

    return <ModelsBrowser title={category[0].name} models={models} search={search} />
}

export default Category