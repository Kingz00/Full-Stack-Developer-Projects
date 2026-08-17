import type { Project } from "@/libs/types/project"
import Image from "next/image"

type ProjectCardProps = {
    project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {/* Project image */}
            <div className="relative aspect-video overflow-hidden">
                <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Project content */}
            <div className="p-6">
                <h3 className="mb-3 text-2xl font-semibold text-white">
                    {project.title}
                </h3>

                <p className="mb-5 leading-7 text-white/70">
                    {project.description}
                </p>

                {/* Technologies */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                        <span
                            key={technology}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70"
                        >
                            {technology}
                        </span>
                    ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-4">
                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-orange-400"
                        >
                            Live Demo
                        </a>
                    )}

                    <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </article>
    )
}