import Image from 'next/image'

const LoadingUI = ({ children }: { children: React.ReactNode }) => {
    return (
        <main>
            <h1 className="font-bold text-2xl text-orange-400 text-center mb-4">{children}</h1>
            <Image
                src="/spinner.svg"
                alt="Loading..."
                width={100}
                height={100}
                className="w-20 h-20 mx-auto"
            />
        </main>
    )
}

export default LoadingUI