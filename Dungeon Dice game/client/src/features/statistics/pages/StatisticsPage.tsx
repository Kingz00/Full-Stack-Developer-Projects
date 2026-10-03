import { useLoaderData, Link } from 'react-router-dom'

import type { StatisticsLoaderData } from '../types'

import './StatisticsPage.css'

export default function StatisticsPage() {
    const { statistics } = useLoaderData() as StatisticsLoaderData

    return (
        <main className="statistics-page">
            <header className="statistics-page__header">
                <h1>Player Statistics</h1>
                <p>Your Dungeon Battle Record</p>
            </header>

            <section
                className="statistics-page__metrics"
                aria-label="Battle statistics"
            >
                <article className="statistics-card">
                    <span className="statistics-card__label">
                        Total Battles
                    </span>

                    <strong className="statistics-card__value">
                        {statistics.totalBattles}
                    </strong>
                </article>

                <article className="statistics-card">
                    <span className="statistics-card__label">
                        Wins
                    </span>

                    <strong className="statistics-card__value">
                        {statistics.wins}
                    </strong>
                </article>

                <article className="statistics-card">
                    <span className="statistics-card__label">
                        Losses
                    </span>

                    <strong className="statistics-card__value">
                        {statistics.losses}
                    </strong>
                </article>

                <article className="statistics-card">
                    <span className="statistics-card__label">
                        Draws
                    </span>

                    <strong className="statistics-card__value">
                        {statistics.draws}
                    </strong>
                </article>
            </section>

            <section
                className="best-run"
                aria-labelledby="best-run-heading"
            >
                <h2 id="best-run-heading">Best Run</h2>

                {statistics.bestRun ? (
                    <div className="best-run__content">
                        <h3>Run #{statistics.bestRun.runNumber}</h3>

                        <p>
                            {statistics.bestRun.totalBattles}{' '}
                            {statistics.bestRun.totalBattles === 1
                                ? 'Battle'
                                : 'Battles'}{' '}
                            Completed
                        </p>

                        <dl className="best-run__stats">
                            <div>
                                <dt>Wins</dt>
                                <dd>{statistics.bestRun.wins}</dd>
                            </div>

                            <div>
                                <dt>Losses</dt>
                                <dd>{statistics.bestRun.losses}</dd>
                            </div>

                            <div>
                                <dt>Draws</dt>
                                <dd>{statistics.bestRun.draws}</dd>
                            </div>
                        </dl>
                    </div>
                ) : (
                    <p className="best-run__empty">
                        You have not completed a run yet.
                    </p>
                )}
            </section>

            <div className="statistics-page__actions">
                <Link to="/">
                    Return to Dungeon
                </Link>
            </div>
        </main>
    )
}