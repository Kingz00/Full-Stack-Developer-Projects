import SortButton from "@/app/components/SortButton"

const SortControls = () => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>

            <SortButton sort="alpha">A-Z</SortButton>

            <SortButton sort="popular">Popular</SortButton>

            <SortButton sort="recent">Most Recent</SortButton>

        </div>
    )
}

export default SortControls