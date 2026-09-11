import CertificateCard from "./CertificateCard"
import { certificates } from "@/libs/data/certificates"

export default function Certificates() {
    return (
        <section className="px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl">
                {/* Section heading */}
                <div className="mb-16 max-w-3xl">
                    <div className="mb-5 flex items-center gap-3 text-sm">
                        <span className="font-medium text-orange-500">
                            Certificates
                        </span>

                        <span className="h-px w-8 bg-white/20" />

                        <span className="uppercase tracking-[0.2em] text-white/40">
                            Education & Training
                        </span>
                    </div>

                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Certificates & Training
                    </h1>

                    <p className="max-w-2xl text-lg leading-8 text-white/60">
                        A record of the courses and developer training that
                        have contributed to my growth across frontend,
                        backend, and full-stack development.
                    </p>
                </div>

                {/* Certificates */}
                <div className="grid gap-x-8 gap-y-20 md:grid-cols-2">
                    {certificates.map((certificate, index) => (
                        <CertificateCard
                            key={certificate.id}
                            certificate={certificate}
                            number={String(index + 1).padStart(2, "0")}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}