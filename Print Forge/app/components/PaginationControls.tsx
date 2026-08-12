import PaginationButton from "@/app/components/PaginationButton"

const PaginationControls = ({ totalPages, currentPage }: { totalPages: number, currentPage: number }) => {
    let pagesArray: number[] = []

    if (totalPages <= 3 && totalPages > 0) {
        pagesArray = Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    if (totalPages > 0) {

        if (currentPage === 1) {
            pagesArray = [1, 2, 3]
        } else if (currentPage === totalPages) {
            pagesArray = [totalPages - 2, totalPages - 1, totalPages];
        } else {
            pagesArray = [currentPage - 1, currentPage, currentPage + 1];
        }
    }

    return (
        <div className="flex justify-center gap-1">
            {currentPage > 1 && totalPages > 3 &&
                <PaginationButton page={1} isActive={false}>{"<<"}</PaginationButton>
            }
            {pagesArray.map((num) => (
                <PaginationButton key={num} page={num} isActive={num === currentPage}>{num}</PaginationButton>
            ))}
            {currentPage !== totalPages && totalPages > 3 &&
                <PaginationButton page={totalPages} isActive={false}>{">>"}</PaginationButton>
            }
        </div>
    )
}

export default PaginationControls