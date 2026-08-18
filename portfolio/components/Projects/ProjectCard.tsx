import type { Project } from "@/libs/types/project"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

type ProjectCardProps = {
    project: Project
    number: string
}

export default function ProjectCard({
    project,
    number,
}: ProjectCardProps) {
    return (
        <article className="group">
            {/* Project image */}
            <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <Image
                    src={project.image}
                    alt={`${project.title} project screenshot`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Image overlay */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
            </div>

            {/* Project metadata */}
            <div className="mb-3 flex items-center gap-3 text-sm">
                <span className="font-medium text-orange-500">
                    {number}
                </span>
            </div>

            {/* Title */}
            <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold tracking-tight text-white transition-colors duration-300 group-hover:text-orange-400 sm:text-3xl">
                    {project.title}
                </h3>
            </div>

            {/* Description */}
            <p className="mb-5 max-w-xl leading-7 text-white/60">
                {project.description}
            </p>

            {/* Technologies */}
            <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2">
                {project.featuredTechnologies.map((technology) => (
                    <span
                        key={technology}
                        className="text-sm text-white/40"
                    >
                        {technology}
                    </span>
                ))}
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center gap-4">
                <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-2 font-medium text-white transition-opacity hover:text-orange-400"
                >
                    View Project
                    <span aria-hidden="true">→</span>
                </Link>

                <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
                >
                    Live Demo
                    <span aria-hidden="true">↗</span>
                </a>

                <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
                >
                    GitHub
                    <span aria-hidden="true">↗</span>
                </a>
            </div>
        </article>
    )
}