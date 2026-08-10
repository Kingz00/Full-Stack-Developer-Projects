import NotFoundUI from "@/app/components/NotFoundUI";

const ModelNotFound = () => {
    return (
        <NotFoundUI
            title="Model Not Found"
            subTitle="We can't find the requested model"
            linkText="See all models"
            linkHref="/3d-models"
        />
    )
}

export default ModelNotFound