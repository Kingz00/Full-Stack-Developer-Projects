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

export async function generateMetadata({
    params
}: ProjectPageProps): Promise<Metadata> {
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
        <main className="mx-auto max-w-7xl px-6 pb-24 pt-24 sm:px-8 lg:px-12">
            {/* Hero */}
            <header className="mb-20 border-b border-white/10 pb-16">
                <div className="mb-8 flex items-center gap-4">
                    <span className="text-sm text-zinc-500">
                        {project.number}
                    </span>

                    <span className="h-px w-10 bg-white/20" />

                    <span className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                        Project
                    </span>
                </div>

                <h1 className="max-w-5xl text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-8xl">
                    {project.title}
                </h1>

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                    <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
                        {project.description}
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-3 lg:max-w-xs lg:justify-end">
                        {project.technologies.map((technology) => (
                            <span
                                key={technology}
                                className="text-sm text-zinc-500"
                            >
                                {technology}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                    <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-orange-500"
                    >
                        Live Demo
                        <span aria-hidden="true">↗</span>
                    </a>

                    <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-orange-500 hover:bg-orange-500 hover:text-black"
                    >
                        GitHub
                        <span aria-hidden="true">↗</span>
                    </a>
                </div>
            </header>

            {/* Project image */}
            <section className="mb-24">
                <div className="relative aspect-video overflow-hidden border border-white/10 bg-zinc-900">
                    <Image
                        src={project.image}
                        alt={`${project.title} project screenshot`}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1280px) 100vw, 1280px"
                    />
                </div>
            </section>

            {/* Overview */}
            <section className="mb-24 grid gap-8 lg:grid-cols-[220px_1fr]">
                <SectionLabel number="01" label="Overview" />

                <div>
                    <h2 className="mb-6 max-w-3xl text-3xl font-medium tracking-tight text-white sm:text-4xl">
                        What I built
                    </h2>

                    <p className="max-w-3xl text-lg leading-relaxed text-zinc-400">
                        {project.longDescription}
                    </p>
                </div>
            </section>

            {/* Features */}
            <section className="mb-24 grid gap-8 border-t border-white/10 pt-16 lg:grid-cols-[220px_1fr]">
                <SectionLabel number="02" label="Features" />

                <div>
                    <h2 className="mb-10 max-w-3xl text-3xl font-medium tracking-tight text-white sm:text-4xl">
                        What the application does
                    </h2>

                    <div className="grid border-t border-white/10 sm:grid-cols-2">
                        {project.features.map((feature, index) => (
                            <div
                                key={feature}
                                className="border-b border-white/10 py-5 sm:pr-8"
                            >
                                <div className="flex gap-5">
                                    <span className="text-sm text-zinc-600">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    <p className="text-base text-zinc-300">
                                        {feature}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Screenshots */}
            <section className="mb-24 grid gap-8 border-t border-white/10 pt-16 lg:grid-cols-[220px_1fr]">
                <SectionLabel number="03" label="Screenshots" />

                <div>
                    <h2 className="mb-10 max-w-3xl text-3xl font-medium tracking-tight text-white sm:text-4xl">
                        See it in action
                    </h2>

                    <div className="space-y-12">
                        {project.screenshots.map((screenshot) => (
                            <figure key={screenshot.src}>
                                <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                                    <Image
                                        src={screenshot.src}
                                        alt={screenshot.alt}
                                        width={1600}
                                        height={1000}
                                        className="h-auto w-full object-contain"
                                        sizes="(max-width: 1024px) 100vw, 1000px"
                                    />
                                </div>

                                <figcaption className="mt-3 text-sm leading-relaxed text-zinc-500">
                                    {screenshot.caption}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technical details */}
            <section className="mb-24 grid gap-8 border-t border-white/10 pt-16 lg:grid-cols-[220px_1fr]">
                <SectionLabel number="04" label="Technical" />

                <div>
                    <h2 className="mb-10 max-w-3xl text-3xl font-medium tracking-tight text-white sm:text-4xl">
                        How it was built
                    </h2>

                    <div className="divide-y divide-white/10 border-y border-white/10">
                        {project.technicalDetails.frontend && (
                            <TechnicalRow
                                label="Frontend"
                                value={project.technicalDetails.frontend}
                            />
                        )}

                        {project.technicalDetails.backend && (
                            <TechnicalRow
                                label="Backend"
                                value={project.technicalDetails.backend}
                            />
                        )}

                        {project.technicalDetails.database && (
                            <TechnicalRow
                                label="Database"
                                value={project.technicalDetails.database}
                            />
                        )}

                        {project.technicalDetails.other && (
                            <TechnicalRow
                                label="Tools & Other"
                                value={project.technicalDetails.other}
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Challenges */}
            <section className="mb-24 grid gap-8 border-t border-white/10 pt-16 lg:grid-cols-[220px_1fr]">
                <SectionLabel number="05" label="Challenges" />

                <div>
                    <h2 className="mb-10 max-w-3xl text-3xl font-medium tracking-tight text-white sm:text-4xl">
                        Challenges & solutions
                    </h2>

                    <div className="space-y-0 border-t border-white/10">
                        {project.challenges.map((challenge, index) => (
                            <div
                                key={challenge}
                                className="grid gap-4 border-b border-white/10 py-6 sm:grid-cols-[60px_1fr]"
                            >
                                <span className="text-sm text-zinc-600">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <p className="max-w-3xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                                    {challenge}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Project navigation */}
            <nav className="grid border-t border-white/10 sm:grid-cols-2">
                {previousProject ? (
                    <Link
                        href={`/projects/${previousProject.slug}`}
                        className="group border-b border-white/10 py-8 transition-colors hover:bg-orange-500 sm:border-r sm:pr-8"
                    >
                        <span className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-600 group-hover:text-black/60">
                            ← Previous Project
                        </span>

                        <span className="text-2xl font-medium text-white transition-colors group-hover:text-black sm:text-3xl">
                            {previousProject.title}
                        </span>
                    </Link>
                ) : (
                    <div className="hidden sm:block" />
                )}

                {nextProject ? (
                    <Link
                        href={`/projects/${nextProject.slug}`}
                        className="group border-b border-white/10 py-8 text-left transition-colors hover:bg-orange-500 sm:pl-8 sm:text-right"
                    >
                        <span className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-600 group-hover:text-black/60">
                            Next Project →
                        </span>

                        <span className="text-2xl font-medium text-white transition-colors group-hover:text-black sm:text-3xl">
                            {nextProject.title}
                        </span>
                    </Link>
                ) : (
                    <Link
                        href="/#projects"
                        className="group border-b border-white/10 py-8 text-left transition-colors hover:bg-orange-500 sm:pl-8 sm:text-right"
                    >
                        <span className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-600 group-hover:text-black/60">
                            Back to
                        </span>

                        <span className="text-2xl font-medium text-white transition-colors group-hover:text-black sm:text-3xl">
                            Selected Work →
                        </span>
                    </Link>
                )}
            </nav>
        </main>
    )
}

function SectionLabel({
    number,
    label,
}: {
    number: string
    label: string
}) {
    return (
        <div className="flex items-start gap-3 lg:block">
            <span className="text-sm text-zinc-600">{number}</span>

            <span className="text-sm uppercase tracking-[0.2em] text-zinc-500 lg:mt-2 lg:block">
                {label}
            </span>
        </div>
    )
}

function TechnicalRow({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="grid gap-2 py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
            <span className="text-sm text-zinc-500">
                {label}
            </span>

            <p className="leading-relaxed text-zinc-300">
                {value}
            </p>
        </div>
    )
}