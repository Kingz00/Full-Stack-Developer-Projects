import React from "react"
import LanguagesList from "./LanguagesList"
import { languages } from "../languages"

const AssemblyEndGame = () => {

    const [currentWord, setCurrentWord] = React.useState(["r", "e", "a", "c", "t"])

    const langList = languages.map((langObj) => {
        const langStyles = {
            backgroundColor: langObj.backgroundColor,
            color: langObj.color
        }
        return <li key={langObj.name} style={langStyles}>{langObj.name}</li>
    })

    const wordDisplayEls = currentWord.map((letter) => {
        return <span>{letter}</span>
    })


    return (

        <>
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
            </main>
        </>
    )
}

export default AssemblyEndGame