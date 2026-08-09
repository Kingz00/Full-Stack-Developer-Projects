'use client'
import Form from "next/form"
import type { TransitionStartFunction } from "react"
import { usePathname, useRouter } from "next/navigation"

const SearchForm = ({ startTransition, search, mobile }
    : { startTransition: TransitionStartFunction, search?: string, mobile?: boolean }) => {

    const pathname = usePathname()

    const router = useRouter()

    const inputClass = mobile
        ? "w-full rounded-full border border-gray-900 px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500"
        : "w-80 rounded-full border border-gray-900 bg-white px-5 py-3 text-sm outline-none transition placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"

    const handleSearch = (formData: FormData) => {
        const search = formData.get("search")?.toString().trim() || ""
        const url = search ? `${pathname}?search=${encodeURIComponent(search)}` : pathname
        startTransition(() => {
            router.push(url)
        })
    }

    return (
        <Form action={handleSearch}>

            <label htmlFor="search-model" className="sr-only">
                Search for a model
            </label>

            <input
                id="search-model"
                type="search"
                name="search"
                placeholder="E.g. dragon"
                className={inputClass}
                autoComplete="off"
                defaultValue={search}
            />

        </Form>
    )
}

export default SearchForm