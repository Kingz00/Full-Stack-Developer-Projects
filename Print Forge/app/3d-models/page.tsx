import { getAllModels } from "@/app/lib/models"
import ModelsGrid from "@/app/components/ModelsGrid"

const ModelsPage = async () => {
    const models = await getAllModels()

    return (
        <ModelsGrid title="3D Models" models={models} />
    )
}

export default ModelsPage