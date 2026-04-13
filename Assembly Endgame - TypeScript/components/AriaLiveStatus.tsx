import type { JSX } from 'react'

type AriaElsType = {
    currentWord: Array<string>
    lastGuessedLetter: string
    guessedWord: Array<string>
}

const AriaLiveStatus = ({ currentWord, lastGuessedLetter, guessedWord }: AriaElsType): JSX.Element => {
    return (
        <section className="sr-only" aria-live="polite" role="status">
            <p>
                {currentWord.includes(lastGuessedLetter) ?
                    `Correct! The letter ${lastGuessedLetter} is in the word.` :
                    `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
            </p>
            <p>Current word: {currentWord.map(letter => guessedWord.includes(letter) ? letter + "." : "blank.").join(" ")}</p>
        </section>
    )
}

export default AriaLiveStatus