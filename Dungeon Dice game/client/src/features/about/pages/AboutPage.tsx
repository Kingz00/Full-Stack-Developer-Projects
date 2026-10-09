import { Link } from 'react-router-dom'

import heroDivider from '../../../assets/decorations/hero-selection-divider.png'

import './AboutPage.css'

const gameSteps = [
    {
        number: 'I',
        title: 'Choose Your Hero',
        description:
            'Select your champion and study their health, attack, and defense before entering the dungeon.',
    },
    {
        number: 'II',
        title: 'Face Your Enemies',
        description:
            'Enter battles, roll the dice, and resolve each round as your hero faces the enemy.',
    },
    {
        number: 'III',
        title: 'Forge Your Record',
        description:
            'Continue your run, face more battles, and review your results in your battle record.',
    },
]

export default function AboutPage() {
    return (
        <main className="about-page">
            <div className="about-page__content">
                <header className="about-page__header">
                    <p className="about-page__eyebrow">
                        A Dungeon Dice Duel Chronicle
                    </p>

                    <h1>Fortune Favors the Bold</h1>

                    <img
                        className="about-page__divider"
                        src={heroDivider}
                        alt=""
                        aria-hidden="true"
                    />

                    <p className="about-page__intro">
                        Step into a dark fantasy dungeon where heroes,
                        enemies, and the roll of the dice shape every battle.
                        Choose your champion, test your strength, and see
                        how far your journey will take you.
                    </p>
                </header>

                <section
                    className="about-page__story"
                    aria-labelledby="about-story-heading"
                >
                    <p className="about-page__section-label">
                        The Challenge
                    </p>

                    <h2 id="about-story-heading">
                        Strategy Meets Chance
                    </h2>

                    <p>
                        Every hero brings their own strengths to the
                        dungeon. Health, attack, and defense help define
                        the fight, while dice-driven rounds bring
                        uncertainty to every encounter.
                    </p>

                    <p>
                        Fight one battle at a time, follow your run as it
                        progresses, and look back on your victories,
                        defeats, and draws in your battle record.
                    </p>
                </section>

                <section
                    className="about-page__steps"
                    aria-labelledby="about-steps-heading"
                >
                    <header className="about-page__section-header">
                        <p className="about-page__section-label">
                            Your Adventure
                        </p>

                        <h2 id="about-steps-heading">
                            How to Play
                        </h2>
                    </header>

                    <div className="about-page__step-grid">
                        {gameSteps.map((step) => (
                            <article
                                className="about-step"
                                key={step.number}
                            >
                                <span
                                    className="about-step__number"
                                    aria-hidden="true"
                                >
                                    {step.number}
                                </span>

                                <h3>{step.title}</h3>

                                <p>{step.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section
                    className="about-page__creator"
                    aria-labelledby="about-creator-heading"
                >
                    <p className="about-page__section-label">
                        Behind the Adventure
                    </p>

                    <h2 id="about-creator-heading">
                        About the Creator
                    </h2>

                    <p>
                        Dungeon Dice Duel is an independent game project
                        created by Kingsley Onwupeluonye, a developer with a passion
                        for technology and gaming. The project brings
                        together fantasy adventure, dice-driven combat,
                        and game progression in an experience where
                        every battle tells a story.
                    </p>

                    <p>
                        Built as a hands-on development project, Dungeon
                        Dice Duel reflects the process of turning an idea
                        into an interactive game, from designing its
                        mechanics to building the systems that support
                        each hero's journey.
                    </p>
                </section>

                <section
                    className="about-page__closing"
                    aria-labelledby="about-closing-heading"
                >
                    <h2 id="about-closing-heading">
                        Your Story Starts Here
                    </h2>

                    <p>
                        Choose your hero. Enter the dungeon. Let the dice
                        decide what comes next.
                    </p>

                    <Link
                        className="about-page__cta"
                        to="/"
                    >
                        Choose Your Hero
                    </Link>
                </section>
            </div>
        </main>
    )
}
