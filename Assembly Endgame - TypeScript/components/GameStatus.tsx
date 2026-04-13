import type { JSX } from 'react'
import { clsx } from 'clsx'
import { getFarewellText } from '../src/utils'


type PropTypes = {
    isGameWon: boolean
    isGameOver: boolean
    wrongGuessCount: number
    isLastGuessIncorrect: boolean | string
    eliminatedLang: string
}

const GameStatus = ({ isGameWon, isGameOver, wrongGuessCount, isLastGuessIncorrect, eliminatedLang }: PropTypes): JSX.Element => {

    if (isGameOver || isGameWon) {
        return (
            <section aria-live="polite" role="status" className={clsx("game-status", isGameWon && "won", isGameOver && "lost")}>
                <h2>{clsx(isGameWon && "You Win!", isGameOver && "Game over!")}</h2>
                <p>{clsx(isGameWon && "Well done! 🎉", isGameOver && "You lose! Better start learning Assembly 😞")}</p>
            </section>
        )
    } else if (wrongGuessCount > 0 && isLastGuessIncorrect) {
        return (
            <section aria-live="polite" role="status" className={clsx("game-status", "farewell-message")}>
                <p>{getFarewellText(eliminatedLang)}</p>
            </section>
        )
    } else {
        return (
            <section className="game-status">
                <h2></h2>
                <p></p>
            </section>
        )
    }
}

export default GameStatus