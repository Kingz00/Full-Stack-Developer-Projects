import React from "react"
import { Link, useSearchParams, useLoaderData, defer, Await } from "react-router-dom"
import { getVans } from "../../api"

export function loader() {
    return defer({ vans: getVans() })
}

export default function Vans() {
    const [searchParams, setSearchParams] = useSearchParams()
    const deferredVans = useLoaderData()

    const typeFilter = searchParams.get("type")

    function handleFilterChange(key, value) {
        setSearchParams(prevParams => {
            if (value === null) {
                prevParams.delete(key)
            } else {
                prevParams.set(key, value)
            }
            return prevParams
        })
    }

    const renderVanElements = (vans) => {
        const displayedVans = typeFilter
            ? vans.filter(van => van.type === typeFilter)
            : vans

        const vanElements = displayedVans.map(van => (
            <div key={van.id} className="van-tile">
                <Link
                    to={van.id}
                    state={{
                        search: `?${searchParams.toString()}`,
                        type: typeFilter
                    }}
                >
                    <img src={van.imageUrl} />
                    <div className="van-info">
                        <h3>{van.name}</h3>
                        <p>${van.price}<span>/day</span></p>
                    </div>
                    <i className={`van-type ${van.type} selected`}>{van.type}</i>
                </Link>
            </div>
        ))

        return (
            <>
                <div className="van-list-filter-buttons">
                    <button
                        onClick={() => handleFilterChange("type", "simple")}
                        className={
                            `van-type simple 
                        ${typeFilter === "simple" ? "selected" : ""}`
                        }
                    >Simple</button>
                    <button
                        onClick={() => handleFilterChange("type", "luxury")}
                        className={
                            `van-type luxury 
                        ${typeFilter === "luxury" ? "selected" : ""}`
                        }
                    >Luxury</button>
                    <button
                        onClick={() => handleFilterChange("type", "rugged")}
                        className={
                            `van-type rugged 
                        ${typeFilter === "rugged" ? "selected" : ""}`
                        }
                    >Rugged</button>

                    {typeFilter ? (
                        <button
                            onClick={() => handleFilterChange("type", null)}
                            className="van-type clear-filters"
                        >Clear filter</button>
                    ) : null}

                </div>
                {displayedVans.length > 0 ? (
                    <div className="van-list">
                        {vanElements}
                    </div>
                ) : (
                    <div className="van-list-empty">
                        <h2>No vans found</h2>
                        <p>
                            There are no vans available for this filter.
                        </p>

                        <button
                            onClick={() => handleFilterChange("type", null)}
                            className="van-type clear-filters"
                        >
                            View all vans
                        </button>
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="van-list-container">
            <h1>Explore our van options</h1>
            <React.Suspense fallback={<div className="loading">Loading vans data</div>}>
                <Await resolve={deferredVans.vans}>
                    {renderVanElements}
                </Await>
            </React.Suspense>
        </div>
    )

}