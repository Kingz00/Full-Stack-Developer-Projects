import React from "react"
import { Link, useLocation, useLoaderData, defer, Await, redirect, Form, useNavigation, useActionData } from "react-router-dom"
import { getVan, addHostVan, isHostVan } from "../../api"
import { requireAuth } from "../../utils"

export function loader({ params }) {
    return defer({ vanDetail: getVan(params.id), isHostVan: isHostVan(params.id) })
}

export async function action({ request, params }) {
    try {
        await requireAuth(request)
        await addHostVan(params.id)

        return redirect(`/vans/${params.id}`)
    } catch (error) {
        if (error instanceof Response) {
            throw error
        }

        console.error("Add host van error:", error)

        return {
            error: "Unable to add this van. Please try again."
        }
    }
}

export default function VanDetail() {
    const location = useLocation()
    const vanPromise = useLoaderData()
    const navigation = useNavigation()
    const actionData = useActionData()

    const search = location.state?.search || "";
    const type = location.state?.type || "all";
    const isSubmitting = navigation.state === "submitting"

    return (
        <div className="van-detail-container">
            <Link
                to={`..${search}`}
                relative="path"
                className="back-button"
            >&larr; <span>Back to {type} vans</span></Link>
            <React.Suspense fallback={<h2>Loading van detail...</h2>}>
                <Await resolve={vanPromise.vanDetail}>
                    {(van) => (
                        <Await resolve={vanPromise.isHostVan}>
                            {(alreadyAdded) => {
                                return (
                                    <div className="van-detail">
                                        <img src={van.imageUrl} />
                                        <i className={`van-type ${van.type} selected`}>
                                            {van.type}
                                        </i>
                                        <h2>{van.name}</h2>
                                        <p className="van-price"><span>${van.price}</span>/day</p>
                                        <p>{van.description}</p>
                                        {alreadyAdded ? (
                                            <button
                                                className="link-button"
                                                disabled
                                            >
                                                Added to my vans
                                            </button>
                                        ) : (
                                            <Form method="post">
                                                <button
                                                    className="link-button"
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? "Adding..." : "Add to my vans"}
                                                </button>
                                            </Form>
                                        )}
                                        {actionData?.error && (
                                            <p className="error-message">
                                                {actionData.error}
                                            </p>
                                        )}
                                    </div>
                                )
                            }}
                        </Await>
                    )}
                </Await>
            </React.Suspense>

        </div>
    )
}