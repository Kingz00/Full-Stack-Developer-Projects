import type { Metadata } from "next"
import Certificates from "@/components/Certificates/Certificates"

export const metadata: Metadata = {
    title: "Certificates",
    description:
        "Certificates and developer training completed by Kingsley Onwupeluonye.",
}

export default function CertificatesPage() {
    return <main className="pt-20"><Certificates /></main>
}