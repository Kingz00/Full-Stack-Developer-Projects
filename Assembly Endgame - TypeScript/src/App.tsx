import React from "react"
import { languages } from "./languages"
import { getRandomWord } from "./utils"
import { clsx } from "clsx"
import type { LanguageType } from "./languages"
import type { JSX } from 'react'

import AriaLiveStatus from "../components/AriaLiveStatus"
import LanguagesList from "../components/LanguagesList"
import ConfettiContainer from "../components/ConfettiContainer"
import Header from "../components/Header"
import GameStatus from "../components/GameStatus"
import Keyboard from "../components/Keyboard"
import WordLetters from "../components/WordLetters"
import NewGameButton from "../components/NewGameButton"

const AssemblyEndGame = () => {
  // State Values
  const [currentWord, setCurrentWord] = React.useState<string[]>((): string[] => getRandomWord())
  const [guessedWord, setGuessedWord] = React.useState<string[]>([])
  const [randomIndexArr, setRandomIndexArr] = React.useState<number[]>([])
  const [eliminatedLang, setEliminatedLang] = React.useState<string>("")

  // Static Values
  const alphabet = "abcdefghijklmnopqrstuvwxyz"

  // Derived Values
  const wrongGuessCount: number = guessedWord.reduce((acc: number, currentVal: string): number => {
    return !currentWord.includes(currentVal) ? acc + 1 : acc
  }, 0)

  const isGameWon: boolean = currentWord.every((letter: string): boolean => guessedWord.includes(letter))
  const isGameOver: boolean = wrongGuessCount >= (languages.length - 1) ? true : false
  const lastGuessedLetter: string = guessedWord[guessedWord.length - 1]
  const isLastGuessIncorrect: string | boolean = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

  // useEffect
  React.useEffect(() => {
    let randomIndex: number
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


  const langList: JSX.Element[] = languages.map((langObj: LanguageType, index: number): JSX.Element => {

    // Alternate method to strike out a language if the user's guess is wrong (in a non-random order)
    // const isLanguageLost = index < wrongGuessCount
    // const lostLanguage = clsx(isLanguageLost && "lost")

    const langStyles: Omit<LanguageType, "name"> = {
      backgroundColor: langObj.backgroundColor,
      color: langObj.color
    }
    const lostLanguage: string = clsx(randomIndexArr.includes(index) && "lost")
    return <li key={langObj.name} style={langStyles} className={lostLanguage}>{langObj.name}</li>
  })


  const wordDisplayEls: JSX.Element[] = currentWord.map((letter: string, index: number): JSX.Element => {
    const letterClassName: string = clsx(isGameOver && !guessedWord.includes(letter) && "missed-letter")
    return <span key={index}
      className={letterClassName}
    >{guessedWord.includes(letter) || isGameOver ? letter : ""}</span>
  })


  const keyboardBtns: JSX.Element[] = alphabet.split("").map((letter: string): JSX.Element => {

    const isGuessed: boolean = guessedWord.includes(letter)
    const isCorrect: boolean = isGuessed && currentWord.includes(letter)
    const isWrong: boolean = isGuessed && !currentWord.includes(letter)
    const btnClassName: string = clsx(isCorrect && "right-Btn", isWrong && "wrong-Btn")

    return <button key={letter}
      onClick={() => keyboardClick(letter)}
      className={btnClassName}
      disabled={isGameOver || isGameWon ? true : undefined}
      aria-disabled={guessedWord.includes(letter)}
      aria-label={`Letter ${letter}`}>
      {letter.toUpperCase()}
    </button>
  })

  const keyboardClick = (char: string): void => {
    setGuessedWord((prevArr: string[]): string[] => {
      return prevArr.includes(char) ? prevArr : [...prevArr, char]
    })
  }

  const startNewGame = (): void => {
    setGuessedWord([])
    setRandomIndexArr([])
    setCurrentWord(getRandomWord())
  }

  return (
    <main>

      <ConfettiContainer isGameWon={isGameWon} />

      <Header />

      <GameStatus isGameWon={isGameWon}
        isGameOver={isGameOver}
        wrongGuessCount={wrongGuessCount}
        isLastGuessIncorrect={isLastGuessIncorrect}
        eliminatedLang={eliminatedLang} />

      <LanguagesList langList={langList} />

      <WordLetters wordDisplayEls={wordDisplayEls} />

      {/* Some extra accessibility features for screen readers */}
      <AriaLiveStatus currentWord={currentWord}
        lastGuessedLetter={lastGuessedLetter}
        guessedWord={guessedWord} />

      <Keyboard keyboardBtns={keyboardBtns} />

      <NewGameButton isGameOver={isGameOver} isGameWon={isGameWon} startNewGame={startNewGame} />
    </main>
  )
}

export default AssemblyEndGame