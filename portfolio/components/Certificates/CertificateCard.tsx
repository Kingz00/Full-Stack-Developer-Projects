import Image from "next/image"
import type { Certificate } from "@/libs/types/certificate"

type CertificateCardProps = {
    certificate: Certificate
    number: string
}

export default function CertificateCard({
    certificate,
    number,
}: CertificateCardProps) {
    return (
        <article className="group">
            {/* Certificate image */}
            <div className="relative mb-6 aspect-[16/11] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <Image
                    src={certificate.image}
                    alt={`${certificate.title} certificate`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
            </div>

            {/* Certificate metadata */}
            <div className="mb-3 flex items-center gap-3 text-sm">
                <span className="font-medium text-orange-500">
                    {number}
                </span>

                <span className="h-px w-6 bg-white/10" />

                <span className="text-white/40">
                    {certificate.issuer}
                </span>
            </div>

            {/* Title */}
            <h3 className="mb-3 text-2xl font-semibold tracking-tight text-white transition-colors duration-300 group-hover:text-orange-400 sm:text-3xl">
                {certificate.title}
            </h3>

            {/* Description */}
            <p className="mb-4 max-w-xl leading-7 text-white/60">
                {certificate.description}
            </p>

            {/* Date */}
            {certificate.date && (
                <p className="mb-5 text-sm text-white/40">
                    Completed {certificate.date}
                </p>
            )}

            {/* Certificate link */}
            {certificate.url && (
                <a
                    href={certificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-white transition-colors hover:text-orange-400"
                >
                    View Certificate
                    <span aria-hidden="true">↗</span>
                </a>
            )}
        </article>
    )
}