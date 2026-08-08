'use client'
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const SortButton = ({ children, sort }: { children: React.ReactNode, sort: string }) => {

    const pathname = usePathname()

    const router = useRouter()

    const searchParams = useSearchParams()

    const isActive = searchParams.get("sort") === sort

    const handleSort = () => {
        const url = `${pathname}?sort=${sort}`
        router.push(url)
    }

    return (
        <button
            onClick={handleSort}
            className={`px-3 py-1.5 text-sm rounded-full border cursor-pointer ${isActive ? "text-white bg-orange-400 border-orange-400" : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
        >
            {children}
        </button>
    )
}

export default SortButton