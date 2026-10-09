import { Link, useLoaderData, useNavigate, useRouteLoaderData } from 'react-router-dom'

import type { AuthUser } from '../../auth/loaders/authLoader'
import type { Hero } from '../loaders/heroesLoader'

import './HeroSelectionPage.css'

import healthIcon from '../../../assets/icons/health.svg'
import attackIcon from '../../../assets/icons/attack.svg'
import defenseIcon from '../../../assets/icons/defense.svg'

import heroDivider from '../../../assets/decorations/hero-selection-divider.png'
import cardFrame from '../../../assets/decorations/hero-card-frame-responsive.svg'


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
            <div className="hero-selection__atmosphere" />

            <div className="hero-selection__content">
                <header className="hero-selection__header">
                    <h1 className="hero-selection__title">
                        Choose Your Hero
                    </h1>

                    <p className="hero-selection__subtitle">
                        Forged by fate. Tested by the dice.
                    </p>

                    <img
                        className="hero-selection__divider"
                        src={heroDivider}
                        alt=""
                        aria-hidden="true"
                    />
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
                                        <dt>
                                            <img
                                                src={healthIcon}
                                                alt=""
                                                aria-hidden="true"
                                            />
                                            <span>HP</span>
                                        </dt>

                                        <dd>{hero.health}</dd>
                                    </div>

                                    <div className="hero-card__stat">
                                        <dt>
                                            <img
                                                src={attackIcon}
                                                alt=""
                                                aria-hidden="true"
                                            />
                                            <span>ATK</span>
                                        </dt>

                                        <dd>{hero.attack}</dd>
                                    </div>

                                    <div className="hero-card__stat">
                                        <dt>
                                            <img
                                                src={defenseIcon}
                                                alt=""
                                                aria-hidden="true"
                                            />
                                            <span>DEF</span>
                                        </dt>

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

                            <img
                                className="hero-card__frame"
                                src={cardFrame}
                                alt=""
                                aria-hidden="true"
                            />
                        </article>
                    ))}
                </section>

                <p className="hero-selection__quote">
                    "In the end, we all roll the same dice."
                </p>

                <nav className="hero-selection__footer-nav" aria-label="Additional navigation">
                    <Link to="/about">About the Game</Link>
                </nav>
            </div>
        </main>
    )
}

export default HeroSelectionPage