
const Category = async ({ params }: { params: Promise<{ categoryName: string }> }) => {
    const { categoryName } = await params

    return <h1>This is {categoryName} page</h1>
}

export default Category