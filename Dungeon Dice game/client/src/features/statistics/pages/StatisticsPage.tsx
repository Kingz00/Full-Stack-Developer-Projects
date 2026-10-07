import { useLoaderData, Link } from 'react-router-dom'

import type { StatisticsLoaderData } from '../types'

import totalBattlesIcon from '../../../assets/icons/statistics/total-battles.png'
import winsIcon from '../../../assets/icons/statistics/wins.png'
import lossesIcon from '../../../assets/icons/statistics/losses.png'
import drawsIcon from '../../../assets/icons/statistics/draws.png'
import bestRunEmblem from '../../../assets/decorations/best-run-emblem.png'
import heroDivider from '../../../assets/decorations/hero-selection-divider.png'

import './StatisticsPage.css'

const statisticCards = [
    { key: 'totalBattles', label: 'Total Battles', icon: totalBattlesIcon },
    { key: 'wins', label: 'Wins', icon: winsIcon },
    { key: 'losses', label: 'Losses', icon: lossesIcon },
    { key: 'draws', label: 'Draws', icon: drawsIcon },
] as const

export default function StatisticsPage() {
    const { statistics } = useLoaderData() as StatisticsLoaderData

    return (
        <main className="statistics-page">
            <div className="statistics-page__content">
                <header className="statistics-page__header">
                    <h1>Battle Record</h1>

                    <img
                        className="statistics-page__divider"
                        src={heroDivider}
                        alt=""
                        aria-hidden="true"
                    />

                    <p>Your Journey Through the Dungeon</p>
                </header>

                <section
                    className="statistics-page__metrics"
                    aria-label="Battle statistics"
                >
                    {statisticCards.map(({ key, label, icon }) => (
                        <article
                            className={`statistics-card statistics-card--${key}`}
                            key={key}
                        >
                            <div className="statistics-card__icon-frame">
                                <img
                                    className="statistics-card__icon"
                                    src={icon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>

                            <strong className="statistics-card__value">
                                {statistics[key]}
                            </strong>

                            <h2 className="statistics-card__label">
                                {label}
                            </h2>
                        </article>
                    ))}
                </section>

                <section
                    className="best-run"
                    aria-labelledby="best-run-heading"
                >
                    {statistics.bestRun ? (
                        <div className="best-run__layout">
                            <div className="best-run__identity">
                                <img
                                    className="best-run__emblem"
                                    src={bestRunEmblem}
                                    alt=""
                                    aria-hidden="true"
                                />

                                <div className="best-run__title-group">
                                    <h2 id="best-run-heading">Best Run</h2>
                                    <p className="best-run__number">
                                        Run #{statistics.bestRun.runNumber}
                                    </p>
                                    <p className="best-run__completed">
                                        {statistics.bestRun.totalBattles}{' '}
                                        {statistics.bestRun.totalBattles === 1
                                            ? 'Battle'
                                            : 'Battles'}{' '}
                                        Completed
                                    </p>
                                </div>
                            </div>

                            <dl className="best-run__stats">
                                <div className="best-run__stat best-run__stat--wins">
                                    <img src={winsIcon} alt="" aria-hidden="true" />
                                    <dd>{statistics.bestRun.wins}</dd>
                                    <dt>Wins</dt>
                                </div>

                                <div className="best-run__stat best-run__stat--losses">
                                    <img src={lossesIcon} alt="" aria-hidden="true" />
                                    <dd>{statistics.bestRun.losses}</dd>
                                    <dt>Losses</dt>
                                </div>

                                <div className="best-run__stat best-run__stat--draws">
                                    <img src={drawsIcon} alt="" aria-hidden="true" />
                                    <dd>{statistics.bestRun.draws}</dd>
                                    <dt>Draws</dt>
                                </div>
                            </dl>
                        </div>
                    ) : (
                        <div className="best-run__empty">
                            <h2 id="best-run-heading">Best Run</h2>
                            <p>You have not completed a run yet.</p>
                        </div>
                    )}
                </section>

                <div className="statistics-page__actions">
                    <Link to="/">Return to Dungeon</Link>
                </div>
            </div>
        </main>
    )
}