import { Link, useLoaderData } from 'react-router-dom'

import type { BattleLoaderData } from '../loaders/battleLoader'

import './BattlePage.css'

function getHealthPercentage(health: number, maxHealth: number) {
    if (maxHealth <= 0) {
        return 0
    }

    return Math.min(100, Math.max(0, (health / maxHealth) * 100))
}

function getBattleStatusLabel(status: string) {
    switch (status) {
        case 'active':
            return 'Active'
        case 'won':
            return 'Victory'
        case 'lost':
            return 'Defeat'
        case 'draw':
            return 'Draw'
        case 'abandoned':
            return 'Abandoned'
        default:
            return status
    }
}

function BattlePage() {
    const { battle, hero } = useLoaderData() as BattleLoaderData

    const playerHealthPercentage =
        getHealthPercentage(
            battle.playerHealth,
            battle.playerMaxHealth
        )

    const enemyHealthPercentage =
        getHealthPercentage(
            battle.enemyHealth,
            battle.enemyMaxHealth
        )

    return (
        <main className="battle-page">
            <div className="battle-page__topbar">
                <Link
                    className="battle-page__back-link"
                    to="/game"
                >
                    ← Return to Run
                </Link>

                <p className="battle-page__run">
                    Run #{battle.runId}
                </p>
            </div>

            <header className="battle-page__header">
                <p className="battle-page__eyebrow">
                    Dungeon Battle
                </p>

                <h1 className="battle-page__title">
                    Face Your Opponent
                </h1>

                <p className="battle-page__subtitle">
                    Prepare for battle and overcome your enemy.
                </p>
            </header>

            <section
                className="battle-page__arena"
                aria-label="Battle arena"
            >
                <article className="battle-page__fighter">
                    <div className="battle-page__image-wrapper">
                        <img
                            className="battle-page__image"
                            src={hero.imageUrl}
                            alt={hero.name}
                        />
                    </div>

                    <div className="battle-page__fighter-content">
                        <p className="battle-page__label">
                            Your Hero
                        </p>

                        <h2 className="battle-page__fighter-name">
                            {hero.name}
                        </h2>

                        <div className="battle-page__health">
                            <div className="battle-page__health-header">
                                <span>Health</span>

                                <strong>
                                    {battle.playerHealth} /{' '}
                                    {battle.playerMaxHealth}
                                </strong>
                            </div>

                            <div
                                className="battle-page__health-bar"
                                role="progressbar"
                                aria-label={`${hero.name} health`}
                                aria-valuemin={0}
                                aria-valuemax={battle.playerMaxHealth}
                                aria-valuenow={battle.playerHealth}
                            >
                                <span
                                    className="battle-page__health-fill battle-page__health-fill--player"
                                    style={{
                                        width: `${playerHealthPercentage}%`
                                    }}
                                />
                            </div>
                        </div>

                        <dl className="battle-page__stats">
                            <div className="battle-page__stat">
                                <dt>Health</dt>
                                <dd>{hero.health}</dd>
                            </div>

                            <div className="battle-page__stat">
                                <dt>Attack</dt>
                                <dd>{hero.attack}</dd>
                            </div>

                            <div className="battle-page__stat">
                                <dt>Defense</dt>
                                <dd>{hero.defense}</dd>
                            </div>
                        </dl>
                    </div>
                </article>

                <div
                    className="battle-page__versus"
                    aria-hidden="true"
                >
                    <span>VS</span>
                </div>

                <article className="battle-page__fighter">
                    <div className="battle-page__image-wrapper">
                        <img
                            className="battle-page__image"
                            src={battle.enemyImageUrl}
                            alt={battle.enemyName}
                        />
                    </div>

                    <div className="battle-page__fighter-content">
                        <p className="battle-page__label">
                            Opponent
                        </p>

                        <h2 className="battle-page__fighter-name">
                            {battle.enemyName}
                        </h2>

                        <div className="battle-page__health">
                            <div className="battle-page__health-header">
                                <span>Health</span>

                                <strong>
                                    {battle.enemyHealth} /{' '}
                                    {battle.enemyMaxHealth}
                                </strong>
                            </div>

                            <div
                                className="battle-page__health-bar"
                                role="progressbar"
                                aria-label={`${battle.enemyName} health`}
                                aria-valuemin={0}
                                aria-valuemax={battle.enemyMaxHealth}
                                aria-valuenow={battle.enemyHealth}
                            >
                                <span
                                    className="battle-page__health-fill battle-page__health-fill--enemy"
                                    style={{
                                        width: `${enemyHealthPercentage}%`
                                    }}
                                />
                            </div>
                        </div>

                        <dl className="battle-page__stats">
                            <div className="battle-page__stat">
                                <dt>Health</dt>
                                <dd>{battle.enemyHealth}</dd>
                            </div>
                            <div className="battle-page__stat">
                                <dt>Attack</dt>
                                <dd>{battle.enemyAttack}</dd>
                            </div>

                            <div className="battle-page__stat">
                                <dt>Defense</dt>
                                <dd>{battle.enemyDefense}</dd>
                            </div>
                        </dl>
                    </div>
                </article>
            </section>

            <section className="battle-page__footer">
                <div className="battle-page__status">
                    <span className="battle-page__status-label">
                        Battle #{battle.id}
                    </span>

                    <span
                        className={`battle-page__status-badge battle-page__status-badge--${battle.status}`}
                    >
                        {getBattleStatusLabel(battle.status)}
                    </span>
                </div>

                <p className="battle-page__instruction">
                    Your battle is ready. The next step will be to
                    take your turn.
                </p>
            </section>
        </main>
    )
}

export default BattlePage