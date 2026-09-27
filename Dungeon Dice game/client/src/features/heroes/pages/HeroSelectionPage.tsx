import { useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom'

import type { AuthUser } from '../../auth/loaders/authLoader'
import type { Hero } from '../loaders/heroesLoader'

import './HeroSelectionPage.css'

function HeroSelectionPage() {
    const heroes = useLoaderData() as Hero[]
    const user = useRouteLoaderData('root') as AuthUser | null

    const navigate = useNavigate()

    function handleHeroSelect(heroId: number) {
        if (!user) {
            navigate(`/login?heroId=${heroId}`)
            return
        }

        navigate(`/game?heroId=${heroId}`)
    }

    return (
        <main className="hero-selection">
            <header className="hero-selection__header">
                <h1 className="hero-selection__title">
                    Choose Your Hero
                </h1>

                <p className="hero-selection__subtitle">
                    Select a hero to begin your dungeon adventure.
                </p>
            </header>

            <section
                className="hero-selection__grid"
                aria-label="Available heroes"
            >
                {heroes.map((hero) => (
                    <article
                        className="hero-card"
                        key={hero.id}
                    >
                        <div className="hero-card__image-wrapper">
                            <img
                                className="hero-card__image"
                                src={hero.imageUrl}
                                alt={hero.name}
                            />
                        </div>

                        <div className="hero-card__content">
                            <h2 className="hero-card__name">
                                {hero.name}
                            </h2>

                            <p className="hero-card__description">
                                {hero.description}
                            </p>

                            <dl className="hero-card__stats">
                                <div className="hero-card__stat">
                                    <dt>Health</dt>
                                    <dd>{hero.health}</dd>
                                </div>

                                <div className="hero-card__stat">
                                    <dt>Attack</dt>
                                    <dd>{hero.attack}</dd>
                                </div>

                                <div className="hero-card__stat">
                                    <dt>Defense</dt>
                                    <dd>{hero.defense}</dd>
                                </div>
                            </dl>

                            <button
                                className="hero-card__button"
                                type="button"
                                onClick={() =>
                                    handleHeroSelect(hero.id)
                                }
                            >
                                Select Hero
                            </button>
                        </div>
                    </article>
                ))}
            </section>
        </main>
    )
}

export default HeroSelectionPage