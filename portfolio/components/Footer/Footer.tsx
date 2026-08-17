export default function Footer() {
    return (
        <footer className="px-6 pb-8 pt-12">
            <div className="mx-auto max-w-7xl border-t border-white/10 pt-8">
                <div className="flex flex-col gap-6 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} Kingsley Onwupeluonye
                    </p>

                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/Kingz00"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-white"
                        >
                            GitHub
                        </a>

                        <a
                            href="https://www.linkedin.com/in/kingsley-onwupeluonye-445361258"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-white"
                        >
                            LinkedIn
                        </a>
                    </div>

                    <p>
                        Built with Next.js
                    </p>
                </div>
            </div>
        </footer>
    )
}