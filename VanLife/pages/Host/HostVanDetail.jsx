import React from "react"
import { Link, NavLink, Outlet, useLoaderData, defer, Await, Form, redirect, useNavigation, useActionData } from "react-router-dom"
import { getHostVan, removeHostVan } from "../../api"
import { requireAuth } from "../../utils"

export async function loader({ params, request }) {
    await requireAuth(request)
    return defer({ hostVanDetail: getHostVan(params.id) })
}

export async function action({ params }) {
    try {
        await removeHostVan(params.id)

        return redirect("/host")
    } catch (error) {
        console.error("Remove host van error:", error)
        return {
            error: "Unable to remove this van. Please try again."
        }
    }
}

export default function HostVanDetail() {
    const currentVanPromise = useLoaderData()
    const navigation = useNavigation()
    const actionData = useActionData()

    const isSubmitting = navigation.state === "submitting"

    const activeStyles = {
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#161616"
    }

    return (
        <section>
            <Link
                to=".."
                relative="path"
                className="back-button"
            >&larr; <span>Back to all vans</span></Link>

            <React.Suspense fallback={<h2>Loading host van detail...</h2>}>
                <Await resolve={currentVanPromise.hostVanDetail}>
                    {(currentVan) => {
                        return (
                            <div className="host-van-detail-layout-container">
                                <div className="host-van-detail">
                                    <img src={currentVan.imageUrl} />
                                    <div className="host-van-detail-info-text">
                                        <i
                                            className={`van-type van-type-${currentVan.type}`}
                                        >
                                            {currentVan.type}
                                        </i>
                                        <h3>{currentVan.name}</h3>
                                        <h4>${currentVan.price}/day</h4>
                                    </div>
                                </div>

                                <nav className="host-van-detail-nav">
                                    <NavLink
                                        to="."
                                        end
                                        style={({ isActive }) => isActive ? activeStyles : null}
                                    >
                                        Details
                                    </NavLink>
                                    <NavLink
                                        to="pricing"
                                        style={({ isActive }) => isActive ? activeStyles : null}
                                    >
                                        Pricing
                                    </NavLink>
                                    <NavLink
                                        to="photos"
                                        style={({ isActive }) => isActive ? activeStyles : null}
                                    >
                                        Photos
                                    </NavLink>
                                </nav>
                                <Outlet context={{ currentVan }} />
                                <Form method="post">
                                    <button
                                        className="link-button"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Removing..." : "Remove from my vans"}
                                    </button>
                                </Form>
                                {actionData?.error && (
                                    <p className="error-message">
                                        {actionData.error}
                                    </p>
                                )}
                            </div>)
                    }}
                </Await>
            </React.Suspense>

        </section>
    )
}
