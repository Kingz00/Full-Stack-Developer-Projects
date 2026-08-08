import { getModelById } from "@/lib/models"
import { FaRegHeart } from "react-icons/fa6"
import Image from "next/image"
import placeHolderImage from '@/public/placeholder.png'
import Link from "next/link"

const ModelDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {

    const { id } = await params

    const model = await getModelById(id)

    const dateString = new Date(model.dateAdded)

    return (
        <main className="bg-white">

            {/* Main */}

            <section
                className="mx-auto max-w-7xl px-5 py-10 lg:grid lg:grid-cols-[2fr_1fr] lg:gap-10 lg:px-14 lg:pb-20">
                {/* Left */}

                <div>

                    {/* Mobile Back */}

                    <div className="mb-8 text-center lg:hidden">

                        <Link
                            href="/3d-models"
                            className="text-sm uppercase tracking-[0.18em] text-gray-600"
                        >
                            Back to Overview
                        </Link>

                    </div>

                    <Image
                        width={500}
                        height={500}
                        src={model.image}
                        alt={`3D model of ${model.name}`}
                        className="w-full rounded-md object-cover"
                    />

                </div>

                {/* Right */}

                <aside className="mt-10 lg:mt-0 flex flex-col">

                    {/* Desktop Back */}

                    <Link
                        href="/3d-models"
                        className="hidden lg:inline-block text-sm uppercase tracking-[0.18em] text-gray-600"
                    >
                        Back to Overview
                    </Link>

                    <div className="mt-10 flex items-center gap-3">

                        <FaRegHeart
                            className="h-11 w-11 stroke-1 text-gray-600"
                        />

                        <span className="text-5xl font-light text-gray-600">
                            {model.likes}
                        </span>

                    </div>

                    <h1
                        className="mt-6 text-6xl font-extrabold leading-none tracking-tight lg:text-5xl"
                    >
                        {model.name}
                    </h1>

                    {/* Tags */}

                    <div className="mt-8 flex flex-wrap gap-3">

                        <span
                            className="rounded-full border border-gray-400 px-5 py-2 text-lg"
                        >
                            3D-printer
                        </span>

                        <span
                            className="rounded-full border border-gray-400 px-5 py-2 text-lg"
                        >
                            Upgrade
                        </span>

                    </div>

                    <p
                        className="mt-8 text-3xl leading-relaxed text-gray-800 lg:text-2xl"
                    >
                        {model.description}
                    </p>

                    {/* Push date to bottom on desktop */}

                    <div className="flex-1"></div>

                    <time dateTime={model.dateAdded}
                        className="mt-28 text-xl text-gray-700 lg:mt-12 lg:text-lg"
                    >
                        Added on {dateString.toLocaleDateString()}
                    </time>

                </aside>

            </section>

        </main>
    )
}

export default ModelDetailPage