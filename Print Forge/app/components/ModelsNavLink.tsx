'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/types";


const ModelsNavLink = ({ categories }: { categories: Category[] }) => {
    const pathName = usePathname()

    return (
        <>
            {/* Mobile */}
            <div className="lg:hidden">
                <nav className="border-b border-gray-200 bg-white">
                    <div className="overflow-x-auto scrollbar-hide">
                        <ul className="flex min-w-max items-center gap-8 px-5 py-5 text-sm uppercase tracking-wider">

                            <li>
                                <Link
                                    href="/3d-models"
                                    className={`hover:text-orange-500 ${pathName === "/3d-models" ? "text-orange-500" : "text-gray-700"}`}>
                                    All
                                </Link>
                            </li>

                            {categories.map(item => (
                                <li key={item.id}>
                                    <Link
                                        href={`/3d-models/categories/${item.slug}`}
                                        className={`hover:text-orange-500 ${pathName === `/3d-models/categories/${item.slug}` ? "text-orange-500" : "text-gray-700"}`}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </div>

            {/* Desktop */}
            <div className="hidden lg:grid lg:grid-cols-[180px_1fr] lg:gap-12">

                {/* Sidebar */}
                <aside>
                    <nav
                        aria-label="Model categories"
                        className="sticky top-28"
                    >

                        <ul className="space-y-6">

                            <li>
                                <Link
                                    href="/3d-models"
                                    className={`group flex items-center gap-3 text-sm font-medium uppercase tracking-[0.15em] hover:text-orange-500 ${pathName === "/3d-models" ? "text-orange-500" : "text-gray-600"}`}
                                >
                                    <span className={`h-5 w-px bg-orange-500 transition-opacity duration-200 group-hover:opacity-100 ${pathName === "/3d-models" ? "opacity-100" : "opacity-0"}`}></span>
                                    All
                                </Link>
                            </li>

                            {categories.map(item => (
                                <li key={item.id}>
                                    <Link
                                        href={`/3d-models/categories/${item.slug}`}
                                        className={`group flex items-center gap-3 text-sm font-medium uppercase tracking-[0.15em] hover:text-orange-500 ${pathName === `/3d-models/categories/${item.slug}` ? "text-orange-500" : "text-gray-600"}`}
                                    >
                                        <span className={`h-5 w-px bg-orange-500 transition-opacity duration-200 group-hover:opacity-100 ${pathName === `/3d-models/categories/${item.slug}` ? "opacity-100" : "opacity-0"}`}></span>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}

                        </ul>

                    </nav>
                </aside>

            </div>
        </>
    )
}

export default ModelsNavLink