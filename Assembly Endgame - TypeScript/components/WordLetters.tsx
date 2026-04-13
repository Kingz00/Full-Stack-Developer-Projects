import type { JSX } from 'react'

const WordLetters = ({ wordDisplayEls }: { wordDisplayEls: JSX.Element[] }): JSX.Element => {
    return (
        <section className="word-display">
            {wordDisplayEls}
        </section>
    )
}

export default WordLetters