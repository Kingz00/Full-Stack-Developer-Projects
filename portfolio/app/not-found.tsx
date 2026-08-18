import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center px-6 text-center">
            <div>
                <p className="mb-4 text-sm font-medium tracking-widest text-orange-400">
                    404
                </p>

                <h1 className="mb-4 text-4xl font-bold text-white">
                    Page not found
                </h1>

                <p className="mx-auto mb-8 max-w-md text-gray-400">
                    The page you’re looking for doesn’t exist or may have been moved.
                </p>

                <Link
                    href="/"
                    className="inline-flex rounded-full bg-orange-600 px-6 py-3 font-medium text-white transition hover:bg-orange-500"
                >
                    Back to Home
                </Link>
            </div>
        </main>
    );
}