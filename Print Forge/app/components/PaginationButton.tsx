'use client'
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const PaginationButton = ({ page, isActive, children }
    : { page: number, isActive: boolean, children: React.ReactNode }) => {

    const pathname = usePathname()

    const router = useRouter()

    const searchParams = useSearchParams()

    const handlePageChange = () => {
        const urlSearchParams = new URLSearchParams(searchParams.toString())
        urlSearchParams.set("page", page.toString())
        const url = `${pathname}?${urlSearchParams.toString()}`
        router.push(url)
    }

    return (
        <button
            onClick={handlePageChange}
            className={`px-3 py-1.5 text-sm rounded-md border cursor-pointer ${isActive ? "text-white bg-orange-400 border-orange-400" : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
            {children}
        </button>
    )
}

export default PaginationButton