import NotFoundUI from '@/app/components/NotFoundUI'

export default function PageNotFound() {
    return (
        <NotFoundUI
            title="Page Not Found"
            subTitle="Sorry, we can't find the requested page"
            linkText="Go back Home"
            linkHref="/"
        />
    )
}