import Link from "next/link"

const NotFoundUI = ({ title, subTitle, linkText, linkHref }
    : { title: string, subTitle: string, linkText: string, linkHref: string }) => {
    return (
        <main className="flex flex-col items-center justify-center gap-2 mt-10">
            <span className="mt-10 text-7xl">🙈</span>
            <h1 className="text-4xl font-semibold">{title}</h1>
            <p>{subTitle}!</p>
            <Link
                href={linkHref}
                className="border-2 border-orange-400 px-3 py-3 rounded-lg text-orange-400 font-semibold"
            >
                {linkText}
            </Link>
        </main>
    )
}

export default NotFoundUI