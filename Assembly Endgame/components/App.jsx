import React from "react"
import LanguagesList from "./LanguagesList"
import { languages } from "../languages"
import { getFarewellText, getRandomWord } from "../utils"
import { clsx } from "clsx"
import Confetti from "react-confetti"

const AssemblyEndGame = () => {
    // State Values
    const [currentWord, setCurrentWord] = React.useState(() => getRandomWord())
    const [guessedWord, setGuessedWord] = React.useState([])
    const [randomIndexArr, setRandomIndexArr] = React.useState([])
    const [eliminatedLang, setEliminatedLang] = React.useState("")

    // Static Values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    // Derived Values
    const wrongGuessCount = guessedWord.reduce((acc, currentVal) => {
        return !currentWord.includes(currentVal) ? acc + 1 : acc
    }, 0)

    const isGameWon = currentWord.every((letter) => guessedWord.includes(letter))
    const isGameOver = wrongGuessCount >= (languages.length - 1) ? true : false
    const lastGuessedLetter = guessedWord[guessedWord.length - 1]
    const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

    // useEffect
    React.useEffect(() => {
        let randomIndex
        if (wrongGuessCount > 0) {
            randomIndex = Math.floor(Math.random() * (languages.length - 1))
            while (randomIndexArr.includes(randomIndex)) {
                randomIndex = Math.floor(Math.random() * (languages.length - 1))
                if (randomIndexArr.length === (languages.length - 1)) {
                    break
                }
            }
            if (randomIndexArr.length !== (languages.length - 1)) {
                setRandomIndexArr(prev => {
                    return [...prev,
                        randomIndex]
                })
                setEliminatedLang(languages[randomIndex].name)
            }
        }
    }, [wrongGuessCount])


    const langList = languages.map((langObj, index) => {

        // Alternate method to strike out a language if the user's guess is wrong (in a non-random order)
        // const isLanguageLost = index < wrongGuessCount
        // const lostLanguage = clsx(isLanguageLost && "lost")

        const langStyles = {
            backgroundColor: langObj.backgroundColor,
            color: langObj.color
        }

        const lostLanguage = clsx(randomIndexArr.includes(index) && "lost")


        return <li key={langObj.name} style={langStyles} className={lostLanguage}>{langObj.name}</li>
    })


    const wordDisplayEls = currentWord.map((letter, index) => {
        const letterClassName = clsx(isGameOver && !guessedWord.includes(letter) && "missed-letter")
        return <span key={index}
            className={letterClassName}
        >{guessedWord.includes(letter) || isGameOver ? letter : ""}</span>
    })


    const keyboardBtns = alphabet.split("").map((letter) => {

        const isGuessed = guessedWord.includes(letter)
        const isCorrect = isGuessed && currentWord.includes(letter)
        const isWrong = isGuessed && !currentWord.includes(letter)
        const btnClassName = clsx(isCorrect && "right-Btn", isWrong && "wrong-Btn")

        return <button key={letter}
            onClick={() => keyboardClick(letter)}
            className={btnClassName}
            disabled={isGameOver || isGameWon ? "disabled" : null}
            aria-disabled={guessedWord.includes(letter)}
            aria-label={`Letter ${letter}`}>
            {letter.toUpperCase()}
        </button>
    })

    const keyboardClick = (char) => {
        setGuessedWord(prevArr => {
            return prevArr.includes(char) ? prevArr : [...prevArr, char]
        })
    }

    const startNewGame = () => {
        setGuessedWord(prev => prev = [])
        setRandomIndexArr(prev => prev = [])
        return setCurrentWord(prev => prev = getRandomWord())
    }

    return (
        <main>

            {
                isGameWon && <Confetti recycle={false} numberOfPieces={1000} />
            }


            <header>
                <h1>Assembly: Endgame</h1>
                <p>Guess the word within 8 attempts to keep the programming world safe from Assembly!</p>
            </header>

            {isGameOver || isGameWon ?
                <section aria-live="polite" role="status" className={clsx("game-status", isGameWon && "won", isGameOver && "lost")}>
                    <h2>{clsx(isGameWon && "You Win!", isGameOver && "Game over!")}</h2>
                    <p>{clsx(isGameWon && "Well done! 🎉", isGameOver && "You lose! Better start learning Assembly 😞")}</p>
                </section> :
                wrongGuessCount > 0 && isLastGuessIncorrect ?
                    <section aria-live="polite" role="status" className={clsx("game-status", "farewell-message")}>
                        <p>{getFarewellText(eliminatedLang)}</p>
                    </section> :
                    <section className="game-status">
                        <h2></h2>
                        <p></p>
                    </section>
            }

            <LanguagesList langList={langList} />

            <section className="word-display">
                {wordDisplayEls}
            </section>

            {/* Some extra accessibility features for screen readers */}
            <section className="sr-only" aria-live="polite" role="status">
                <p>
                    {currentWord.includes(lastGuessedLetter) ?
                        `Correct! The letter ${lastGuessedLetter} is in the word.` :
                        `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
                </p>
                <p>Current word: {currentWord.map(letter => guessedWord.includes(letter) ? letter + "." : "blank.").join(" ")}</p>
            </section>

            <section className="keyboard">
                {keyboardBtns}
            </section>

            {isGameOver || isGameWon ? <button className="new-game" onClick={startNewGame}>NEW GAME</button> : null}
        </main>
    )
}

export default AssemblyEndGame