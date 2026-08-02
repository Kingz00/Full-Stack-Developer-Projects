import { CubeTransparentIcon, GlobeAltIcon, FlagIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import HeroImageSquare from '@/public/hero-image-square.png'

const About = () => {
    return (
        <main className="bg-white">

            {/* About Hero */}
            <section className="mx-auto max-w-7xl px-5 py-10 lg:px-10 lg:py-20">

                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">

                    {/* Image */}
                    <div>
                        <Image
                            src={HeroImageSquare}
                            alt="PrintForge Community - A group of makers collaborating on 3D printing projects"
                            className="w-full rounded-md object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div>

                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                            About PrintForge
                        </p>

                        <h1
                            className="mt-4 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                            Empowering<br />makers<br />worldwide
                        </h1>

                        <p className="mt-8 text-lg leading-relaxed text-gray-700 md:text-xl">
                            Founded in 2023, PrintForge has quickly become the go-to platform
                            for 3D printing enthusiasts, makers, and professional designers
                            to share and discover amazing STL files for 3D printing.
                        </p>

                        <p className="mt-8 text-lg leading-relaxed text-gray-700 md:text-xl">
                            Our mission is to foster a vibrant community where creativity
                            meets technology, enabling anyone to bring their ideas to life
                            through 3D printing.
                        </p>

                    </div>

                </div>

            </section>

            {/* Features */}

            <section className="border-y border-gray-200">

                <div
                    className="mx-auto max-w-7xl px-5 py-12 grid gap-12 md:grid-cols-2 lg:grid-cols-3 lg:divide-x lg:divide-gray-300"
                >

                    {/* Feature */}

                    <div className="flex gap-4 lg:px-8">

                        <CubeTransparentIcon className="mt-1 h-7 w-7 shrink-0" />

                        <div>

                            <h3 className="text-3xl font-bold text-gray-900">
                                100K+ Models
                            </h3>

                            <p className="mt-3 text-lg leading-relaxed text-gray-600">
                                Access our vast library of community-created 3D models,
                                from practical tools to artistic creations.
                            </p>

                        </div>

                    </div>

                    {/* Feature */}

                    <div className="flex gap-4 lg:px-8">

                        <GlobeAltIcon className="mt-1 h-7 w-7 shrink-0" />

                        <div>

                            <h3 className="text-3xl font-bold text-gray-900">
                                Active Community
                            </h3>

                            <p className="mt-3 text-lg leading-relaxed text-gray-600">
                                Join thousands of makers who share tips, provide feedback,
                                and collaborate on projects.
                            </p>

                        </div>

                    </div>

                    {/* Feature */}

                    <div className="flex gap-4 lg:px-8">

                        <FlagIcon className="mt-1 h-7 w-7 shrink-0" />

                        <div>

                            <h3 className="text-3xl font-bold text-gray-900">
                                Free to Use
                            </h3>

                            <p className="mt-3 text-lg leading-relaxed text-gray-600">
                                Most models are free to download, with optional premium
                                features for power users.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

            {/* Vision */}

            <section className="mx-auto max-w-4xl px-5 py-16 lg:py-24">

                <h2 className="text-5xl font-extrabold tracking-tight md:text-6xl">
                    Our vision
                </h2>

                <p className="mt-8 text-lg leading-relaxed text-gray-700 md:text-xl">
                    At PrintForge, we believe that 3D printing is revolutionizing the way
                    we create, prototype, and manufacture. Our platform serves as a bridge
                    between designers and makers, enabling the sharing of knowledge and
                    creativity that pushes the boundaries of what's possible with 3D
                    printing.
                </p>

                <div className="my-12 flex justify-center">
                    <div className="h-px w-48 bg-gray-400"></div>
                </div>

                <p className="text-lg leading-relaxed text-gray-700 md:text-xl">
                    Whether you're a hobbyist looking for your next weekend project, an
                    educator seeking teaching materials, or a professional designer
                    wanting to share your creations, PrintForge provides the tools and
                    community to support your journey in 3D printing.
                </p>

            </section>

        </main>
    )
}

export default About