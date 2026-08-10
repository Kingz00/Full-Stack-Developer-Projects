import NotFoundUI from "@/app/components/NotFoundUI";

const CategoryNotFound = () => {
    return (
        <NotFoundUI
            title="Category Not Found"
            subTitle="Oops, category doesn't exist"
            linkText="See all models"
            linkHref="/3d-models"
        />
    )
}

export default CategoryNotFound