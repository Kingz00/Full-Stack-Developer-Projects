import type { Project } from "@/libs/types/project"
import Image from "next/image"
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

                <span className="h-px w-8 bg-white/20" />

                <span className="text-white/40">
                    Featured Project
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
            <div className="flex items-center gap-6">
                {project.liveUrl && (
                    <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-orange-400"
                    >
                        Live Demo

                        <ArrowUpRight
                            size={16}
                            className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                        />
                    </a>
                )}

                <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
                >
                    GitHub

                    <ArrowUpRight
                        size={16}
                        className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                    />
                </a>
            </div>
        </article>
    )
}