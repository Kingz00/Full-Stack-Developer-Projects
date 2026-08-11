import PaginationButton from "@/app/components/PaginationButton"

const PaginationControls = ({ totalPages, currentPage }: { totalPages: number, currentPage: number }) => {
    const pagesArray = Array.from({ length: totalPages }, (_, index) => index + 1)

    return (
        <div className="flex justify-center gap-1">
            {pagesArray.map((num) => (
                <PaginationButton key={num} page={num} isActive={num === currentPage} />
            ))}
        </div>
    )
}

export default PaginationControls