import SortButton from "@/app/components/SortButton"
import type { TransitionStartFunction } from "react"

const SortControls = ({ startTransition }: { startTransition: TransitionStartFunction }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>

            <SortButton startTransition={startTransition} sort="alpha">A-Z</SortButton>

            <SortButton startTransition={startTransition} sort="popular">Popular</SortButton>

            <SortButton startTransition={startTransition} sort="recent">Most Recent</SortButton>

        </div>
    )
}

export default SortControls