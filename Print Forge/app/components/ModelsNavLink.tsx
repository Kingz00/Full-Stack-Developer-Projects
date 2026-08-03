import Link from "next/link";
import type { Category } from "@/app/lib/categories";

const ModelsNavLink = ({ categories }: { categories: Category[] }) => {
    return (
        <>
            {/* Mobile */}
            <div className="lg:hidden">
                <nav className="border-b border-gray-200 bg-white">
                    <div className="overflow-x-auto scrollbar-hide">
                        <ul className="flex min-w-max items-center gap-8 px-5 py-5 text-sm uppercase tracking-wider">

                            <li>
                                <Link href="/3d-models" className="text-gray-700 hover:text-orange-500">
                                    All
                                </Link>
                            </li>

                            {categories.map(item => (
                                <li key={item.slug}>
                                    <Link
                                        href={`/3d-models/categories/${item.slug}`}
                                        className="text-gray-700 hover:text-orange-500"
                                    >
                                        {item.displayName}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="px-5 pb-6">

                        <input
                            type="search"
                            placeholder="Search for a model"
                            className="w-full rounded-full border border-gray-900 px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                        />

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
                                    className="group flex items-center gap-3 text-sm font-medium uppercase tracking-[0.15em] text-gray-600 hover:text-orange-500"
                                >
                                    <span className="h-5 w-px bg-orange-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                                    All
                                </Link>
                            </li>

                            {categories.map(item => (
                                <li key={item.slug}>
                                    <Link
                                        href={`/3d-models/categories/${item.slug}`}
                                        className="group flex items-center gap-3 text-sm font-medium uppercase tracking-[0.15em] text-gray-600 hover:text-orange-500"
                                    >
                                        <span className="h-5 w-px bg-orange-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                                        {item.displayName}
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