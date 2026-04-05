import React from "react"
import LanguagesList from "./LanguagesList"
import { languages } from "../languages"

const AssemblyEndGame = () => {

    const [currentWord, setCurrentWord] = React.useState(["r", "e", "a", "c", "t"])

    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    const langList = languages.map((langObj) => {
        const langStyles = {
            backgroundColor: langObj.backgroundColor,
            color: langObj.color
        }
        return <li key={langObj.name} style={langStyles}>{langObj.name}</li>
    })

    const wordDisplayEls = currentWord.map((letter, index) => {
        return <span key={index}>{letter}</span>
    })

    const keyboardBtns = alphabet.split("").map((letter) => {
        return <button key={letter} >{letter.toUpperCase()}</button>
    })


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