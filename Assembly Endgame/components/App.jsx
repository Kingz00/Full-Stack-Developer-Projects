import React from "react"
import LanguagesList from "./LanguagesList"
import { languages } from "../languages"
import { clsx } from "clsx"

const AssemblyEndGame = () => {
    // State Values
    const [currentWord, setCurrentWord] = React.useState(["r", "e", "a", "c", "t"])
    const [guessedWord, setGuessedWord] = React.useState([])

    // Static Values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    // Derived Values
    const wrongGuessCount = guessedWord.reduce((acc, currentVal) => {
        return !currentWord.includes(currentVal) ? acc + 1 : acc
    }, 0)
    console.log(wrongGuessCount)

    const langList = languages.map((langObj) => {
        const langStyles = {
            backgroundColor: langObj.backgroundColor,
            color: langObj.color
        }
        return <li key={langObj.name} style={langStyles}>{langObj.name}</li>
    })

    const wordDisplayEls = currentWord.map((letter, index) => {
        return <span key={index}>{guessedWord.includes(letter) ? letter : ""}</span>
    })

    const keyboardBtns = alphabet.split("").map((letter) => {

        const isGuessed = guessedWord.includes(letter)
        const isCorrect = isGuessed && currentWord.includes(letter)
        const isWrong = isGuessed && !currentWord.includes(letter)
        const btnClassName = clsx(isCorrect && "right-Btn", isWrong && "wrong-Btn")

        return <button key={letter}
            onClick={() => keyboardClick(letter)}
            className={btnClassName} >
            {letter.toUpperCase()}
        </button>
    })

    const keyboardClick = (char) => {
        setGuessedWord(prevArr => {
            return prevArr.includes(char) ? prevArr : [...prevArr, char]
        })
    }

    return (
        <main>
            <header>
                <h1>Assembly: Endgame</h1>
                <p>Guess the word within 8 attempts to keep the programming world safe from Assembly!</p>
            </header>

            <section className="game-status">
                <h2>You Win!</h2>
                <p>Well done! 🎉</p>
            </section>

            <LanguagesList langList={langList} />

            <section className="word-display">
                {wordDisplayEls}
            </section>

            <section className="keyboard">
                {keyboardBtns}
            </section>

            <button className="new-game">NEW GAME</button>
        </main>
    )
}

export default AssemblyEndGame