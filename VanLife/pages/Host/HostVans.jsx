import React from "react"
import { Link, useLoaderData, defer, Await } from "react-router-dom"
import { getHostVans } from "../../api"
import { requireAuth } from "../../utils"

export async function loader({ request }) {
    await requireAuth(request)
    return defer({ hostVans: getHostVans() })
}

export default function HostVans() {
    const hostVansPromise = useLoaderData()

    const renderHostVans = (vans) => {
        const hostVansEls = vans.map(van => (
            <Link
                to={van.id}
                key={van.id}
                className="host-van-link-wrapper"
            >
                <div className="host-van-single" key={van.id}>
                    <img src={van.imageUrl} alt={`Photo of ${van.name}`} />
                    <div className="host-van-info">
                        <h3>{van.name}</h3>
                        <p>${van.price}/day</p>
                    </div>
                </div>
            </Link>
        ))

        return (
            vans.length > 0 ? (
                <section>
                    <h1 className="host-vans-title">Your listed vans</h1>
                    <div className="host-vans-list">
                        <section>
                            {hostVansEls}
                        </section>
                    </div>
                </section>
            ) : (
                <section className="host-vans-empty">
                    <h2>You don't have any vans yet.</h2>

                    <p>
                        Browse the available vans and add one to your host collection.
                    </p>

                    <Link to="/vans" className="link-button">
                        Browse vans
                    </Link>
                </section>
            )
        )
    }

    return (
        <React.Suspense fallback={<h2>Loading host vans...</h2>}>
            <Await resolve={hostVansPromise.hostVans}>
                {renderHostVans}
            </Await>
        </React.Suspense>
    )
}