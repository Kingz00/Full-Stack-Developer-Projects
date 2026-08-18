import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { projects } from "@/libs/data/projects"

type ProjectPageProps = {
    params: Promise<{
        slug: string
    }>
}

export function generateStaticParams() {
    return projects.map((project) => ({
        slug: project.slug,
    }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
    const { slug } = await params

    const project = projects.find((project) => project.slug === slug)

    if (!project) {
        return {
            title: "Project Not Found",
        }
    }

    return {
        title: project.title,
        description: project.description,
    }
}

export default async function ProjectPage({
    params,
}: ProjectPageProps) {
    const { slug } = await params

    const projectIndex = projects.findIndex(
        (project) => project.slug === slug,
    )

    if (projectIndex === -1) {
        notFound()
    }

    const project = projects[projectIndex]

    const previousProject =
        projectIndex > 0 ? projects[projectIndex - 1] : null

    const nextProject =
        projectIndex < projects.length - 1
            ? projects[projectIndex + 1]
            : null

    return (
        <main className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
            {/* Back navigation */}
            <Link
                href="/#work"
                className="mb-12 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
            >
                ← Back to Work
            </Link>

            {/* Project header */}
            <header className="mb-20">
                <p className="mb-4 text-sm font-medium tracking-widest text-gray-500">
                    {project.number}
                </p>

                <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {project.title}
                </h1>

                <p className="mb-8 max-w-3xl text-lg leading-relaxed text-gray-400 sm:text-xl">
                    {project.description}
                </p>

                {/* Technologies */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                        <span
                            key={technology}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300"
                        >
                            {technology}
                        </span>
                    ))}
                </div>

                {/* Project links */}
                <div className="flex flex-wrap gap-4">
                    <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-80"
                    >
                        Live Demo ↗
                    </a>

                    <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                        GitHub ↗
                    </a>
                </div>
            </header>

            {/* Project image */}
            <section className="mb-20">
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <Image
                        src={project.image}
                        alt={`${project.title} project screenshot`}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 1152px"
                    />
                </div>
            </section>

            {/* Overview */}
            <section className="mb-20">
                <p className="mb-3 text-sm font-medium tracking-widest text-gray-500">
                    01 / OVERVIEW
                </p>

                <h2 className="mb-6 text-3xl font-semibold text-white">
                    What I built
                </h2>

                <p className="max-w-3xl text-lg leading-relaxed text-gray-400">
                    {project.longDescription}
                </p>
            </section>

            {/* Features */}
            <section className="mb-20">
                <p className="mb-3 text-sm font-medium tracking-widest text-gray-500">
                    02 / FEATURES
                </p>

                <h2 className="mb-8 text-3xl font-semibold text-white">
                    Key features
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    {project.features.map((feature, index) => (
                        <div
                            key={feature}
                            className="rounded-xl border border-white/10 bg-white/5 p-5"
                        >
                            <span className="mb-3 block text-sm text-gray-500">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <p className="text-base text-gray-200">
                                {feature}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Technical details */}
            <section className="mb-20">
                <p className="mb-3 text-sm font-medium tracking-widest text-gray-500">
                    03 / TECHNICAL DETAILS
                </p>

                <h2 className="mb-8 text-3xl font-semibold text-white">
                    How it was built
                </h2>

                <div className="grid gap-6 sm:grid-cols-2">
                    {project.technicalDetails.frontend && (
                        <div>
                            <h3 className="mb-2 font-medium text-white">
                                Frontend
                            </h3>
                            <p className="leading-relaxed text-gray-400">
                                {project.technicalDetails.frontend}
                            </p>
                        </div>
                    )}

                    {project.technicalDetails.backend && (
                        <div>
                            <h3 className="mb-2 font-medium text-white">
                                Backend
                            </h3>
                            <p className="leading-relaxed text-gray-400">
                                {project.technicalDetails.backend}
                            </p>
                        </div>
                    )}

                    {project.technicalDetails.database && (
                        <div>
                            <h3 className="mb-2 font-medium text-white">
                                Database
                            </h3>
                            <p className="leading-relaxed text-gray-400">
                                {project.technicalDetails.database}
                            </p>
                        </div>
                    )}

                    {project.technicalDetails.other && (
                        <div>
                            <h3 className="mb-2 font-medium text-white">
                                Other
                            </h3>
                            <p className="leading-relaxed text-gray-400">
                                {project.technicalDetails.other}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Challenges */}
            <section className="mb-20">
                <p className="mb-3 text-sm font-medium tracking-widest text-gray-500">
                    04 / CHALLENGES
                </p>

                <h2 className="mb-8 text-3xl font-semibold text-white">
                    Challenges & solutions
                </h2>

                <div className="space-y-6">
                    {project.challenges.map((challenge, index) => (
                        <div
                            key={challenge}
                            className="flex gap-5 border-b border-white/10 pb-6"
                        >
                            <span className="shrink-0 text-sm text-gray-500">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <p className="leading-relaxed text-gray-400">
                                {challenge}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Project navigation */}
            <nav className="grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-2">
                {previousProject ? (
                    <Link
                        href={`/projects/${previousProject.slug}`}
                        className="group rounded-xl border border-white/10 p-6 transition-colors hover:bg-white/5"
                    >
                        <span className="mb-2 block text-sm text-gray-500">
                            ← Previous Project
                        </span>

                        <span className="text-xl font-medium text-white">
                            {previousProject.title}
                        </span>
                    </Link>
                ) : (
                    <div />
                )}

                {nextProject ? (
                    <Link
                        href={`/projects/${nextProject.slug}`}
                        className="group rounded-xl border border-white/10 p-6 text-left sm:text-right transition-colors hover:bg-white/5"
                    >
                        <span className="mb-2 block text-sm text-gray-500">
                            Next Project →
                        </span>

                        <span className="text-xl font-medium text-white">
                            {nextProject.title}
                        </span>
                    </Link>
                ) : null}
            </nav>
        </main>
    )
}